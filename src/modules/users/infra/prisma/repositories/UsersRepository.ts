import ICreateUserDTO from "@modules/users/dtos/ICreateUserDTO";
import IUsersRepository from "@modules/users/repositories/IUsersRepository";
import User from "../entities/User";
import prisma from "@shared/database/prisma";

export default class UsersRepository implements IUsersRepository {
  public async findById(id: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user ?? undefined;
  }

  public async findByEmail(email: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user ?? undefined;
  }

  public async create(data: ICreateUserDTO): Promise<User> {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
      },
    });

    return user;
  }

  public async save(user: User): Promise<User> {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        active: user.active,
      },
    });

    return updatedUser;
  }

  public async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  public async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany();
    return users;
  }
}
