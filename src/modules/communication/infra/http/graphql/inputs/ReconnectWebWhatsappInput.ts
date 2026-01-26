import { Field, InputType } from "type-graphql";

@InputType()
export default class ReconnectWebWhatsappInput {
  @Field()
  entity_id: string;
}
