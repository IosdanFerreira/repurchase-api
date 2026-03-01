import { Field, InputType } from "type-graphql";
import { Length, MinLength } from "class-validator";

@InputType()
export default class ResetPasswordInput {
  @Field()
  @Length(6, 6)
  token: string;

  @Field()
  @MinLength(8)
  new_password: string;
}
