interface ITemplateConfig {
  template_name: string;
  param_mapping: Record<number, string>;
}

export const WEB_WHATSAPP_TEMPLATE_MAPPING: Record<string, ITemplateConfig> = {
  order_created: {
    template_name: "order_created",
    param_mapping: {
      0: "greeting",
      1: "client_name",
      2: "entity_name",
      3: "order_number",
    },
  },

  quote_sent: {
    template_name: "quote_sent",
    param_mapping: {
      0: "client_name",
      1: "order_number",
      2: "entity_phone",
      3: "entity_name",
    },
  },
};

export function getWebWhatsappTemplateConfig(
  officialTemplateName: string,
): ITemplateConfig | undefined {
  return WEB_WHATSAPP_TEMPLATE_MAPPING[officialTemplateName];
}
