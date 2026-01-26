export interface ITemplateParameter {
  type: "text" | "image" | "document" | "video";
  text?: string;
  image?: { link: string };
  document?: {
    link?: string;
    filename?: string;
    id?: string;
  };
  video?: { link: string };
}

export interface ITemplateComponent {
  type: "header" | "body" | "button";
  sub_type?: "url" | "quick_reply";
  index?: string;
  parameters: ITemplateParameter[];
}

export default interface ISendTemplateMessageDTO {
  to: string;
  template_name: string;
  language_code?: string;
  components: ITemplateComponent[];
  entity_id: string;
  force_official_provider?: boolean;
}
