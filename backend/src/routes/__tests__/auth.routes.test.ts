import request from "supertest";
import { mockReset, DeepMockProxy } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";

jest.mock("../../lib/prisma");

jest.mock("../../services/email.service", () => ({
  emailService: {
    sendVerificationEmail: jest.fn(),
  },
}));

import app from "../../app";
import { prisma } from "../../lib/prisma";

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("POST /api/v1/auth/signup", () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  it("should register a new user successfully", async () => {
    const userData = {
      email: "newuser@example.com",
      password: "password123",
      passwordConfirm: "password123",
      name: "New User",
    };

    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 1,
      ...userData,
      password: "hashed_password",
      createdAt: new Date(),
      updatedAt: new Date(),
      role: "USER",
    } as any);

    const response = await request(app)
      .post("/api/v1/auth/signup")
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("success");
    expect(response.body.data.user.email).toBe(userData.email);

    expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
  });

  it("should fail if email already exists", async () => {
    const userData = {
      email: "existing@example.com",
      password: "password123",
      passwordConfirm: "password123",
    };

    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      email: userData.email,
    } as any);

    const response = await request(app)
      .post("/api/v1/auth/signup")
      .send(userData);

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("This email is already in use");
  });

  it("should fail validation if input is invalid (Missing fields)", async () => {
    const invalidData = { email: "not-an-email" };

    const response = await request(app)
      .post("/api/v1/auth/signup")
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("fail");
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  it("should handle internal server errors gracefully", async () => {
    const userData = {
      email: "crash@example.com",
      password: "password123",
      passwordConfirm: "password123",
    };

    prismaMock.user.findUnique.mockRejectedValue(
      new Error("Database went boom 💥")
    );

    const response = await request(app)
      .post("/api/v1/auth/signup")
      .send(userData);

    expect(response.status).toBe(500);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("Something went wrong!");
  });
});

describe("POST /api/v1/auth/verify-email", () => {
  it("should verify email successfully with valid token", async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: 1,
      email: "test@example.com",
      verificationToken: "valid_token",
      verificationTokenExpiresAt: new Date(Date.now() + 3600000),
    } as any);

    prismaMock.user.update.mockResolvedValue({
      id: 1,
      isVerified: true,
      verificationToken: null,
    } as any);

    const response = await request(app)
      .post("/api/v1/auth/verify-email")
      .send({ token: "valid_token" });

    expect(response.status).toBe(200);
    expect(response.body.message).toContain("Email verified successfully");

    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({ isVerified: true }),
      })
    );
  });

  it("should fail if token is invalid or expired", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/v1/auth/verify-email")
      .send({ token: "invalid_token" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid or expired verification token");
  });

  it("should fail if token is missing from body", async () => {
    const response = await request(app)
      .post("/api/v1/auth/verify-email")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });
});
