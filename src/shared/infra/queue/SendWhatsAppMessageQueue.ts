import * as Sentry from "@sentry/node";

import Bull, { Job } from "bull";

import ISendContactMessageDTO from "@shared/container/providers/WhatsAppProvider/dtos/ISendContactMessageDTO";
import ISendTemplateMessageDTO from "@shared/container/providers/WhatsAppProvider/dtos/ISendTemplateMessageDTO";
import ISendTextMessageDTO from "@shared/container/providers/WhatsAppProvider/dtos/ISendTextMessageDTO";
import WhatsAppOrchestratorService from "@modules/communication/services/WhatsAppOrchestratorService";
import { container } from "tsyringe";

interface IQueueJobData {
  type: "template" | "text" | "contact";
  entity_id: string;
  data: ISendTemplateMessageDTO | ISendTextMessageDTO | ISendContactMessageDTO;
  priority?: number;
  attempts?: number;
}

const QUEUE_NAME = "whatsapp-messages";

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

const whatsappQueue = new Bull<IQueueJobData>(QUEUE_NAME, {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

whatsappQueue.process(5, async (job: Job<IQueueJobData>) => {
  const { type, entity_id, data } = job.data;

  try {
    const orchestrator = container.resolve(WhatsAppOrchestratorService);

    let result;

    switch (type) {
      case "template":
        result = await orchestrator.sendTemplateMessage(
          entity_id,
          data as ISendTemplateMessageDTO,
        );
        break;

      case "text":
        result = await orchestrator.sendTextMessage(
          entity_id,
          data as ISendTextMessageDTO,
        );
        break;

      case "contact":
        result = await orchestrator.sendContactMessage(
          entity_id,
          data as ISendContactMessageDTO,
        );
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }

    if (!result.success) {
      throw new Error(result.error || "Failed to send message");
    }

    return result;
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        job_id: job.id,
        entity_id,
        message_type: type,
        attempt: job.attemptsMade + 1,
      },
    });

    throw error;
  }
});

whatsappQueue.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed:`, result?.message_id);
});

whatsappQueue.on("failed", (job, error) => {
  console.error(`Job ${job.id} failed:`, error.message);

  Sentry.captureException(error, {
    extra: {
      job_id: job.id,
      entity_id: job.data.entity_id,
      message_type: job.data.type,
      attempts: job.attemptsMade,
    },
  });
});

whatsappQueue.on("stalled", (job) => {
  console.warn(`Job ${job.id} stalled`);
});

export async function addToWhatsAppQueue(
  jobData: IQueueJobData,
): Promise<Job<IQueueJobData>> {
  const job = await whatsappQueue.add(jobData, {
    priority: jobData.priority || 10,
    attempts: jobData.attempts || 3,
  });

  return job;
}

export async function getQueueStats(): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}> {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    whatsappQueue.getWaitingCount(),
    whatsappQueue.getActiveCount(),
    whatsappQueue.getCompletedCount(),
    whatsappQueue.getFailedCount(),
    whatsappQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
  };
}

export async function pauseQueue(): Promise<void> {
  await whatsappQueue.pause();
}

export async function resumeQueue(): Promise<void> {
  await whatsappQueue.resume();
}

export async function clearFailedJobs(): Promise<void> {
  await whatsappQueue.clean(0, "failed");
}

export default whatsappQueue;
