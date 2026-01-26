import { GraphQLError } from "graphql";

export default class AppError extends GraphQLError {
  public readonly message: string;
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
  }
}
