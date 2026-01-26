import { Field, InputType } from "type-graphql";

@InputType()
export default class DisconnectWebWhatsappInput {
  @Field()
  entity_id: string;
}
