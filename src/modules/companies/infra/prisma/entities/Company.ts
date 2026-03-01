import { Field, ID, ObjectType } from "type-graphql";

import Address from "./Address";

@ObjectType()
export default class Company {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  cnpj: string;

  @Field()
  phone: string;

  @Field()
  segment: string;

  @Field(() => String, { nullable: true, name: "logo_url" })
  logoUrl?: string;

  // Flat address fields from Prisma (not exposed directly)
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;

  @Field(() => Address)
  address: Address;

  @Field({ name: "created_at" })
  createdAt: Date;

  @Field({ name: "updated_at" })
  updatedAt: Date;
}
