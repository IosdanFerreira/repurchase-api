import AppError from "@shared/errors/AppError";
import { IUserContext } from "@modules/users/infra/http/graphql/context/IUserContext";
import { MiddlewareFn } from "type-graphql";
import authConfig from "@config/auth";
import { verify } from "jsonwebtoken";

interface ITokenPayload {
  userId: string;
  iat: number;
}

const authMiddleware: MiddlewareFn<IUserContext> = async (
  { context },
  next,
) => {
  const authHeader = context.req.headers.authorization;

  if (!authHeader) {
    throw new AppError("Não autorizado.");
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = verify(token, authConfig.jwt.secret) as ITokenPayload;

    context.userId = decoded.userId;

    return next();
  } catch {
    throw new AppError("Não autorizado.");
  }
};

export default authMiddleware;
