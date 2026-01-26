import * as Sentry from "@sentry/node";

import AppError from "@shared/errors/AppError";
import axios from "axios";
import { injectable } from "tsyringe";

interface IRequest {
  entity_id: string;
}

interface IResponse {
  success: boolean;
  status?: string;
  message?: string;
  error?: string;
}

@injectable()
export default class ReconnectWebWhatsappService {
  public async execute({ entity_id }: IRequest): Promise<IResponse> {
    try {
      const response = await axios.post(
        `${process.env.WEB_WHATSAPP_API_URL}/api/v1/session/reconnect/${entity_id}`,
        {},
        {
          headers: {
            "x-api-key": process.env.WEB_WHATSAPP_API_KEY,
          },
          timeout: 10000,
        },
      );

      return {
        success: true,
        status: response.data.status || "reconnecting",
        message: response.data.message || "Reconexão iniciada com sucesso",
      };
    } catch (error: any) {
      Sentry.captureException(error.response?.data?.error);
      throw new AppError(
        error.response?.data?.error?.message || "Erro ao reconectar",
      );
    }
  }
}
