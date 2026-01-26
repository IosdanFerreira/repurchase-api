import {
  Resolver,
  Query,
  Mutation,
  Arg,
  UseMiddleware,
  Ctx,
} from "type-graphql";
import { container } from "tsyringe";

import AuthMiddleware from "@modules/users/infra/middlewares/authMiddleware";
import RateLimiterMiddleware from "@modules/users/infra/middlewares/rateLimiterMiddleware";
import { IUserContext } from "@modules/users/infra/http/graphql/context/IUserContext";

import ListWhatsAppTemplatesService from "@modules/communication/services/ListWhatsAppTemplatesService";
import GetWhatsAppTemplateDetailService from "@modules/communication/services/GetWhatsAppTemplateDetailService";
import ToggleWhatsAppTemplateService from "@modules/communication/services/ToggleWhatsAppTemplateService";
import SaveWorkshopTemplateCustomizationService from "@modules/communication/services/SaveWorkshopTemplateCustomizationService";

import ListWhatsAppTemplatesInput from "../inputs/ListWhatsAppTemplatesInput";
import GetWhatsAppTemplateDetailInput from "../inputs/GetWhatsAppTemplateDetailInput";
import ToggleWhatsAppTemplateInput from "../inputs/ToggleWhatsAppTemplateInput";
import SaveWorkshopTemplateCustomizationInput from "../inputs/SaveWorkshopTemplateCustomizationInput";

import ListWhatsAppTemplatesResponse from "../scalars/ListWhatsAppTemplatesResponse";
import WhatsAppTemplateDetailResponse from "../scalars/WhatsAppTemplateDetailResponse";
import ToggleWhatsAppTemplateResponse from "../scalars/ToggleWhatsAppTemplateResponse";
import SaveWorkshopTemplateCustomizationResponse from "../scalars/SaveWorkshopTemplateCustomizationResponse";

@Resolver()
export default class WhatsAppTemplateResolver {
  @Query(() => ListWhatsAppTemplatesResponse)
  @UseMiddleware(RateLimiterMiddleware, AuthMiddleware)
  async listWhatsAppTemplates(
    @Arg("data") data: ListWhatsAppTemplatesInput,
    @Ctx() _ctx: IUserContext,
  ): Promise<ListWhatsAppTemplatesResponse> {
    const listTemplates = container.resolve(ListWhatsAppTemplatesService);

    const result = await listTemplates.execute({
      entity_id: data.entity_id,
      page: data.page,
      per_page: data.per_page,
      search: data.search,
    });

    return result;
  }

  @Query(() => WhatsAppTemplateDetailResponse)
  @UseMiddleware(RateLimiterMiddleware, AuthMiddleware)
  async getWhatsAppTemplateDetail(
    @Arg("data") data: GetWhatsAppTemplateDetailInput,
    @Ctx() _ctx: IUserContext,
  ): Promise<WhatsAppTemplateDetailResponse> {
    const getTemplateDetail = container.resolve(
      GetWhatsAppTemplateDetailService,
    );

    const result = await getTemplateDetail.execute({
      template_id: data.template_id,
      entity_id: data.entity_id,
    });

    return result;
  }

  @Mutation(() => ToggleWhatsAppTemplateResponse)
  @UseMiddleware(RateLimiterMiddleware, AuthMiddleware)
  async toggleWhatsAppTemplate(
    @Arg("data") data: ToggleWhatsAppTemplateInput,
    @Ctx() _ctx: IUserContext,
  ): Promise<ToggleWhatsAppTemplateResponse> {
    const toggleTemplate = container.resolve(ToggleWhatsAppTemplateService);

    const result = await toggleTemplate.execute({
      template_id: data.template_id,
      entity_id: data.entity_id,
      enabled: data.enabled,
    });

    return result;
  }

  @Mutation(() => SaveWorkshopTemplateCustomizationResponse)
  @UseMiddleware(RateLimiterMiddleware, AuthMiddleware)
  async saveWorkshopTemplateCustomization(
    @Arg("data") data: SaveWorkshopTemplateCustomizationInput,
    @Ctx() _ctx: IUserContext,
  ): Promise<SaveWorkshopTemplateCustomizationResponse> {
    const saveCustomization = container.resolve(
      SaveWorkshopTemplateCustomizationService,
    );

    const result = await saveCustomization.execute({
      template_id: data.template_id,
      entity_id: data.entity_id,
      contents: data.contents.map((content) => ({
        content_id: content.content_id,
        order: content.order,
        content: content.content,
        header_text: content.header_text,
        footer_text: content.footer_text,
        enabled: content.enabled,
      })),
    });

    return result;
  }
}
