import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validateRequest } from "../validateRequest";

describe("validateRequest Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { body: {}, query: {}, params: {} };
    res = {};
    next = jest.fn();
  });

  const testSchema = z.object({
    body: z.object({
      name: z.string().min(3),
    }),
  });

  it("should call next() if validation passes", async () => {
    req.body = { name: "ValidName" };

    const middleware = validateRequest(testSchema);
    await middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it("should call next(error) if validation fails", async () => {
    req.body = { name: "No" }; // Trop court

    const middleware = validateRequest(testSchema);
    await middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    const errorArg = (next as jest.Mock).mock.calls[0][0];
    expect(errorArg).toBeInstanceOf(z.ZodError);
  });
});
