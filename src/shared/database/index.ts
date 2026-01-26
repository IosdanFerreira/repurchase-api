import "reflect-metadata";

import prisma from "./prisma";

prisma
  .$connect()
  .then(() => {
    console.log("📦 Prisma connected to database");
  })
  .catch((error) => {
    console.error("❌ Prisma connection error:", error);
  });
