import "./providers";

import CompaniesRepository from "@modules/companies/infra/prisma/repositories/CompaniesRepository";
import ICompaniesRepository from "@modules/companies/repositories/ICompaniesRepository";
import IPasswordResetTokensRepository from "@modules/users/repositories/IPasswordResetTokensRepository";
import IUsersRepository from "@modules/users/repositories/IUsersRepository";
import IWhatsAppTemplatesRepository from "@modules/communication/repositories/IWhatsAppTemplatesRepository";
import PasswordResetTokensRepository from "@modules/users/infra/prisma/repositories/PasswordResetTokensRepository";
import UsersRepository from "@modules/users/infra/prisma/repositories/UsersRepository";
import WhatsAppTemplatesRepository from "@modules/communication/infra/prisma/repositories/WhatsAppTemplatesRepository";
import { container } from "tsyringe";

// Users Module

container.registerSingleton<IUsersRepository>(
  "UsersRepository",
  UsersRepository,
);

container.registerSingleton<IPasswordResetTokensRepository>(
  "PasswordResetTokensRepository",
  PasswordResetTokensRepository,
);

// Companies Module

container.registerSingleton<ICompaniesRepository>(
  "CompaniesRepository",
  CompaniesRepository,
);

// Communication Module

container.registerSingleton<IWhatsAppTemplatesRepository>(
  "WhatsAppTemplatesRepository",
  WhatsAppTemplatesRepository,
);
