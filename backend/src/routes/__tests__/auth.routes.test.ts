import request from "supertest";
import { mockReset, DeepMockProxy } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";

jest.mock("../../lib/prisma");

jest.mock("../../services/email.service", () => ({
  emailService: {
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
  genSalt: jest.fn(),
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
  beforeEach(() => {
    mockReset(prismaMock);
  });

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

describe("POST /api/v1/auth/login", () => {
  beforeEach(() => {
    mockReset(prismaMock);
    jest.clearAllMocks();
  });

  it("should login successfully and return JWT cookie", async () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      password: "hashed_password",
      isVerified: true,
      name: "Test User",
      role: "USER",
    };

    prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

    const bcrypt = require("bcryptjs");
    bcrypt.compare = jest.fn().mockResolvedValue(true);

    const response = await request(app).post("/api/v1/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.user.email).toBe("test@example.com");
    expect(response.headers["set-cookie"]).toBeDefined();
  });

  it("should fail with incorrect password", async () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      password: "hashed_password",
      isVerified: true,
    };

    prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

    const bcrypt = require("bcryptjs");
    bcrypt.compare = jest.fn().mockResolvedValue(false);

    const response = await request(app).post("/api/v1/auth/login").send({
      email: "test@example.com",
      password: "wrongPassword",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid email or password");
  });

  it("should fail if user does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const response = await request(app).post("/api/v1/auth/login").send({
      email: "nonexistent@example.com",
      password: "password123",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid email or password");
  });

  it("should fail if user is not verified", async () => {
    const mockUser = {
      id: 1,
      email: "unverified@example.com",
      password: "hashed_password",
      isVerified: false,
    };

    prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

    const bcrypt = require("bcryptjs");
    bcrypt.compare = jest.fn().mockResolvedValue(true);

    const response = await request(app).post("/api/v1/auth/login").send({
      email: "unverified@example.com",
      password: "password123",
    });

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/verify your email/i);
  });

  it("should reject invalid email format", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      email: "not-an-email",
      password: "password123",
    });

    expect(response.status).toBe(400);
  });
});

describe("POST /api/v1/auth/logout", () => {
  it("should logout successfully and clear JWT cookie", async () => {
    const response = await request(app).post("/api/v1/auth/logout");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.headers["set-cookie"]).toBeDefined();
    expect(response.headers["set-cookie"][0]).toMatch(/jwt=loggedout/);
  });
});

describe("GET /api/v1/auth/me", () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  it("should return 401 if no token is provided", async () => {
    const response = await request(app).get("/api/v1/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/logged in/i);
  });

  it("should return 401 if token is invalid", async () => {
    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/invalid token/i);
  });

  it("should return user profile if token is valid", async () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      role: "USER",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

    process.env.JWT_SECRET = "test-secret";
    const token = require("jsonwebtoken").sign({ id: 1 }, "test-secret", {
      expiresIn: "1h",
    });

    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.user.email).toBe("test@example.com");
    expect(response.body.data.user).not.toHaveProperty("password");
  });
});

describe("POST /api/v1/auth/forgot-password", () => {
  beforeEach(() => {
    mockReset(prismaMock);
    jest.clearAllMocks();
  });

  it("should send reset email for existing user", async () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      name: "Test User",
    };

    prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
    prismaMock.user.update.mockResolvedValue({} as any);

    const emailService = require("../../services/email.service").emailService;
    emailService.sendPasswordResetEmail = jest
      .fn()
      .mockResolvedValue(undefined);

    const response = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: "test@example.com" });

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/If this email exists/);
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({
          passwordResetToken: expect.any(String),
        }),
      })
    );
  });

  it("should return 200 even for non-existing email (security)", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: "nonexistent@example.com" });

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/If this email exists/);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("should reject invalid email format", async () => {
    const response = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: "bad-email" });

    expect(response.status).toBe(400);
  });

  it("should handle email service failures gracefully", async () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      name: "Test User",
    };

    prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
    prismaMock.user.update.mockResolvedValue({} as any);

    const emailService = require("../../services/email.service").emailService;
    emailService.sendPasswordResetEmail = jest
      .fn()
      .mockRejectedValue(new Error("Email service down"));

    const response = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: "test@example.com" });

    expect(response.status).toBe(500);
    expect(response.body.message).toMatch(/Something went wrong!/);
  });
});

describe("POST /api/v1/auth/reset-password/:token", () => {
  beforeEach(() => {
    mockReset(prismaMock);
    jest.clearAllMocks();
  });

  it("should reset password successfully with valid token", async () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      passwordResetToken: "hashed_token",
      passwordResetExpires: new Date(Date.now() + 3600000),
    };

    prismaMock.user.findFirst.mockResolvedValue(mockUser as any);
    prismaMock.user.update.mockResolvedValue({
      ...mockUser,
      passwordResetToken: null,
      passwordResetExpires: null,
    } as any);

    const bcrypt = require("bcryptjs");
    bcrypt.genSalt = jest.fn().mockResolvedValue("salt");
    bcrypt.hash = jest.fn().mockResolvedValue("new_hashed_password");

    const response = await request(app)
      .post("/api/v1/auth/reset-password/valid_token")
      .send({
        password: "newPassword123",
        passwordConfirm: "newPassword123",
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/Password successfully reset/);
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({
          passwordResetToken: null,
          passwordResetExpires: null,
        }),
      })
    );
  });

  it("should fail with invalid or expired token", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/v1/auth/reset-password/invalid_token")
      .send({
        password: "newPassword123",
        passwordConfirm: "newPassword123",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Token is invalid or has expired/);
  });

  it("should reject request with mismatched passwords", async () => {
    const response = await request(app)
      .post("/api/v1/auth/reset-password/sometoken")
      .send({
        password: "pass",
        passwordConfirm: "word",
      });

    expect(response.status).toBe(400);
  });

  it("should reject weak passwords", async () => {
    const response = await request(app)
      .post("/api/v1/auth/reset-password/sometoken")
      .send({
        password: "123",
        passwordConfirm: "123",
      });

    expect(response.status).toBe(400);
  });
});
