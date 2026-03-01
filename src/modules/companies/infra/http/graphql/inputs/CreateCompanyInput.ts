import { Field, InputType } from "type-graphql";

import AddressInput from "./AddressInput";

@InputType()
export default class CreateCompanyInput {
  @Field()
  name: string;

  @Field()
  cnpj: string;

  @Field()
  phone: string;

  @Field()
  segment: string;

  @Field(() => AddressInput)
  address: AddressInput;
}
