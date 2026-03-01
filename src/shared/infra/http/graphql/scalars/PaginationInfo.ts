import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class PaginationInfo {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int, { name: "total_pages" })
  totalPages: number;

  @Field({ name: "has_next_page" })
  hasNextPage: boolean;

  @Field({ name: "has_previous_page" })
  hasPreviousPage: boolean;
}
