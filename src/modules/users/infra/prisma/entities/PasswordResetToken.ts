export default class PasswordResetToken {
  id: string;
  userId: string;
  token: string;
  used: boolean;
  expiresAt: Date;
  createdAt: Date;
}
