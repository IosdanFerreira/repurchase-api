export const TEMPLATE_VARIABLE_MAPPING: Record<string, string> = {
  client_name: "primeiro_nome_do_cliente",
  user_name: "primeiro_nome_do_cliente",
  firstname: "primeiro_nome_do_cliente",
  full_name: "nome_completo_do_cliente",
  entity_name: "nome_da_entidade",
  entity_phone: "whatsapp_da_entidade",
  order_number: "numero_da_ordem",
  quote_value: "valor_do_orcamento",
  quote_link: "link_do_orcamento",
  greeting: "saudacao_inicial",
  closing: "saudacao_final",
  custom_message: "mensagem_customizada",
};

export const TEMPLATE_SPECIFIC_VARIABLE_MAPPING: Record<
  string,
  Record<string, string>
> = {};

export function getVariableMappingForTemplate(
  templateSlug: string,
): Record<string, string> {
  const specificMapping =
    TEMPLATE_SPECIFIC_VARIABLE_MAPPING[templateSlug] || {};
  return {
    ...TEMPLATE_VARIABLE_MAPPING,
    ...specificMapping,
  };
}

export function convertParamsToPortuguese(
  params: Record<string, any>,
  templateSlug?: string,
): Record<string, any> {
  const mapping = templateSlug
    ? getVariableMappingForTemplate(templateSlug)
    : TEMPLATE_VARIABLE_MAPPING;

  const convertedParams: Record<string, any> = {};

  Object.entries(params).forEach(([key, value]) => {
    const portugueseKey = mapping[key];
    if (portugueseKey) {
      convertedParams[portugueseKey] = value;
    }
    convertedParams[key] = value;
  });

  return convertedParams;
}
