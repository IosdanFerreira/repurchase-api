import { injectable, inject } from "tsyringe";
import * as Sentry from "@sentry/node";
import axios from "axios";

import AppError from "@shared/errors/AppError";
import buildWebWhatsappTemplate from "@shared/utils/BuildWebWhatsappTemplate";
import normalizePhoneNumberForWebWhatsApp from "@shared/utils/NormalizePhoneNumberForWebWhatsApp";
import IWhatsAppTemplatesRepository from "@modules/communication/repositories/IWhatsAppTemplatesRepository";
import ISendContactMessageDTO from "../dtos/ISendContactMessageDTO";
import ISendTemplateMessageDTO from "../dtos/ISendTemplateMessageDTO";
import ISendTextMessageDTO from "../dtos/ISendTextMessageDTO";
import IWhatsAppMessageResponse from "../dtos/IWhatsAppMessageResponse";
import IWhatsAppProvider from "../models/IWhatsAppProvider";

@injectable()
export default class WebWhatsAppProvider implements IWhatsAppProvider {
  constructor(
    @inject("WhatsAppTemplatesRepository")
    private whatsAppTemplatesRepository: IWhatsAppTemplatesRepository,
  ) {}

  public async sendTemplate({
    to,
    template_name,
    entity_id,
    components,
  }: ISendTemplateMessageDTO): Promise<IWhatsAppMessageResponse> {
    try {
      const isEnabled =
        await this.whatsAppTemplatesRepository.isTemplateEnabledForEntity(
          template_name,
          entity_id,
        );

      if (!isEnabled) {
        return {
          success: true,
          message_id: undefined,
          provider: "web_whatsapp",
        };
      }

      const normalizedPhoneNumber = normalizePhoneNumberForWebWhatsApp(to);

      const { messages, document } = await buildWebWhatsappTemplate(
        template_name,
        to,
        components,
        entity_id,
      );

      let pdfDocument: { content: string; filename: string } | undefined;
      if (document && (document.id || document.link)) {
        const base64Content = await this.generateDocumentBase64(document);
        pdfDocument = {
          content: base64Content,
          filename: document.filename || "documento.pdf",
        };
      }

      let lastMessageId: string | undefined;

      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];

        const messageResponse = await this.sendTemplateToApi({
          entity_id,
          to: normalizedPhoneNumber,
          formatted_message: message.formatted_message,
          pdf_document: i === 0 ? pdfDocument : undefined,
        });

        lastMessageId = messageResponse?.message_id;
      }

      return {
        success: true,
        message_id: lastMessageId,
        provider: "web_whatsapp",
      };
    } catch (error: any) {
      Sentry.captureException(error);
      return {
        success: false,
        provider: "web_whatsapp",
      };
    }
  }

  public async sendText({
    entity_id,
    to,
    text,
  }: ISendTextMessageDTO): Promise<IWhatsAppMessageResponse> {
    try {
      const normalizedPhoneNumber = normalizePhoneNumberForWebWhatsApp(to);

      const payload = {
        type: "whatsapp_text",
        entity_id,
        phone_number: normalizedPhoneNumber,
        message: text,
        timestamp: new Date().toISOString(),
        source: "api-service",
      };

      const result = await this.sendMessageDirectly(payload);

      return {
        success: true,
        message_id: result.message_id,
        provider: "web_whatsapp",
      };
    } catch (error: any) {
      Sentry.captureException(error, {
        tags: { service: "WebWhatsAppProvider.sendText" },
        extra: { entity_id, to },
      });

      return {
        success: false,
        error: error.message,
        provider: "web_whatsapp",
      };
    }
  }

  public async sendContact({
    to,
    contacts,
    entity_id,
  }: ISendContactMessageDTO): Promise<IWhatsAppMessageResponse> {
    try {
      const normalizedPhoneNumber = normalizePhoneNumberForWebWhatsApp(to);

      const payload = {
        type: "whatsapp_contact",
        entity_id,
        phone_number: normalizedPhoneNumber,
        contacts,
        timestamp: new Date().toISOString(),
        source: "api-service",
      };

      const result = await this.sendMessageDirectly(payload);

      return {
        success: true,
        message_id: result.message_id,
        provider: "web_whatsapp",
      };
    } catch (error: any) {
      Sentry.captureException(error, {
        tags: { service: "WebWhatsAppProvider.sendContact" },
        extra: { to, contacts_count: contacts?.length },
      });

      return {
        success: false,
        error: error.message,
        provider: "web_whatsapp",
      };
    }
  }

  private async generateDocumentBase64(document: {
    id?: string;
    link?: string;
    filename?: string;
  }): Promise<string> {
    try {
      if (document.link) {
        if (document.link.startsWith("data:")) {
          const base64Data = document.link.split(",")[1];
          return base64Data;
        }

        const response = await axios.get(document.link, {
          responseType: "arraybuffer",
        });
        return Buffer.from(response.data, "binary").toString("base64");
      }

      throw new AppError("Document must have either id or link");
    } catch (error: any) {
      Sentry.captureException(error);
      throw new AppError("Error generating document base64");
    }
  }

  private async sendTemplateToApi({
    entity_id,
    to,
    formatted_message,
    pdf_document,
  }: {
    entity_id: string;
    to: string;
    formatted_message: string;
    pdf_document?: { content: string; filename: string };
  }): Promise<any> {
    try {
      const payload: any = {
        type: "whatsapp_template",
        entity_id,
        phone_number: to,
        message: formatted_message,
        timestamp: new Date().toISOString(),
        source: "api-service",
      };

      if (pdf_document) {
        payload.pdf_document = pdf_document;
      }

      return this.sendMessageDirectly(payload);
    } catch (error) {
      Sentry.captureException(error);
      throw new AppError("Error sending template message");
    }
  }

  private async sendMessageDirectly(payload: any): Promise<any> {
    try {
      const response = await axios.post(
        `${process.env.WEB_WHATSAPP_API_URL}/api/v1/messages/send`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.WEB_WHATSAPP_API_KEY,
          },
        },
      );

      return {
        message_id: response.data?.message_id,
        success: true,
      };
    } catch (error: any) {
      Sentry.captureException(error, {
        tags: { service: "WebWhatsAppProvider.sendMessageDirectly" },
        extra: {
          payload_type: payload.type,
          error_response: JSON.stringify(error.response?.data),
        },
      });

      throw new AppError(`Error sending message directly to API: ${error}`);
    }
  }
}
