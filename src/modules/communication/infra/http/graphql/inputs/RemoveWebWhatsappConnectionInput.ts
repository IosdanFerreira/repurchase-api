import { Field, InputType } from "type-graphql";

@InputType()
export default class RemoveWebWhatsappConnectionInput {
  @Field()
  entity_id: string;
}
