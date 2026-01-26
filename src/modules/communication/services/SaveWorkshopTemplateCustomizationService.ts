import { inject, injectable } from "tsyringe";
import AppError from "@shared/errors/AppError";
import IWhatsAppTemplatesRepository from "../repositories/IWhatsAppTemplatesRepository";

interface IContentInput {
  content_id?: string;
  order: number;
  content: string;
  header_text?: string;
  footer_text?: string;
  enabled: boolean;
}

interface IRequest {
  template_id: string;
  entity_id: string;
  contents: IContentInput[];
}

interface IResponse {
  success: boolean;
  template_id: string;
  message?: string;
  error?: string;
}

@injectable()
export default class SaveWorkshopTemplateCustomizationService {
  constructor(
    @inject("WhatsAppTemplatesRepository")
    private whatsAppTemplatesRepository: IWhatsAppTemplatesRepository,
  ) {}

  public async execute({
    template_id,
    entity_id,
    contents,
  }: IRequest): Promise<IResponse> {
    const templateExists =
      await this.whatsAppTemplatesRepository.checkIfTemplateExists(template_id);

    if (!templateExists) {
      throw new AppError("Template não encontrado");
    }

    let contentsUpdated = 0;

    for (const content of contents) {
      if (content.content_id) {
        await this.whatsAppTemplatesRepository.updateTemplateContent(
          content.content_id,
          {
            order: content.order,
            type_message_content_slug: "text",
            enabled: content.enabled,
            header_text: content.header_text,
            content: content.content,
            footer_text: content.footer_text,
          },
        );
        contentsUpdated++;
      } else {
        await this.whatsAppTemplatesRepository.createCustomizedContent({
          template_id,
          entity_id,
          order: content.order,
          type_message_content_slug: "text",
          enabled: content.enabled,
          header_text: content.header_text,
          content: content.content,
          footer_text: content.footer_text,
        });
        contentsUpdated++;
      }
    }

    return {
      success: true,
      template_id,
      message: `${contentsUpdated} conteúdo(s) atualizado(s) com sucesso`,
    };
  }
}
