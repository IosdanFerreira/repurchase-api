import fs from "fs";
import path from "path";

interface IAuthConfig {
  jwt: {
    secret: string;
    privateKey: string;
    publicKey: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
  };
}

const privateKeyPath = path.resolve(
  __dirname,
  "..",
  "..",
  "keys",
  "private.key",
);
const publicKeyPath = path.resolve(__dirname, "..", "..", "keys", "public.key");

let privateKey = "";
let publicKey = "";

try {
  if (fs.existsSync(privateKeyPath)) {
    privateKey = fs.readFileSync(privateKeyPath, "utf8");
  }
  if (fs.existsSync(publicKeyPath)) {
    publicKey = fs.readFileSync(publicKeyPath, "utf8");
  }
} catch (error) {
  console.warn("⚠️ JWT keys not found. Using fallback secret.");
}

const authConfig: IAuthConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || "default-secret-change-in-production",
    privateKey,
    publicKey,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRATION || "180d",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || "365d",
  },
};

export default authConfig;
