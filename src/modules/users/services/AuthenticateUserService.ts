import { inject, injectable } from "tsyringe";
import { compare } from "bcryptjs";
import { sign, SignOptions } from "jsonwebtoken";
import AppError from "@shared/errors/AppError";
import authConfig from "@config/auth";
import IUsersRepository from "../repositories/IUsersRepository";
import User from "../infra/prisma/entities/User";

interface IRequest {
  email: string;
  password: string;
}

interface IResponse {
  user: User;
  access_token: string;
  refresh_token: string;
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
      throw new AppError("Invalid email or password");
    }

    if (!user.active) {
      throw new AppError("User is inactive");
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw new AppError("Invalid email or password");
    }

    const { secret, accessExpiresIn, refreshExpiresIn } = authConfig.jwt;

    const access_token = sign({ id: user.id, email: user.email }, secret, {
      expiresIn: accessExpiresIn,
    } as SignOptions);

    const refresh_token = sign({ id: user.id }, secret, {
      expiresIn: refreshExpiresIn,
    } as SignOptions);

    return {
      user,
      access_token,
      refresh_token,
    };
  }
}
