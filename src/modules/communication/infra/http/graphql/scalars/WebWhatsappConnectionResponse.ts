import { Field, ObjectType } from "type-graphql";

@ObjectType()
export default class WebWhatsappConnectionResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  error?: string;
}
