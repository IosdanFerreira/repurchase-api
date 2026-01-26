import IWhatsAppProvider from "./models/IWhatsAppProvider";
import WebWhatsAppProvider from "./implementations/WebWhatsAppProvider";
import { container } from "tsyringe";

container.registerSingleton<IWhatsAppProvider>(
  "WebWhatsAppProvider",
  WebWhatsAppProvider,
);
