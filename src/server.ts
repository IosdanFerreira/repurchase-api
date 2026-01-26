import "reflect-metadata";
import "dotenv/config";
import "@shared/container";
import "@shared/database";

import { app, httpServer, io } from "@shared/infra/http/app";

import { ApolloServer } from "apollo-server-express";
import { createSchema } from "@shared/infra/http/graphql/utils/createSchema";
import { setSocketIO } from "@modules/communication/services/WebWhatsappNotificationService";

async function bootstrap() {
  // Initialize Socket.IO for WebWhatsApp notifications
  setSocketIO(io);

  const schema = await createSchema();

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }) => ({
      req,
      res,
    }),
    playground: process.env.NODE_ENV !== "production",
    introspection: process.env.NODE_ENV !== "production",
    formatError: (error) => {
      console.error("GraphQL Error:", error);
      return {
        message: error.message,
        code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
        path: error.path,
      };
    },
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
    path: "/graphql",
  });

  const PORT = process.env.PORT || 4000;

  httpServer.listen(PORT, () => {
    console.log("🚀 ========================================");
    console.log("🚀 REPURCHASE API Started!");
    console.log("🚀 ========================================");
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🚀 GraphQL Playground: http://localhost:${PORT}/graphql`);
    console.log(`🚀 Health Check: http://localhost:${PORT}/health`);
    console.log(`🚀 Socket.IO: ws://localhost:${PORT}`);
    console.log(
      `🚀 WhatsApp Webhook: http://localhost:${PORT}/api/communication/webhooks/web-whatsapp`,
    );
    console.log("🚀 ========================================");
  });
}

bootstrap().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
