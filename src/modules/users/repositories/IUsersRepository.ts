import ICreateUserDTO from "../dtos/ICreateUserDTO";
import User from "../infra/prisma/entities/User";

export default interface IUsersRepository {
  findById(id: string): Promise<User | undefined>;
  findByEmail(email: string): Promise<User | undefined>;
  findByGoogleId(googleId: string): Promise<User | undefined>;
  create(data: ICreateUserDTO): Promise<User>;
  save(user: User): Promise<User>;
  updateCompanyId(userId: string, companyId: string): Promise<User>;
  updatePassword(userId: string, password: string): Promise<User>;
  delete(id: string): Promise<void>;
  findAll(): Promise<User[]>;
}
