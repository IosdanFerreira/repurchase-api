import * as Sentry from "@sentry/node";

import AppError from "@shared/errors/AppError";
import axios from "axios";
import { injectable } from "tsyringe";

interface IRequest {
  entity_id: string;
  entity_name?: string;
}

interface IResponse {
  success: boolean;
  qr_code?: string;
  qr_code_base64?: string;
  instance_id?: string;
  message?: string;
  error?: string;
}

@injectable()
export default class GenerateWebWhatsappQrCodeService {
  public async execute({
    entity_id,
    entity_name,
  }: IRequest): Promise<IResponse> {
    try {
      const response = await axios.post<{
        qr_code?: string;
        qr_code_base64?: string;
        instance_id?: string;
      }>(
        `${process.env.WEB_WHATSAPP_API_URL}/api/v1/session/generate-qrcode/${entity_id}`,
        { entity_name },
        {
          headers: {
            "x-api-key": process.env.WEB_WHATSAPP_API_KEY,
          },
        },
      );

      return {
        success: true,
        qr_code: response.data.qr_code,
        qr_code_base64: response.data.qr_code_base64,
        instance_id: response.data.instance_id,
        message: "QR Code gerado com sucesso",
      };
    } catch (error: any) {
      Sentry.captureException(error.response?.data?.error);
      throw new AppError(
        error.response?.data?.error?.message || "Erro ao gerar QR Code",
      );
    }
  }
}
