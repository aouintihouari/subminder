import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { mockDeep, mockReset } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { protect } from "../protect";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

jest.mock("../../lib/prisma");
jest.mock("jsonwebtoken");

const prismaMock = prisma as unknown as ReturnType<
  typeof mockDeep<PrismaClient>
>;

describe("Protect Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { headers: {}, cookies: {} };
    res = {};
    next = jest.fn();
    mockReset(prismaMock);
    jest.clearAllMocks();
  });

  it("should throw error if no token provided", async () => {
    await protect(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = (next as jest.Mock).mock.calls[0][0];
    expect(error.message).toMatch(/logged in/);
    expect(error.statusCode).toBe(401);
  });

  it("should call next() and set user if token is valid", async () => {
    req.headers = { authorization: "Bearer valid_token" };

    (jwt.verify as jest.Mock).mockReturnValue({ id: 1 });

    const mockUser = { id: 1, email: "test@test.com", role: "USER" };
    prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

    await protect(req as Request, res as Response, next);

    expect(jwt.verify).toHaveBeenCalled();
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: { id: true, email: true, name: true, role: true },
    });
    expect((req as any).user).toEqual(mockUser);
    expect(next).toHaveBeenCalledWith();
  });

  it("should throw error if user no longer exists", async () => {
    req.headers = { authorization: "Bearer valid_token" };
    (jwt.verify as jest.Mock).mockReturnValue({ id: 99 });
    prismaMock.user.findUnique.mockResolvedValue(null);

    await protect(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = (next as jest.Mock).mock.calls[0][0];
    expect(error.message).toMatch(/no longer exist/);
  });
});
