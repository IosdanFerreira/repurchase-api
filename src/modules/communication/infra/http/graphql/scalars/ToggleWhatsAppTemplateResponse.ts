import { Field, ObjectType } from "type-graphql";

@ObjectType()
export default class ToggleWhatsAppTemplateResponse {
  @Field()
  success: boolean;

  @Field()
  template_id: string;

  @Field()
  enabled: boolean;

  @Field({ nullable: true })
  message?: string;
}
