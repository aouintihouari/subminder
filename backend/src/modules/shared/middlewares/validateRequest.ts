import { ZodType } from "zod";
import { Request, Response, NextFunction } from "express";

export const validateRequest =
  (schema: ZodType) =>
  async (req: Request, _: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      return next();
    } catch (error) {
      return next(error);
    }
  };
