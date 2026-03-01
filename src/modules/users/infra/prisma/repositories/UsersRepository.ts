import ICreateUserDTO from "@modules/users/dtos/ICreateUserDTO";
import IUsersRepository from "@modules/users/repositories/IUsersRepository";
import User from "../entities/User";
import prisma from "@shared/database/prisma";

type PrismaUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  password: string | null;
  isStaff: boolean;
  googleId: string | null;
  companyId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function toUser(data: PrismaUser): User {
  const user = new User();
  Object.assign(user, {
    ...data,
    phone: data.phone ?? undefined,
    password: data.password ?? undefined,
    isStaff: data.isStaff,
    googleId: data.googleId ?? undefined,
    companyId: data.companyId ?? undefined,
  });
  return user;
}

export default class UsersRepository implements IUsersRepository {
  public async findById(id: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user ? toUser(user) : undefined;
  }

  public async findByEmail(email: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user ? toUser(user) : undefined;
  }

  public async findByGoogleId(googleId: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { googleId },
    });

    return user ? toUser(user) : undefined;
  }

  public async create(data: ICreateUserDTO): Promise<User> {
    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone ?? null,
        password: data.password ?? null,
        googleId: data.googleId ?? null,
      },
    });

    return toUser(user);
  }

  public async save(user: User): Promise<User> {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone ?? null,
        password: user.password ?? null,
        isStaff: user.isStaff,
        googleId: user.googleId ?? null,
      },
    });

    return toUser(updatedUser);
  }

  public async updateCompanyId(
    userId: string,
    companyId: string,
  ): Promise<User> {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { companyId },
    });

    return toUser(updatedUser);
  }

  public async updatePassword(userId: string, password: string): Promise<User> {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password },
    });

    return toUser(updatedUser);
  }

  public async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  public async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany();
    return users.map(toUser);
  }
}
