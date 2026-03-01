interface IAuthConfig {
  jwt: {
    secret: string;
  };
}

const authConfig: IAuthConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || "default-secret-change-in-production",
  },
};

export default authConfig;
