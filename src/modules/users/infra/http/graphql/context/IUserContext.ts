import { Request, Response } from "express";

export interface IUserContext {
  req: Request;
  res: Response;
  userId?: string;
}
