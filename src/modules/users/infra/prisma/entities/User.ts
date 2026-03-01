import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export default class User {
  @Field(() => ID)
  id: string;

  @Field({ name: "first_name" })
  firstName: string;

  @Field({ name: "last_name" })
  lastName: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  phone?: string;

  password?: string;

  @Field({ name: "is_staff" })
  isStaff: boolean;

  @Field(() => String, { nullable: true, name: "google_id" })
  googleId?: string;

  @Field(() => String, { nullable: true, name: "company_id" })
  companyId?: string;

  @Field({ name: "created_at" })
  createdAt: Date;

  @Field({ name: "updated_at" })
  updatedAt: Date;
}
