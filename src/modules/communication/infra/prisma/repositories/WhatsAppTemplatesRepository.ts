import IWhatsAppTemplatesRepository, {
  ICreateCustomizedContentInput,
  ICustomizedContentReference,
  IToggleTemplateStatusResult,
  IUpdateTemplateContentInput,
  IWhatsAppTemplateDetail,
  IWhatsAppTemplateItem,
} from "@modules/communication/repositories/IWhatsAppTemplatesRepository";

import prisma from "@shared/database/prisma";

export default class WhatsAppTemplatesRepository implements IWhatsAppTemplatesRepository {
  public async findAllTemplatesWithStatus(
    entity_id: string,
  ): Promise<IWhatsAppTemplateItem[]> {
    const templates = await prisma.whatsAppMessageTemplate.findMany({
      where: {
        active: true,
      },
      include: {
        entity_whatsapp_message_templates: {
          where: {
            entity_id,
          },
        },
        whatsapp_message_template_contents: {
          where: {
            active: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return templates.map((template) => ({
      id: template.id,
      template_slug: template.template_slug,
      template_name: template.name,
      name: template.name,
      description: template.official_content?.substring(0, 100) || undefined,
      enabled:
        template.entity_whatsapp_message_templates.length > 0
          ? template.entity_whatsapp_message_templates[0].enabled
          : true,
      is_customized: template.entity_whatsapp_message_templates.length > 0,
      active: template.active,
      created_at: template.created_at,
      contents_count: template.whatsapp_message_template_contents.length,
    }));
  }

  public async findTemplateDetailById(
    template_id: string,
    entity_id: string,
  ): Promise<IWhatsAppTemplateDetail | null> {
    const template = await prisma.whatsAppMessageTemplate.findUnique({
      where: {
        id: template_id,
      },
      include: {
        entity_whatsapp_message_templates: {
          where: {
            entity_id,
          },
          include: {
            entity_customized_templates: true,
          },
        },
        whatsapp_message_template_contents: {
          where: {
            active: true,
          },
          orderBy: {
            order: "asc",
          },
        },
        whatsapp_message_template_variables: {
          include: {
            template_message_variable: true,
          },
        },
        whatsapp_message_template_dynamic_contents: {
          include: {
            dynamic_message_content: true,
          },
        },
      },
    });

    if (!template) {
      return null;
    }

    const entityTemplate = template.entity_whatsapp_message_templates[0];
    const customizedContentIds = entityTemplate
      ? entityTemplate.entity_customized_templates.map(
          (ct) => ct.whatsapp_message_template_content_id,
        )
      : [];

    const contentTypes = await prisma.typeMessageContent.findMany({
      where: { active: true },
    });

    return {
      id: template.id,
      template_slug: template.template_slug,
      slug: template.template_slug || "",
      name: template.name,
      description: template.official_content?.substring(0, 200) || undefined,
      enabled: entityTemplate ? entityTemplate.enabled : true,
      is_customized: customizedContentIds.length > 0,
      allow_customization: true,
      official_header_text: template.official_header_text,
      official_content: template.official_content,
      official_footer_text: template.official_footer_text,
      official_button_name: template.official_button_name,
      contents: template.whatsapp_message_template_contents.map((content) => ({
        id: content.id,
        order: content.order,
        header_text: content.header_text,
        content: content.content,
        footer_text: content.footer_text,
        type_message_content_slug: content.type_message_content_slug,
        dynamic_message_content_slug: content.dynamic_message_content_slug,
        enabled: content.enabled,
        is_customized: customizedContentIds.includes(content.id),
      })),
      variables: template.whatsapp_message_template_variables.map((v) => ({
        id: v.template_message_variable.id,
        value: v.template_message_variable.value,
        variable_name: v.template_message_variable.value,
        variable_key: v.template_message_variable.value,
        description: v.template_message_variable.description,
        is_required: !v.template_message_variable.always_available,
        always_available: v.template_message_variable.always_available,
      })),
      available_dynamic_contents:
        template.whatsapp_message_template_dynamic_contents.map((dc) => ({
          slug: dc.dynamic_message_content.slug,
          name: dc.dynamic_message_content.name,
        })),
      available_content_types: contentTypes.map((ct) => ({
        slug: ct.slug,
        name: ct.name,
      })),
    };
  }

  public async toggleTemplateStatus(
    template_id: string,
    entity_id: string,
    whatsapp_communication_method_id: string,
    enabled: boolean,
  ): Promise<IToggleTemplateStatusResult> {
    const result = await prisma.entityWhatsAppMessageTemplate.upsert({
      where: {
        whatsapp_message_template_id_entity_id: {
          whatsapp_message_template_id: template_id,
          entity_id,
        },
      },
      update: {
        enabled,
      },
      create: {
        whatsapp_message_template_id: template_id,
        entity_id,
        whatsapp_communication_method_id,
        enabled,
      },
    });

    return {
      whatsapp_message_template_id: result.whatsapp_message_template_id,
      entity_id: result.entity_id,
      whatsapp_communication_method_id: result.whatsapp_communication_method_id,
      enabled: result.enabled,
    };
  }

  public async checkIfTemplateExists(template_id: string): Promise<boolean> {
    const template = await prisma.whatsAppMessageTemplate.findUnique({
      where: { id: template_id },
      select: { id: true },
    });

    return !!template;
  }

  public async findCommunicationMethodId(
    entity_id: string,
  ): Promise<string | null> {
    const settings = await prisma.entitySettings.findUnique({
      where: { entity_id },
      select: { whatsapp_communication_method_id: true },
    });

    return settings?.whatsapp_communication_method_id ?? null;
  }

  public async isTemplateEnabledForEntity(
    template_slug: string,
    entity_id: string,
  ): Promise<boolean> {
    const template = await prisma.whatsAppMessageTemplate.findFirst({
      where: {
        template_slug,
        active: true,
      },
      include: {
        entity_whatsapp_message_templates: {
          where: {
            entity_id,
          },
        },
      },
    });

    if (!template) {
      return false;
    }

    if (template.entity_whatsapp_message_templates.length === 0) {
      return true;
    }

    return template.entity_whatsapp_message_templates[0].enabled;
  }

  public async hasCustomizedTemplate(
    template_id: string,
    entity_id: string,
  ): Promise<boolean> {
    const customized = await prisma.entityCustomizedTemplate.findFirst({
      where: {
        whatsapp_message_template_id: template_id,
        entity_id,
      },
    });

    return !!customized;
  }

  public async findCustomizedTemplateContents(
    template_id: string,
    entity_id: string,
  ): Promise<ICustomizedContentReference[]> {
    const contents = await prisma.entityCustomizedTemplate.findMany({
      where: {
        whatsapp_message_template_id: template_id,
        entity_id,
      },
      select: {
        whatsapp_message_template_content_id: true,
      },
    });

    return contents.map((c) => ({
      content_id: c.whatsapp_message_template_content_id,
    }));
  }

  public async createCustomizedContent(
    data: ICreateCustomizedContentInput,
  ): Promise<string> {
    const content = await prisma.whatsAppMessageTemplateContent.create({
      data: {
        whatsapp_message_template_id: data.template_id,
        order: data.order,
        type_message_content_slug: data.type_message_content_slug,
        enabled: data.enabled,
        header_text: data.header_text,
        content: data.content,
        footer_text: data.footer_text,
        dynamic_message_content_slug: data.dynamic_message_content_slug,
      },
    });

    await prisma.entityCustomizedTemplate.create({
      data: {
        whatsapp_message_template_id: data.template_id,
        entity_id: data.entity_id,
        whatsapp_message_template_content_id: content.id,
      },
    });

    return content.id;
  }

  public async updateTemplateContent(
    content_id: string,
    data: IUpdateTemplateContentInput,
  ): Promise<void> {
    await prisma.whatsAppMessageTemplateContent.update({
      where: { id: content_id },
      data: {
        order: data.order,
        type_message_content_slug: data.type_message_content_slug,
        enabled: data.enabled,
        header_text: data.header_text,
        content: data.content,
        footer_text: data.footer_text,
        dynamic_message_content_slug: data.dynamic_message_content_slug,
      },
    });
  }

  public async deleteCustomizedContent(
    template_id: string,
    entity_id: string,
    content_id: string,
  ): Promise<void> {
    await prisma.entityCustomizedTemplate.delete({
      where: {
        whatsapp_message_template_id_entity_id_whatsapp_message_template_content_id:
          {
            whatsapp_message_template_id: template_id,
            entity_id,
            whatsapp_message_template_content_id: content_id,
          },
      },
    });

    await prisma.whatsAppMessageTemplateContent.delete({
      where: { id: content_id },
    });
  }
}
