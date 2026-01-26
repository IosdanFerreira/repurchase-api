import { Field, ObjectType } from "type-graphql";
import { Query, Resolver } from "type-graphql";

@ObjectType()
class HealthCheck {
  @Field()
  status: string;

  @Field()
  message: string;

  @Field()
  timestamp: Date;

  @Field()
  uptime: number;
}

@ObjectType()
class HelloWorld {
  @Field()
  message: string;

  @Field()
  version: string;

  @Field()
  description: string;
}

@Resolver()
export default class HealthResolver {
  @Query(() => HealthCheck, { description: "Check API health status" })
  health(): HealthCheck {
    return {
      status: "ok",
      message: "REPURCHASE API is running!",
      timestamp: new Date(),
      uptime: process.uptime(),
    };
  }

  @Query(() => HelloWorld, { description: "Hello World endpoint" })
  hello(): HelloWorld {
    return {
      message: "Hello, World! Welcome to REPURCHASE API",
      version: "1.0.0",
      description:
        "Aplicação que estrutura o remarketing, com integração com o whatsapp(whatsmeow), integração com o wordpress(woocommerce)",
    };
  }
}
