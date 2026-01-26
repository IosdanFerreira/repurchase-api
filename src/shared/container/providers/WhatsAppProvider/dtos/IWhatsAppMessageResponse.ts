export default interface IWhatsAppMessageResponse {
  success: boolean;
  message_id?: string;
  error?: string;
  provider: "oficial_whatsapp" | "web_whatsapp";
}
