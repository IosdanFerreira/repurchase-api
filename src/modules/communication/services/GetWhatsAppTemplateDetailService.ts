import { inject, injectable } from "tsyringe";
import AppError from "@shared/errors/AppError";
import IWhatsAppTemplatesRepository from "../repositories/IWhatsAppTemplatesRepository";

interface IRequest {
  template_id: string;
  entity_id: string;
}

interface IContentItem {
  id: string;
  order: number;
  content: string;
  header_text?: string;
  footer_text?: string;
  enabled: boolean;
  is_customized: boolean;
}

interface IVariableItem {
  id: string;
  variable_name: string;
  variable_key: string;
  description?: string;
  is_required: boolean;
}

interface IResponse {
  id: string;
  template_name: string;
  template_slug: string;
  description?: string;
  enabled: boolean;
  is_customized: boolean;
  allow_customization: boolean;
  contents: IContentItem[];
  variables: IVariableItem[];
}

@injectable()
export default class GetWhatsAppTemplateDetailService {
  constructor(
    @inject("WhatsAppTemplatesRepository")
    private whatsAppTemplatesRepository: IWhatsAppTemplatesRepository,
  ) {}

  public async execute({
    template_id,
    entity_id,
  }: IRequest): Promise<IResponse> {
    const template =
      await this.whatsAppTemplatesRepository.findTemplateDetailById(
        template_id,
        entity_id,
      );

    if (!template) {
      throw new AppError("Template não encontrado");
    }

    return {
      id: template.id,
      template_name: template.name,
      template_slug: template.slug || template.template_slug || "",
      description: template.description,
      enabled: template.enabled,
      is_customized: template.is_customized,
      allow_customization: template.allow_customization || false,
      contents: template.contents.map((c) => ({
        id: c.id,
        order: c.order,
        content: c.content || "",
        header_text: c.header_text || undefined,
        footer_text: c.footer_text || undefined,
        enabled: c.enabled,
        is_customized: c.is_customized,
      })),
      variables: template.variables.map((v) => ({
        id: v.id,
        variable_name: v.variable_name,
        variable_key: v.variable_key,
        description: v.description || undefined,
        is_required: v.is_required,
      })),
    };
  }
}
