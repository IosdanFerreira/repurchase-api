import { inject, injectable } from "tsyringe";
import IUsersRepository from "../repositories/IUsersRepository";
import User from "../infra/prisma/entities/User";

@injectable()
export default class ListUsersService {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
  ) {}

  public async execute(): Promise<User[]> {
    const users = await this.usersRepository.findAll();
    return users;
  }
}
