import { inject, injectable } from "tsyringe";
import IWhatsAppTemplatesRepository, {
  IWhatsAppTemplateItem,
} from "../repositories/IWhatsAppTemplatesRepository";

interface IRequest {
  entity_id: string;
  page?: number;
  per_page?: number;
  search?: string;
}

interface IResponse {
  templates: IWhatsAppTemplateItem[];
  pagination: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

@injectable()
export default class ListWhatsAppTemplatesService {
  constructor(
    @inject("WhatsAppTemplatesRepository")
    private whatsAppTemplatesRepository: IWhatsAppTemplatesRepository,
  ) {}

  public async execute({
    entity_id,
    page = 1,
    per_page = 20,
    search,
  }: IRequest): Promise<IResponse> {
    const templates =
      await this.whatsAppTemplatesRepository.findAllTemplatesWithStatus(
        entity_id,
      );

    const filteredTemplates = search
      ? templates.filter(
          (t) =>
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            (t.template_slug &&
              t.template_slug.toLowerCase().includes(search.toLowerCase())),
        )
      : templates;

    const total = filteredTemplates.length;
    const total_pages = Math.ceil(total / per_page);
    const startIndex = (page - 1) * per_page;
    const paginatedTemplates = filteredTemplates.slice(
      startIndex,
      startIndex + per_page,
    );

    return {
      templates: paginatedTemplates,
      pagination: {
        total,
        page,
        per_page,
        total_pages,
      },
    };
  }
}
