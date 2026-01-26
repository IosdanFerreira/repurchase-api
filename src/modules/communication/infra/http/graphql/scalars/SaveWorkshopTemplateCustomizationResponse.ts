import { Field, ObjectType } from "type-graphql";

@ObjectType()
export default class SaveWorkshopTemplateCustomizationResponse {
  @Field()
  success: boolean;

  @Field()
  template_id: string;

  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  error?: string;
}
