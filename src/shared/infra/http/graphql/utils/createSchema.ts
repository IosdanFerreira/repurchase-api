import HealthResolver from "./HealthResolver";
import UserResolver from "@modules/users/infra/http/graphql/resolvers/UserResolver";
import WebWhatsappResolver from "@modules/communication/infra/http/graphql/resolvers/WebWhatsappResolver";
import WhatsAppTemplateResolver from "@modules/communication/infra/http/graphql/resolvers/WhatsAppTemplateResolver";
import { buildSchema } from "type-graphql";

export async function createSchema() {
  const schema = await buildSchema({
    resolvers: [
      UserResolver,
      HealthResolver,
      WebWhatsappResolver,
      WhatsAppTemplateResolver,
    ],
    emitSchemaFile: {
      path: "schema.graphql",
      commentDescriptions: true,
      sortedSchema: false,
    },
    dateScalarMode: "isoDate",
    validate: false,
  });

  return schema;
}
