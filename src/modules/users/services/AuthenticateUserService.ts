import { inject, injectable } from "tsyringe";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import AppError from "@shared/errors/AppError";
import authConfig from "@config/auth";
import IUsersRepository from "../repositories/IUsersRepository";
import User from "../infra/prisma/entities/User";

interface IRequest {
  email: string;
  password: string;
}

interface IResponse {
  token: string;
  user: User;
}

@injectable()
export default class AuthenticateUserService {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
  ) {}

  public async execute({ email, password }: IRequest): Promise<IResponse> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new AppError("Email ou senha inválidos");
    }

    if (!user.password) {
      throw new AppError(
        "Esta conta usa login via Google. Use 'Entrar com Google'.",
      );
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw new AppError("mail ou senha inválidos");
    }

    const { secret } = authConfig.jwt;

    const token = sign({ userId: user.id }, secret);

    return { token, user };
  }
}
