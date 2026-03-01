import { inject, injectable } from "tsyringe";
import { hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import AppError from "@shared/errors/AppError";
import authConfig from "@config/auth";
import IUsersRepository from "../repositories/IUsersRepository";
import User from "../infra/prisma/entities/User";

interface IRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

interface IResponse {
  token: string;
  user: User;
}

@injectable()
export default class RegisterUserService {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
  ) {}

  public async execute({
    firstName,
    lastName,
    email,
    phone,
    password,
  }: IRequest): Promise<IResponse> {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new AppError(
        "A senha deve ter no mínimo 8 caracteres, um caractere maiúsculo, um número e um caractere especial",
      );
    }

    const phoneDigits = phone.replace(/\D/g, "");
    // Aceita: 10-11 dígitos (sem DDI) ou 12-13 dígitos (com DDI, ex: 5511999998888)
    if (phoneDigits.length < 10 || phoneDigits.length > 13) {
      throw new AppError("Telefone inválido");
    }

    if (!firstName.trim() || !lastName.trim()) {
      throw new AppError("Nome e sobrenome são obrigatórios");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError("Formato de e-mail inválido");
    }

    const userExists = await this.usersRepository.findByEmail(email);

    if (userExists) {
      throw new AppError("Email inválido");
    }

    const hashedPassword = await hash(password, 10);

    const user = await this.usersRepository.create({
      firstName,
      lastName,
      email,
      phone: phoneDigits,
      password: hashedPassword,
    });

    const { secret } = authConfig.jwt;

    const token = sign({ userId: user.id }, secret);

    return { token, user };
  }
}
