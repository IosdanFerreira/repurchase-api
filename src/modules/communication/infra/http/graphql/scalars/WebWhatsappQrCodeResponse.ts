import { Field, ObjectType } from "type-graphql";

@ObjectType()
export default class WebWhatsappQrCodeResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  qr_code?: string;

  @Field({ nullable: true })
  qr_code_base64?: string;

  @Field({ nullable: true })
  instance_id?: string;

  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  error?: string;
}
