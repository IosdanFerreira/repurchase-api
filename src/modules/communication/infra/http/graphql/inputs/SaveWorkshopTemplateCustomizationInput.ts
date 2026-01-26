import { Field, InputType, Int } from "type-graphql";

@InputType()
export class TemplateContentInput {
  @Field({ nullable: true })
  content_id?: string;

  @Field(() => Int)
  order: number;

  @Field()
  content: string;

  @Field({ nullable: true })
  header_text?: string;

  @Field({ nullable: true })
  footer_text?: string;

  @Field()
  enabled: boolean;
}

@InputType()
export default class SaveWorkshopTemplateCustomizationInput {
  @Field()
  template_id: string;

  @Field()
  entity_id: string;

  @Field(() => [TemplateContentInput])
  contents: TemplateContentInput[];
}
