import { Field, InputType } from "type-graphql";

import { IsEmail } from "class-validator";

@InputType()
export default class LoginUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  password: string;
}
