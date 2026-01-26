import { Field, InputType } from "type-graphql";

@InputType()
export default class ToggleWhatsAppTemplateInput {
  @Field()
  template_id: string;

  @Field()
  entity_id: string;

  @Field()
  enabled: boolean;
}
