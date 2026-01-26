import { container, injectable } from "tsyringe";

import ISendContactMessageDTO from "@shared/container/providers/WhatsAppProvider/dtos/ISendContactMessageDTO";
import ISendTemplateMessageDTO from "@shared/container/providers/WhatsAppProvider/dtos/ISendTemplateMessageDTO";
import ISendTextMessageDTO from "@shared/container/providers/WhatsAppProvider/dtos/ISendTextMessageDTO";
import IWhatsAppMessageResponse from "@shared/container/providers/WhatsAppProvider/dtos/IWhatsAppMessageResponse";
import IWhatsAppProvider from "@shared/container/providers/WhatsAppProvider/models/IWhatsAppProvider";
import WebWhatsAppProvider from "@shared/container/providers/WhatsAppProvider/implementations/WebWhatsAppProvider";

@injectable()
export default class WhatsAppOrchestratorService {
  private async getProvider(
    entity_id: string,
    force_official_provider?: boolean,
  ): Promise<IWhatsAppProvider> {
    const webWhatsAppProvider = container.resolve(WebWhatsAppProvider);

    if (force_official_provider) {
      return webWhatsAppProvider;
    }

    return webWhatsAppProvider;
  }

  public async sendTemplate(
    data: ISendTemplateMessageDTO,
  ): Promise<IWhatsAppMessageResponse> {
    const provider = await this.getProvider(
      data.entity_id,
      data.force_official_provider,
    );

    return provider.sendTemplate(data);
  }

  public async sendText(
    data: ISendTextMessageDTO,
  ): Promise<IWhatsAppMessageResponse> {
    const provider = await this.getProvider(
      data.entity_id,
      data.force_official_provider,
    );

    return provider.sendText(data);
  }

  public async sendContact(
    data: ISendContactMessageDTO,
  ): Promise<IWhatsAppMessageResponse> {
    const provider = await this.getProvider(
      data.entity_id,
      data.force_official_provider,
    );

    return provider.sendContact(data);
  }

  public async sendTemplateMessage(
    entity_id: string,
    data: ISendTemplateMessageDTO,
  ): Promise<IWhatsAppMessageResponse> {
    const provider = await this.getProvider(
      entity_id,
      data.force_official_provider,
    );

    return provider.sendTemplate({ ...data, entity_id });
  }

  public async sendTextMessage(
    entity_id: string,
    data: ISendTextMessageDTO,
  ): Promise<IWhatsAppMessageResponse> {
    const provider = await this.getProvider(
      entity_id,
      data.force_official_provider,
    );

    return provider.sendText({ ...data, entity_id });
  }

  public async sendContactMessage(
    entity_id: string,
    data: ISendContactMessageDTO,
  ): Promise<IWhatsAppMessageResponse> {
    const provider = await this.getProvider(
      entity_id,
      data.force_official_provider,
    );

    return provider.sendContact({ ...data, entity_id });
  }
}
