import * as Sentry from "@sentry/node";

import { Request, Response } from "express";

import WebWhatsappNotificationService from "@modules/communication/services/WebWhatsappNotificationService";
import { container } from "tsyringe";

interface IWebhookPayload {
  event: string;
  entity_id: string;
  instance_id?: string;
  status?: string;
  phone_number?: string;
  qr_code?: string;
  message?: string;
  data?: Record<string, any>;
}

export default class WebWhatsappWebhookController {
  public async handle(request: Request, response: Response): Promise<Response> {
    try {
      const payload = request.body as IWebhookPayload;

      if (!payload.event || !payload.entity_id) {
        return response.status(400).json({
          success: false,
          error: "Missing required fields: event and entity_id",
        });
      }

      const notificationService = container.resolve(
        WebWhatsappNotificationService,
      );

      switch (payload.event) {
        case "connection.update":
          await notificationService.notifyConnectionStatus({
            entity_id: payload.entity_id,
            status: payload.status || "unknown",
            message: payload.message,
          });
          break;

        case "qr.update":
          if (payload.qr_code) {
            await notificationService.notifyQrCodeUpdate({
              entity_id: payload.entity_id,
              qr_code: payload.qr_code,
            });
          }
          break;

        case "connection.ready":
          await notificationService.notifyConnectionStatus({
            entity_id: payload.entity_id,
            status: "connected",
            phone_number: payload.phone_number,
            message: "WhatsApp conectado com sucesso",
          });
          break;

        case "connection.disconnected":
          await notificationService.notifyConnectionStatus({
            entity_id: payload.entity_id,
            status: "disconnected",
            message: payload.message || "WhatsApp desconectado",
          });
          break;

        case "message.sent":
          await notificationService.notifyMessageStatus({
            entity_id: payload.entity_id,
            message_id: payload.data?.message_id,
            status: "sent",
          });
          break;

        case "message.delivered":
          await notificationService.notifyMessageStatus({
            entity_id: payload.entity_id,
            message_id: payload.data?.message_id,
            status: "delivered",
          });
          break;

        case "message.read":
          await notificationService.notifyMessageStatus({
            entity_id: payload.entity_id,
            message_id: payload.data?.message_id,
            status: "read",
          });
          break;

        case "message.failed":
          await notificationService.notifyMessageStatus({
            entity_id: payload.entity_id,
            message_id: payload.data?.message_id,
            status: "failed",
            error: payload.message,
          });
          break;

        default:
          console.log(`Unhandled webhook event: ${payload.event}`, payload);
      }

      return response.status(200).json({
        success: true,
        message: "Webhook processed successfully",
      });
    } catch (error) {
      Sentry.captureException(error);
      console.error("Webhook processing error:", error);

      return response.status(500).json({
        success: false,
        error: "Internal server error while processing webhook",
      });
    }
  }
}
