import { Field, ObjectType } from "type-graphql";

import User from "@modules/users/infra/prisma/entities/User";

@ObjectType()
export default class AuthResponse {
  @Field(() => User)
  user: User;

  @Field()
  access_token: string;

  @Field()
  refresh_token: string;
}
