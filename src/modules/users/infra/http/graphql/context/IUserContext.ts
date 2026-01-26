import { Request, Response } from "express";

export interface IUserContext {
  req: Request;
  res: Response;
  user?: {
    id: string;
    email: string;
  };
}
