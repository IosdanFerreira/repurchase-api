import * as Sentry from "@sentry/node";

import { Server } from "socket.io";
import { injectable } from "tsyringe";

let io: Server | null = null;

export function setSocketIO(socketIO: Server): void {
  io = socketIO;
}

export function getSocketIO(): Server | null {
  return io;
}

interface IConnectionStatusPayload {
  entity_id: string;
  status: string;
  phone_number?: string;
  message?: string;
}

interface IQrCodePayload {
  entity_id: string;
  qr_code: string;
}

interface IMessageStatusPayload {
  entity_id: string;
  message_id?: string;
  status: string;
  error?: string;
}

@injectable()
export default class WebWhatsappNotificationService {
  private getSocketIO(): Server | null {
    return io;
  }

  private emitToEntity(entity_id: string, event: string, data: any): number {
    const socketIO = this.getSocketIO();

    if (!socketIO) {
      Sentry.captureMessage("WebWhatsApp: Socket.IO not initialized", {
        extra: { entity_id, event, data },
        tags: { service: "WebWhatsappNotificationService" },
      });
      return 0;
    }

    const roomName = `entity:${entity_id}`;
    socketIO.to(roomName).emit(event, data);

    return 1;
  }

  public async notifyConnectionStatus(
    payload: IConnectionStatusPayload,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      this.emitToEntity(
        payload.entity_id,
        "whatsapp:connection:status",
        payload,
      );

      return { success: true };
    } catch (error: any) {
      Sentry.captureException(error, {
        extra: { payload },
        tags: { service: "WebWhatsappNotificationService" },
      });

      return { success: false, message: error.message };
    }
  }

  public async notifyQrCodeUpdate(
    payload: IQrCodePayload,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      this.emitToEntity(payload.entity_id, "whatsapp:qrcode:update", payload);

      return { success: true };
    } catch (error: any) {
      Sentry.captureException(error, {
        extra: { payload },
        tags: { service: "WebWhatsappNotificationService" },
      });

      return { success: false, message: error.message };
    }
  }

  public async notifyMessageStatus(
    payload: IMessageStatusPayload,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      this.emitToEntity(payload.entity_id, "whatsapp:message:status", payload);

      return { success: true };
    } catch (error: any) {
      Sentry.captureException(error, {
        extra: { payload },
        tags: { service: "WebWhatsappNotificationService" },
      });

      return { success: false, message: error.message };
    }
  }

  public async handleWhatsAppStatusChange(payload: any): Promise<any> {
    const { entity_id, status } = payload;

    if (!entity_id) {
      const error = new Error(
        "entity_id é obrigatório para notificação WebWhatsApp",
      );
      Sentry.captureException(error, {
        extra: { payload },
        tags: { service: "WebWhatsappNotificationService" },
      });

      return { received: false, error: "entity_id is required" };
    }

    if (!status) {
      Sentry.captureMessage("WebWhatsApp Notification: status is undefined", {
        extra: { payload },
        tags: { service: "WebWhatsappNotificationService" },
      });
    }

    try {
      const socketIO = this.getSocketIO();

      if (!socketIO) {
        Sentry.captureMessage("WebWhatsApp: Socket.IO not initialized", {
          extra: { entity_id, status, payload },
          tags: { service: "WebWhatsappNotificationService" },
        });

        return {
          received: false,
          error: "Socket.IO not initialized",
        };
      }

      const roomName = `whatsapp_${entity_id}`;

      const socketsInRoom = await socketIO.in(roomName).fetchSockets();
      const clientCount = socketsInRoom.length;

      if (clientCount === 0) {
        Sentry.captureMessage(
          "WebWhatsApp: nenhum cliente conectado na sala ao emitir evento",
          {
            extra: { entity_id, status, room: roomName, payload },
            tags: { service: "WebWhatsappNotificationService" },
          },
        );
      }

      socketIO.to(roomName).emit("whatsapp_status_change", payload);

      return {
        received: true,
        room: roomName,
        clients_notified: clientCount,
        status,
      };
    } catch (error: any) {
      Sentry.captureException(error, {
        extra: { entity_id, status, payload },
        tags: { service: "WebWhatsappNotificationService" },
      });

      return {
        received: false,
        error: error.message,
        entity_id,
      };
    }
  }
}
