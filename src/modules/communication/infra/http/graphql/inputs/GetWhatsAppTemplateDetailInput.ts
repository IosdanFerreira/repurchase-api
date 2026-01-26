import { Field, InputType } from "type-graphql";

@InputType()
export default class GetWhatsAppTemplateDetailInput {
  @Field()
  template_id: string;

  @Field()
  entity_id: string;
}
