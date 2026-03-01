import { inject, injectable } from "tsyringe";
import AppError from "@shared/errors/AppError";
import IUsersRepository from "../repositories/IUsersRepository";
import IPasswordResetTokensRepository from "../repositories/IPasswordResetTokensRepository";
import { sendPasswordResetEmail } from "@shared/utils/email";
import generateResetCode from "@shared/utils/generateResetCode";

interface IRequest {
  email: string;
}

interface IResponse {
  success: boolean;
  message: string;
}

@injectable()
export default class RequestPasswordResetService {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("PasswordResetTokensRepository")
    private passwordResetTokensRepository: IPasswordResetTokensRepository,
  ) {}

  public async execute({ email }: IRequest): Promise<IResponse> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      return {
        success: true,
        message: "Se o e-mail estiver cadastrado, você receberá o código.",
      };
    }

    await this.passwordResetTokensRepository.invalidateUserTokens(user.id);

    const code = generateResetCode();

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await this.passwordResetTokensRepository.create({
      userId: user.id,
      token: code,
      expiresAt,
    });

    try {
      await sendPasswordResetEmail(email, code, user.firstName);
    } catch (error) {
      console.error("Erro ao enviar e-mail de recuperação:", error);
    }

    return {
      success: true,
      message: "Se o e-mail estiver cadastrado, você receberá o código.",
    };
  }
}
