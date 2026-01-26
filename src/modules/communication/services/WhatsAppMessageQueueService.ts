import ISendContactMessageDTO from "@shared/container/providers/WhatsAppProvider/dtos/ISendContactMessageDTO";
import ISendTemplateMessageDTO from "@shared/container/providers/WhatsAppProvider/dtos/ISendTemplateMessageDTO";
import ISendTextMessageDTO from "@shared/container/providers/WhatsAppProvider/dtos/ISendTextMessageDTO";
import { createQueue } from "@shared/queue";
import { injectable } from "tsyringe";

type WhatsAppMessageData =
  | (ISendTemplateMessageDTO & { type: "template" })
  | (ISendTextMessageDTO & { type: "text" })
  | (ISendContactMessageDTO & { type: "contact" });

const sendWhatsAppMessageQueue = createQueue<{
  type: string;
  data: any;
}>("SendWhatsAppMessageQueue");

@injectable()
export default class WhatsAppMessageQueueService {
  public async enqueueMessage(data: WhatsAppMessageData): Promise<void> {
    const { type, ...messageData } = data;

    await sendWhatsAppMessageQueue.add(
      {
        type,
        data: messageData,
      },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: { age: 86400000 },
        removeOnFail: { age: 604800000 },
      },
    );
  }
}

export { sendWhatsAppMessageQueue };
