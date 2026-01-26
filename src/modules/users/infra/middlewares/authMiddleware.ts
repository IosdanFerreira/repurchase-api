import AppError from "@shared/errors/AppError";
import { IUserContext } from "@modules/users/infra/http/graphql/context/IUserContext";
import { MiddlewareFn } from "type-graphql";
import authConfig from "@config/auth";
import { verify } from "jsonwebtoken";

interface ITokenPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

const authMiddleware: MiddlewareFn<IUserContext> = async (
  { context },
  next,
) => {
  const authHeader = context.req.headers.authorization;

  if (!authHeader) {
    throw new AppError("JWT token is missing");
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = verify(token, authConfig.jwt.secret) as ITokenPayload;

    context.user = {
      id: decoded.id,
      email: decoded.email,
    };

    return next();
  } catch {
    throw new AppError("Invalid JWT token");
  }
};

export default authMiddleware;
