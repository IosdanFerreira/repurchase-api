import { inject, injectable } from "tsyringe";
import { hash } from "bcryptjs";
import AppError from "@shared/errors/AppError";
import IUsersRepository from "../repositories/IUsersRepository";
import User from "../infra/prisma/entities/User";

interface IRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

@injectable()
export default class CreateUserService {
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
  }: IRequest): Promise<User> {
    const userExists = await this.usersRepository.findByEmail(email);

    if (userExists) {
      throw new AppError("Este e-mail já está cadastrado.");
    }

    const hashedPassword = await hash(password, 10);

    const user = await this.usersRepository.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
    });

    return user;
  }
}
