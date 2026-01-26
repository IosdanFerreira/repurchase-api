import ISendContactMessageDTO from "../dtos/ISendContactMessageDTO";
import ISendTemplateMessageDTO from "../dtos/ISendTemplateMessageDTO";
import ISendTextMessageDTO from "../dtos/ISendTextMessageDTO";
import IWhatsAppMessageResponse from "../dtos/IWhatsAppMessageResponse";

export default interface IWhatsAppProvider {
  sendTemplate(
    data: ISendTemplateMessageDTO,
  ): Promise<IWhatsAppMessageResponse>;
  sendText(data: ISendTextMessageDTO): Promise<IWhatsAppMessageResponse>;
  sendContact(data: ISendContactMessageDTO): Promise<IWhatsAppMessageResponse>;
}
