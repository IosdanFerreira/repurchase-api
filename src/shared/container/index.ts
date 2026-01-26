import "./providers";

import IUsersRepository from "@modules/users/repositories/IUsersRepository";
import IWhatsAppTemplatesRepository from "@modules/communication/repositories/IWhatsAppTemplatesRepository";
import UsersRepository from "@modules/users/infra/prisma/repositories/UsersRepository";
import WhatsAppTemplatesRepository from "@modules/communication/infra/prisma/repositories/WhatsAppTemplatesRepository";
import { container } from "tsyringe";

// Users Module

container.registerSingleton<IUsersRepository>(
  "UsersRepository",
  UsersRepository,
);

// Communication Module

container.registerSingleton<IWhatsAppTemplatesRepository>(
  "WhatsAppTemplatesRepository",
  WhatsAppTemplatesRepository,
);
