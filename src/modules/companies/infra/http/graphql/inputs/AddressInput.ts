import { Field, InputType } from "type-graphql";

@InputType()
export default class AddressInput {
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
