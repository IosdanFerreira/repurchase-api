import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class WhatsAppTemplateItem {
  @Field()
  id: string;

  @Field()
  template_name: string;

  @Field(() => String, { nullable: true })
  template_slug?: string | null;

  @Field({ nullable: true })
  description?: string;

  @Field()
  enabled: boolean;

  @Field()
  is_customized: boolean;

  @Field()
  active: boolean;

  @Field()
  created_at: Date;
}

@ObjectType()
export class WhatsAppTemplatesPagination {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  per_page: number;

  @Field(() => Int)
  total_pages: number;
}

@ObjectType()
export default class ListWhatsAppTemplatesResponse {
  @Field(() => [WhatsAppTemplateItem])
  templates: WhatsAppTemplateItem[];

  @Field(() => WhatsAppTemplatesPagination)
  pagination: WhatsAppTemplatesPagination;
}
