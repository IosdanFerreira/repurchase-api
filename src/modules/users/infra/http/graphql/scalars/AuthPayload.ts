import { Field, ObjectType } from "type-graphql";

import User from "@modules/users/infra/prisma/entities/User";

@ObjectType()
export default class AuthPayload {
  @Field()
  token: string;

  @Field(() => User)
  user: User;
}
