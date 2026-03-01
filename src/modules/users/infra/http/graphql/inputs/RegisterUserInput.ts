import { Field, InputType } from "type-graphql";
import { IsEmail, Length, MinLength } from "class-validator";

@InputType()
export default class RegisterUserInput {
  @Field()
  first_name: string;

  @Field()
  last_name: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  phone: string;

  @Field()
  @MinLength(8)
  password: string;
}
