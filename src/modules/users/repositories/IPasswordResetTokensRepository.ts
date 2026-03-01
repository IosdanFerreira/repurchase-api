import ICreatePasswordResetTokenDTO from "../dtos/ICreatePasswordResetTokenDTO";
import PasswordResetToken from "../infra/prisma/entities/PasswordResetToken";

export default interface IPasswordResetTokensRepository {
  create(data: ICreatePasswordResetTokenDTO): Promise<PasswordResetToken>;
  findByToken(token: string): Promise<PasswordResetToken | undefined>;
  invalidateUserTokens(userId: string): Promise<void>;
  markAsUsed(id: string): Promise<void>;
}
