export default interface ICreatePasswordResetTokenDTO {
  userId: string;
  token: string;
  expiresAt: Date;
}
