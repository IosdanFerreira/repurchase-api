import { Field, InputType } from "type-graphql";

@InputType()
export default class GenerateWebWhatsappQrCodeInput {
  @Field()
  entity_id: string;

  @Field({ nullable: true })
  entity_name?: string;
}
