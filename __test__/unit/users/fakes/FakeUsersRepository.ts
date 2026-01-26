import ICreateUserDTO from "@modules/users/dtos/ICreateUserDTO";
import IUsersRepository from "@modules/users/repositories/IUsersRepository";
import User from "@modules/users/infra/prisma/entities/User";
import { v4 as uuid } from "uuid";

export default class FakeUsersRepository implements IUsersRepository {
  private users: User[] = [];

  public async findById(id: string): Promise<User | undefined> {
    return this.users.find((user) => user.id === id);
  }

  public async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }

  public async create(data: ICreateUserDTO): Promise<User> {
    const user = new User();

    Object.assign(user, {
      id: uuid(),
      ...data,
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    this.users.push(user);

    return user;
  }

  public async save(user: User): Promise<User> {
    const findIndex = this.users.findIndex((u) => u.id === user.id);

    if (findIndex >= 0) {
      this.users[findIndex] = user;
    }

    return user;
  }

  public async delete(id: string): Promise<void> {
    this.users = this.users.filter((user) => user.id !== id);
  }

  public async findAll(): Promise<User[]> {
    return this.users;
  }
}
