import Queue, { QueueOptions } from "bull";

const defaultQueueOptions: QueueOptions = {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT as string) || 6379,
  },
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
};

export function createQueue<T>(
  name: string,
  options?: QueueOptions,
): Queue.Queue<T> {
  return new Queue<T>(name, {
    ...defaultQueueOptions,
    ...options,
  });
}

export default defaultQueueOptions;
