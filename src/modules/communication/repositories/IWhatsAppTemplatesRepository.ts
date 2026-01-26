export interface IWhatsAppTemplateItem {
  id: string;
  template_slug: string | null;
  template_name: string;
  name: string;
  description?: string;
  enabled: boolean;
  is_customized: boolean;
  active: boolean;
  created_at: Date;
  contents_count: number;
}

export interface IWhatsAppTemplateContent {
  id: string;
  order: number;
  header_text: string | null;
  content: string | null;
  footer_text: string | null;
  type_message_content_slug: string;
  dynamic_message_content_slug: string | null;
  enabled: boolean;
  is_customized: boolean;
}

export interface IWhatsAppTemplateVariable {
  id: string;
  value: string;
  variable_name: string;
  variable_key: string;
  description: string;
  is_required: boolean;
  always_available: boolean;
}

export interface IWhatsAppTemplateDynamicContent {
  slug: string;
  name: string;
}

export interface ITypeMessageContent {
  slug: string;
  name: string;
}

export interface IWhatsAppTemplateDetail {
  id: string;
  template_slug: string | null;
  slug: string;
  name: string;
  description?: string;
  enabled: boolean;
  is_customized: boolean;
  allow_customization: boolean;
  official_header_text: string | null;
  official_content: string | null;
  official_footer_text: string | null;
  official_button_name: string | null;
  contents: IWhatsAppTemplateContent[];
  variables: IWhatsAppTemplateVariable[];
  available_dynamic_contents: IWhatsAppTemplateDynamicContent[];
  available_content_types: ITypeMessageContent[];
}

export interface IToggleTemplateStatusResult {
  whatsapp_message_template_id: string;
  entity_id: string;
  whatsapp_communication_method_id: string;
  enabled: boolean;
}

export interface ISaveCustomizedTemplateContentInput {
  id?: string;
  order: number;
  type_message_content_slug: string;
  enabled: boolean;
  header_text?: string | null;
  content?: string | null;
  footer_text?: string | null;
  dynamic_message_content_slug?: string | null;
  delete?: boolean;
}

export interface ICreateCustomizedContentInput {
  template_id: string;
  entity_id: string;
  order: number;
  type_message_content_slug: string;
  enabled: boolean;
  header_text?: string | null;
  content?: string | null;
  footer_text?: string | null;
  dynamic_message_content_slug?: string | null;
}

export interface IUpdateTemplateContentInput {
  order: number;
  type_message_content_slug: string;
  enabled: boolean;
  header_text?: string | null;
  content?: string | null;
  footer_text?: string | null;
  dynamic_message_content_slug?: string | null;
}

export interface ICustomizedContentReference {
  content_id: string;
}

export default interface IWhatsAppTemplatesRepository {
  findAllTemplatesWithStatus(
    entity_id: string,
  ): Promise<IWhatsAppTemplateItem[]>;

  findTemplateDetailById(
    template_id: string,
    entity_id: string,
  ): Promise<IWhatsAppTemplateDetail | null>;

  toggleTemplateStatus(
    template_id: string,
    entity_id: string,
    whatsapp_communication_method_id: string,
    enabled: boolean,
  ): Promise<IToggleTemplateStatusResult>;

  checkIfTemplateExists(template_id: string): Promise<boolean>;

  findCommunicationMethodId(entity_id: string): Promise<string | null>;

  isTemplateEnabledForEntity(
    template_slug: string,
    entity_id: string,
  ): Promise<boolean>;

  hasCustomizedTemplate(
    template_id: string,
    entity_id: string,
  ): Promise<boolean>;

  findCustomizedTemplateContents(
    template_id: string,
    entity_id: string,
  ): Promise<ICustomizedContentReference[]>;

  createCustomizedContent(data: ICreateCustomizedContentInput): Promise<string>;

  updateTemplateContent(
    content_id: string,
    data: IUpdateTemplateContentInput,
  ): Promise<void>;

  deleteCustomizedContent(
    template_id: string,
    entity_id: string,
    content_id: string,
  ): Promise<void>;
}
