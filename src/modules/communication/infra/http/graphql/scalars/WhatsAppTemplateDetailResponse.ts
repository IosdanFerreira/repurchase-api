import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class TemplateContentItem {
  @Field()
  id: string;

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

  @Field()
  is_customized: boolean;
}

@ObjectType()
export class TemplateVariableItem {
  @Field()
  id: string;

  @Field()
  variable_name: string;

  @Field()
  variable_key: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  is_required: boolean;
}

@ObjectType()
export default class WhatsAppTemplateDetailResponse {
  @Field()
  id: string;

  @Field()
  template_name: string;

  @Field()
  template_slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  enabled: boolean;

  @Field()
  is_customized: boolean;

  @Field()
  allow_customization: boolean;

  @Field(() => [TemplateContentItem])
  contents: TemplateContentItem[];

  @Field(() => [TemplateVariableItem])
  variables: TemplateVariableItem[];
}
