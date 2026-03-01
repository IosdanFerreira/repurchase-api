import { Resolver, Mutation, Arg, UseMiddleware } from "type-graphql";
import { container } from "tsyringe";
import RequestPasswordResetService from "@modules/users/services/RequestPasswordResetService";
import ResetPasswordService from "@modules/users/services/ResetPasswordService";
import ResetPasswordInput from "../inputs/ResetPasswordInput";
import MutationResponse from "../scalars/MutationResponse";
import rateLimiterMiddleware from "@modules/users/infra/middlewares/rateLimiterMiddleware";

@Resolver()
export default class PasswordResolver {
  @Mutation(() => MutationResponse)
  @UseMiddleware(rateLimiterMiddleware)
  async requestPasswordReset(
    @Arg("email") email: string,
  ): Promise<MutationResponse> {
    const requestPasswordReset = container.resolve(RequestPasswordResetService);
    return requestPasswordReset.execute({ email });
  }

  @Mutation(() => MutationResponse)
  @UseMiddleware(rateLimiterMiddleware)
  async resetPassword(
    @Arg("input") input: ResetPasswordInput,
  ): Promise<MutationResponse> {
    const resetPassword = container.resolve(ResetPasswordService);
    return resetPassword.execute({
      token: input.token,
      newPassword: input.new_password,
    });
  }
}
