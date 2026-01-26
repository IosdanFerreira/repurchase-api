import { Resolver, Mutation, Arg, UseMiddleware, Ctx } from "type-graphql";
import { container } from "tsyringe";

import AuthMiddleware from "@modules/users/infra/middlewares/authMiddleware";
import RateLimiterMiddleware from "@modules/users/infra/middlewares/rateLimiterMiddleware";
import { IUserContext } from "@modules/users/infra/http/graphql/context/IUserContext";

import GenerateWebWhatsappQrCodeService from "@modules/communication/services/GenerateWebWhatsappQrCodeService";
import DisconnectWebWhatsappService from "@modules/communication/services/DisconnectWebWhatsappService";
import ReconnectWebWhatsappService from "@modules/communication/services/ReconnectWebWhatsappService";
import RemoveWebWhatsappConnectionService from "@modules/communication/services/RemoveWebWhatsappConnectionService";

import GenerateWebWhatsappQrCodeInput from "../inputs/GenerateWebWhatsappQrCodeInput";
import DisconnectWebWhatsappInput from "../inputs/DisconnectWebWhatsappInput";
import ReconnectWebWhatsappInput from "../inputs/ReconnectWebWhatsappInput";
import RemoveWebWhatsappConnectionInput from "../inputs/RemoveWebWhatsappConnectionInput";

import WebWhatsappQrCodeResponse from "../scalars/WebWhatsappQrCodeResponse";
import WebWhatsappConnectionResponse from "../scalars/WebWhatsappConnectionResponse";

@Resolver()
export default class WebWhatsappResolver {
  @Mutation(() => WebWhatsappQrCodeResponse)
  @UseMiddleware(RateLimiterMiddleware, AuthMiddleware)
  async generateWebWhatsappQrCode(
    @Arg("data") data: GenerateWebWhatsappQrCodeInput,
    @Ctx() _ctx: IUserContext,
  ): Promise<WebWhatsappQrCodeResponse> {
    const generateQrCode = container.resolve(GenerateWebWhatsappQrCodeService);

    const result = await generateQrCode.execute({
      entity_id: data.entity_id,
      entity_name: data.entity_name,
    });

    return result;
  }

  @Mutation(() => WebWhatsappConnectionResponse)
  @UseMiddleware(RateLimiterMiddleware, AuthMiddleware)
  async disconnectWebWhatsapp(
    @Arg("data") data: DisconnectWebWhatsappInput,
    @Ctx() _ctx: IUserContext,
  ): Promise<WebWhatsappConnectionResponse> {
    const disconnectService = container.resolve(DisconnectWebWhatsappService);

    const result = await disconnectService.execute({
      entity_id: data.entity_id,
    });

    return result;
  }

  @Mutation(() => WebWhatsappConnectionResponse)
  @UseMiddleware(RateLimiterMiddleware, AuthMiddleware)
  async reconnectWebWhatsapp(
    @Arg("data") data: ReconnectWebWhatsappInput,
    @Ctx() _ctx: IUserContext,
  ): Promise<WebWhatsappConnectionResponse> {
    const reconnectService = container.resolve(ReconnectWebWhatsappService);

    const result = await reconnectService.execute({
      entity_id: data.entity_id,
    });

    return result;
  }

  @Mutation(() => WebWhatsappConnectionResponse)
  @UseMiddleware(RateLimiterMiddleware, AuthMiddleware)
  async removeWebWhatsappConnection(
    @Arg("data") data: RemoveWebWhatsappConnectionInput,
    @Ctx() _ctx: IUserContext,
  ): Promise<WebWhatsappConnectionResponse> {
    const removeService = container.resolve(RemoveWebWhatsappConnectionService);

    const result = await removeService.execute({
      entity_id: data.entity_id,
    });

    return result;
  }
}
