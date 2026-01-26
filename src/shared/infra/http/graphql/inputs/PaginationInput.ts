import { Field, InputType } from "type-graphql";

@InputType()
export class PaginationInput {
  @Field({ nullable: true, defaultValue: 1 })
  page?: number;

  @Field({ nullable: true, defaultValue: 10 })
  limit?: number;
}
