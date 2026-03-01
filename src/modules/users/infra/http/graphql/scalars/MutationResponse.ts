import { Field, ObjectType } from "type-graphql";

@ObjectType()
export default class MutationResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
