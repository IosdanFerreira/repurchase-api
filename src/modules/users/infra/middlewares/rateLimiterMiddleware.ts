import AppError from "@shared/errors/AppError";
import { IUserContext } from "@modules/users/infra/http/graphql/context/IUserContext";
import { MiddlewareFn } from "type-graphql";
import { RateLimiterMemory } from "rate-limiter-flexible";

const rateLimiter = new RateLimiterMemory({
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

const rateLimiterMiddleware: MiddlewareFn<IUserContext> = async (
  { context },
  next,
) => {
  try {
    const ip = context.req.ip || context.req.socket.remoteAddress || "unknown";
    await rateLimiter.consume(ip);
    return next();
  } catch {
    throw new AppError("Too many requests. Please try again later.");
  }
};

export default rateLimiterMiddleware;
