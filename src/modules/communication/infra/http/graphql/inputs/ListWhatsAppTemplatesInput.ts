import { Field, InputType, Int } from "type-graphql";

@InputType()
export default class ListWhatsAppTemplatesInput {
  @Field()
  entity_id: string;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  per_page?: number;

  @Field({ nullable: true })
  search?: string;
}
