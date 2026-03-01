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
import RegisterUserService from "@modules/users/services/RegisterUserService";
import GetUserByIdService from "@modules/users/services/GetUserByIdService";
import AuthenticateUserService from "@modules/users/services/AuthenticateUserService";
import ListUsersService from "@modules/users/services/ListUsersService";
import GoogleAuthService from "@modules/users/services/GoogleAuthService";
import RegisterUserInput from "../inputs/RegisterUserInput";
import LoginUserInput from "../inputs/LoginUserInput";
import AuthPayload from "../scalars/AuthPayload";
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
    return getUserById.execute({ user_id: ctx.userId! });
  }

  @Mutation(() => AuthPayload)
  @UseMiddleware(rateLimiterMiddleware)
  async registerUser(
    @Arg("input") input: RegisterUserInput,
  ): Promise<AuthPayload> {
    const registerUser = container.resolve(RegisterUserService);
    return registerUser.execute({
      firstName: input.first_name,
      lastName: input.last_name,
      email: input.email,
      phone: input.phone,
      password: input.password,
    });
  }

  @Mutation(() => AuthPayload)
  @UseMiddleware(rateLimiterMiddleware)
  async loginUser(@Arg("input") input: LoginUserInput): Promise<AuthPayload> {
    const authenticateUser = container.resolve(AuthenticateUserService);
    return authenticateUser.execute({
      email: input.email,
      password: input.password,
    });
  }

  @Mutation(() => AuthPayload)
  @UseMiddleware(rateLimiterMiddleware)
  async googleSignIn(@Arg("idToken") idToken: string): Promise<AuthPayload> {
    const googleAuth = container.resolve(GoogleAuthService);
    return googleAuth.execute({ idToken });
  }
}
