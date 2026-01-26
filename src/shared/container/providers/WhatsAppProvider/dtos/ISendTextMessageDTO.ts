export default interface ISendTextMessageDTO {
  to: string;
  text: string;
  preview_url?: boolean;
  entity_id: string;
  force_official_provider?: boolean;
}
