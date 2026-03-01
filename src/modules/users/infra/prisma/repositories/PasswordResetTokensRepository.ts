import ICreatePasswordResetTokenDTO from "@modules/users/dtos/ICreatePasswordResetTokenDTO";
import IPasswordResetTokensRepository from "@modules/users/repositories/IPasswordResetTokensRepository";
import PasswordResetToken from "../entities/PasswordResetToken";
import prisma from "@shared/database/prisma";

export default class PasswordResetTokensRepository implements IPasswordResetTokensRepository {
  public async create(
    data: ICreatePasswordResetTokenDTO,
  ): Promise<PasswordResetToken> {
    const token = await prisma.passwordResetToken.create({
      data: {
        userId: data.userId,
        token: data.token,
        expiresAt: data.expiresAt,
      },
    });

    return token;
  }

  public async findByToken(
    token: string,
  ): Promise<PasswordResetToken | undefined> {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    return resetToken ?? undefined;
  }

  public async invalidateUserTokens(userId: string): Promise<void> {
    await prisma.passwordResetToken.updateMany({
      where: { userId, used: false },
      data: { used: true },
    });
  }

  public async markAsUsed(id: string): Promise<void> {
    await prisma.passwordResetToken.update({
      where: { id },
      data: { used: true },
    });
  }
}
