import { ITemplateComponent } from "@shared/container/providers/WhatsAppProvider/dtos/ISendTemplateMessageDTO";
import { extractWebWhatsappTemplateParams } from "./ExtractWebWhatsappTemplateParams";
import prisma from "@shared/database/prisma";
import replaceTemplateVariables from "./ReplaceTemplateVariables";

interface IBuiltMessage {
  order: number;
  formatted_message: string;
}

interface IBuildTemplateResult {
  messages: IBuiltMessage[];
  document?: {
    id?: string;
    link?: string;
    filename?: string;
  };
}

export default async function buildWebWhatsappTemplate(
  templateName: string,
  _to: string,
  components: ITemplateComponent[],
  entity_id: string,
): Promise<IBuildTemplateResult> {
  const params = extractWebWhatsappTemplateParams(templateName, components);

  const template = await prisma.whatsAppMessageTemplate.findFirst({
    where: {
      template_slug: templateName,
      active: true,
    },
    include: {
      whatsapp_message_template_contents: {
        where: {
          active: true,
          enabled: true,
        },
        orderBy: {
          order: "asc",
        },
      },
      entity_whatsapp_message_templates: {
        where: {
          entity_id,
        },
        include: {
          entity_customized_templates: {
            include: {
              whatsapp_message_template_content: true,
            },
          },
        },
      },
    },
  });

  if (!template) {
    return {
      messages: [],
    };
  }

  const entityTemplate = template.entity_whatsapp_message_templates[0];
  const hasCustomization =
    entityTemplate &&
    entityTemplate.entity_customized_templates &&
    entityTemplate.entity_customized_templates.length > 0;

  let contents = template.whatsapp_message_template_contents;

  if (hasCustomization) {
    const customizedContents = entityTemplate.entity_customized_templates.map(
      (ct) => ct.whatsapp_message_template_content,
    );

    contents = customizedContents.sort((a, b) => a.order - b.order);
  }

  const messages: IBuiltMessage[] = [];
  let document: { id?: string; link?: string; filename?: string } | undefined;

  for (const content of contents) {
    if (!content.enabled) {
      continue;
    }

    let formattedMessage = "";

    if (content.header_text) {
      const header = replaceTemplateVariables(content.header_text, params);
      formattedMessage += `*${header}*\n\n`;
    }

    if (content.content) {
      formattedMessage += replaceTemplateVariables(content.content, params);
    }

    if (content.footer_text) {
      const footer = replaceTemplateVariables(content.footer_text, params);
      formattedMessage += `\n\n_${footer}_`;
    }

    if (formattedMessage.trim()) {
      messages.push({
        order: content.order,
        formatted_message: formattedMessage.trim(),
      });
    }
  }

  if (params.document_link || params.document_id) {
    document = {
      id: params.document_id,
      link: params.document_link,
      filename: params.document_filename || "documento.pdf",
    };
  }

  return {
    messages,
    document,
  };
}
