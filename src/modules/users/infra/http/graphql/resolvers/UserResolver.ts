import {
  Resolver,
  Query,
  Mutation,
  Arg,
  UseMiddleware,
  Ctx,
} from "type-graphql";
import { container } from "tsyringe";
import User from "@modules/users/infra/prisma/entities/User";
import CreateUserService from "@modules/users/services/CreateUserService";
import GetUserByIdService from "@modules/users/services/GetUserByIdService";
import AuthenticateUserService from "@modules/users/services/AuthenticateUserService";
import ListUsersService from "@modules/users/services/ListUsersService";
import CreateUserInput from "../inputs/CreateUserInput";
import LoginInput from "../inputs/LoginInput";
import AuthResponse from "../scalars/AuthResponse";
import authMiddleware from "@modules/users/infra/middlewares/authMiddleware";
import rateLimiterMiddleware from "@modules/users/infra/middlewares/rateLimiterMiddleware";
import { IUserContext } from "../context/IUserContext";

@Resolver()
export default class UserResolver {
  @Query(() => [User])
  @UseMiddleware(rateLimiterMiddleware, authMiddleware)
  async listUsers(): Promise<User[]> {
    const listUsers = container.resolve(ListUsersService);
    return listUsers.execute();
  }

  @Query(() => User)
  @UseMiddleware(rateLimiterMiddleware, authMiddleware)
  async getUser(
    @Arg("user_id") user_id: string,
    @Ctx() _ctx: IUserContext,
  ): Promise<User> {
    const getUserById = container.resolve(GetUserByIdService);
    return getUserById.execute({ user_id });
  }

  @Query(() => User)
  @UseMiddleware(rateLimiterMiddleware, authMiddleware)
  async me(@Ctx() ctx: IUserContext): Promise<User> {
    const getUserById = container.resolve(GetUserByIdService);
    return getUserById.execute({ user_id: ctx.user!.id });
  }

  @Mutation(() => User)
  @UseMiddleware(rateLimiterMiddleware)
  async createUser(@Arg("data") data: CreateUserInput): Promise<User> {
    const createUser = container.resolve(CreateUserService);
    return createUser.execute({
      name: data.name,
      email: data.email,
      password: data.password,
    });
  }

  @Mutation(() => AuthResponse)
  @UseMiddleware(rateLimiterMiddleware)
  async login(@Arg("data") data: LoginInput): Promise<AuthResponse> {
    const authenticateUser = container.resolve(AuthenticateUserService);
    return authenticateUser.execute({
      email: data.email,
      password: data.password,
    });
  }
}
