import { Router } from "express";
import WebWhatsappWebhookController from "../controllers/WebWhatsappWebhookController";

const communicationRouter = Router();
const webWhatsappWebhookController = new WebWhatsappWebhookController();

communicationRouter.post("/webhooks/web-whatsapp", (req, res) =>
  webWhatsappWebhookController.handle(req, res),
);

export default communicationRouter;
