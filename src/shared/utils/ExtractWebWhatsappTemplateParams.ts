import { ITemplateComponent } from "@shared/container/providers/WhatsAppProvider/dtos/ISendTemplateMessageDTO";
import { getWebWhatsappTemplateConfig } from "./WebWhatsappTemplateMapping";

export function extractWebWhatsappTemplateParams(
  templateName: string,
  components: ITemplateComponent[],
): Record<string, string> {
  const config = getWebWhatsappTemplateConfig(templateName);
  const params: Record<string, string> = {};

  if (!config) {
    return params;
  }

  const bodyComponent = components.find((c) => c.type === "body");

  if (bodyComponent && bodyComponent.parameters) {
    bodyComponent.parameters.forEach((param, index) => {
      const paramName = config.param_mapping[index];
      if (paramName && param.text) {
        params[paramName] = param.text;
      }
    });
  }

  const headerComponent = components.find((c) => c.type === "header");
  if (headerComponent && headerComponent.parameters) {
    headerComponent.parameters.forEach((param) => {
      if (param.document) {
        params["document_link"] = param.document.link || "";
        params["document_filename"] = param.document.filename || "";
        params["document_id"] = param.document.id || "";
      }
      if (param.image) {
        params["image_link"] = param.image.link;
      }
    });
  }

  return params;
}
