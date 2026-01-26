import { Field, InputType } from "type-graphql";
import { IsEmail, MinLength } from "class-validator";

@InputType()
export default class LoginInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(6)
  password: string;
}
