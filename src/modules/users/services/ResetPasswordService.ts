import { inject, injectable } from "tsyringe";
import { hash } from "bcryptjs";
import AppError from "@shared/errors/AppError";
import IUsersRepository from "../repositories/IUsersRepository";
import IPasswordResetTokensRepository from "../repositories/IPasswordResetTokensRepository";

interface IRequest {
  token: string;
  newPassword: string;
}

interface IResponse {
  success: boolean;
  message: string;
}

@injectable()
export default class ResetPasswordService {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("PasswordResetTokensRepository")
    private passwordResetTokensRepository: IPasswordResetTokensRepository,
  ) {}

  public async execute({ token, newPassword }: IRequest): Promise<IResponse> {
    if (newPassword.length < 8) {
      throw new AppError("A senha deve ter no mínimo 8 caracteres.");
    }

    const resetToken =
      await this.passwordResetTokensRepository.findByToken(token);

    if (!resetToken || resetToken.used) {
      throw new AppError("Código inválido ou expirado.");
    }

    if (new Date() > resetToken.expiresAt) {
      throw new AppError("Código inválido ou expirado.");
    }

    const hashedPassword = await hash(newPassword, 10);

    await this.usersRepository.updatePassword(
      resetToken.userId,
      hashedPassword,
    );

    await this.passwordResetTokensRepository.markAsUsed(resetToken.id);

    return {
      success: true,
      message: "Senha redefinida com sucesso.",
    };
  }
}
