import { inject, injectable } from "tsyringe";
import AppError from "@shared/errors/AppError";
import IWhatsAppTemplatesRepository from "../repositories/IWhatsAppTemplatesRepository";

interface IRequest {
  template_id: string;
  entity_id: string;
  enabled: boolean;
}

interface IResponse {
  success: boolean;
  template_id: string;
  enabled: boolean;
  message?: string;
}

@injectable()
export default class ToggleWhatsAppTemplateService {
  constructor(
    @inject("WhatsAppTemplatesRepository")
    private whatsAppTemplatesRepository: IWhatsAppTemplatesRepository,
  ) {}

  public async execute({
    template_id,
    entity_id,
    enabled,
  }: IRequest): Promise<IResponse> {
    const templateExists =
      await this.whatsAppTemplatesRepository.checkIfTemplateExists(template_id);

    if (!templateExists) {
      throw new AppError("Template não encontrado");
    }

    const communicationMethodId =
      await this.whatsAppTemplatesRepository.findCommunicationMethodId(
        entity_id,
      );

    if (!communicationMethodId) {
      throw new AppError(
        "Método de comunicação não configurado para a entidade",
      );
    }

    await this.whatsAppTemplatesRepository.toggleTemplateStatus(
      template_id,
      entity_id,
      communicationMethodId,
      enabled,
    );

    return {
      success: true,
      template_id,
      enabled,
      message: enabled
        ? "Template habilitado com sucesso"
        : "Template desabilitado com sucesso",
    };
  }
}
