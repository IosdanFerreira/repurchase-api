import { Field, ObjectType } from "type-graphql";

@ObjectType()
export default class Address {
  @Field()
  cep: string;

  @Field()
  street: string;

  @Field()
  number: string;

  @Field()
  neighborhood: string;

  @Field()
  city: string;

  @Field()
  state: string;
}
