import { inject, injectable } from "tsyringe";
import { OAuth2Client } from "google-auth-library";
import { sign } from "jsonwebtoken";
import AppError from "@shared/errors/AppError";
import authConfig from "@config/auth";
import IUsersRepository from "../repositories/IUsersRepository";
import User from "../infra/prisma/entities/User";

interface IRequest {
  idToken: string;
}

interface IResponse {
  token: string;
  user: User;
}

@injectable()
export default class GoogleAuthService {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
  ) {}

  public async execute({ idToken }: IRequest): Promise<IResponse> {
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      throw new AppError("Google OAuth não está configurado.");
    }

    const client = new OAuth2Client(clientId);

    let payload: {
      sub: string;
      email?: string;
      given_name?: string;
      family_name?: string;
    };

    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: clientId,
      });

      const ticketPayload = ticket.getPayload();

      if (!ticketPayload) {
        throw new AppError("Token Google inválido.");
      }

      payload = ticketPayload as typeof payload;
    } catch {
      throw new AppError("Token Google inválido ou expirado.");
    }

    const { sub: googleId, email, given_name, family_name } = payload;

    if (!email) {
      throw new AppError("A conta Google não possui e-mail associado.");
    }

    // Tenta encontrar usuário pelo googleId já vinculado
    let user = await this.usersRepository.findByGoogleId(googleId);

    if (!user) {
      // Tenta encontrar por email para vincular conta existente
      user = await this.usersRepository.findByEmail(email);

      if (user) {
        // Vincula o googleId à conta existente
        user.googleId = googleId;
        user = await this.usersRepository.save(user);
      } else {
        // Cria nova conta via Google
        user = await this.usersRepository.create({
          firstName: given_name || "Usuário",
          lastName: family_name || "Google",
          email,
          googleId,
        });
      }
    }

    const { secret } = authConfig.jwt;
    const token = sign({ userId: user.id }, secret);

    return { token, user };
  }
}
