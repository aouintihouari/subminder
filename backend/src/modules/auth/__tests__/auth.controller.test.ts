import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

jest.mock("node-cron", () => ({
  schedule: jest.fn(),
}));

import { prisma } from "../../shared/lib/prisma";
import app from "../../../app";
import { emailService } from "../../shared/services/email.service";

jest.mock("../../shared/lib/prisma", () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("../../shared/services/email.service", () => ({
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

jest.mock("jsonwebtoken", () => ({ sign: jest.fn() }));

jest.mock("crypto", () => ({
  randomBytes: jest.fn().mockImplementation(() => ({
    toString: jest.fn().mockReturnValue("mocked_random_token"),
  })),
  createHash: jest.fn().mockImplementation(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue("hashed_mocked_token"),
  })),
}));

describe("Auth Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/auth/signup", () => {
    it("should register a new user and send verification email", async () => {
      const newUser = {
        id: 1,
        email: "new@example.com",
        name: "New User",
        createdAt: new Date(),
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue("salt");
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
      (prisma.user.create as jest.Mock).mockResolvedValue(newUser);

      const response = await request(app).post("/api/v1/auth/signup").send({
        email: "new@example.com",
        password: "password123",
        passwordConfirm: "password123",
        name: "New User",
      });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.data.user.email).toBe("new@example.com");
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: "new@example.com",
            password: "hashed_password",
            verificationToken: "mocked_random_token",
            isVerified: false,
          }),
        })
      );
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        "new@example.com",
        "New User",
        "mocked_random_token"
      );
    });

    it("should fail if email is already in use", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        email: "existing@example.com",
      });

      const response = await request(app).post("/api/v1/auth/signup").send({
        email: "existing@example.com",
        password: "password123",
        passwordConfirm: "password123",
        name: "Existing User",
      });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe("This email is already in use");
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("should return 400 if email is invalid", async () => {
      const response = await request(app).post("/api/v1/auth/signup").send({
        email: "invalid-email",
        password: "password123",
        passwordConfirm: "password123",
        name: "User",
      });

      expect(response.status).toBe(400);
    });

    it("should return 400 if passwords do not match", async () => {
      const response = await request(app).post("/api/v1/auth/signup").send({
        email: "test@example.com",
        password: "password123",
        passwordConfirm: "different123",
        name: "User",
      });

      expect(response.status).toBe(400);
    });

    it("should return 400 if password is too short", async () => {
      const response = await request(app).post("/api/v1/auth/signup").send({
        email: "test@example.com",
        password: "123",
        passwordConfirm: "123",
        name: "User",
      });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/v1/auth/verify-email", () => {
    it("should verify email with valid token", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        verificationToken: "mocked_random_token",
        verificationTokenExpiresAt: new Date(Date.now() + 3600000),
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        isVerified: true,
        verificationToken: null,
      });

      const response = await request(app)
        .post("/api/v1/auth/verify-email")
        .send({ token: "mocked_random_token" });

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/Email verified successfully/);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({
            isVerified: true,
            verificationToken: null,
            verificationTokenExpiresAt: null,
          }),
        })
      );
    });

    it("should return 400 if token is missing", async () => {
      const response = await request(app)
        .post("/api/v1/auth/verify-email")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/token is missing/i);
    });

    it("should return 400 if token is invalid or expired", async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post("/api/v1/auth/verify-email")
        .send({ token: "invalid_token" });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Invalid or expired/i);
    });

    it("should return 400 if token is expired", async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post("/api/v1/auth/verify-email")
        .send({ token: "mocked_random_token" });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/expired/i);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should return 200 and a cookie if credentials are valid", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: "hashedPassword",
        isVerified: true,
        name: "Test User",
        role: "USER",
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue("fake-jwt-token");

      const response = await request(app).post("/api/v1/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeUndefined();
      expect(response.headers["set-cookie"]).toBeDefined();
      const cookies = response.headers["set-cookie"];
      expect(cookies[0]).toMatch(/jwt=fake-jwt-token/);
      expect(cookies[0]).toMatch(/HttpOnly/);
      expect(response.body.data.user.email).toBe("test@example.com");
    });

    it("should return 403 if user is NOT verified", async () => {
      const mockUser = {
        id: 1,
        email: "unverified@example.com",
        password: "hashedPassword",
        isVerified: false,
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const response = await request(app).post("/api/v1/auth/login").send({
        email: "unverified@example.com",
        password: "password123",
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/verify your email/i);
    });

    it("should return 401 if password is incorrect", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: "hashedPassword",
        isVerified: true,
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const response = await request(app).post("/api/v1/auth/login").send({
        email: "test@example.com",
        password: "wrongPassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid email or password");
    });

    it("should return 401 if user does not exist", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app).post("/api/v1/auth/login").send({
        email: "unknown@example.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid email or password");
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    it("should clear the jwt cookie and return 200", async () => {
      const response = await request(app).post("/api/v1/auth/logout");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.headers["set-cookie"]).toBeDefined();
      const cookies = response.headers["set-cookie"];
      expect(cookies[0]).toMatch(/jwt=loggedout/);
      expect(cookies[0]).toMatch(/HttpOnly/);
    });
  });

  describe("POST /api/v1/auth/forgot-password", () => {
    it("should return 200 and send email if user exists", async () => {
      const mockUser = { id: 1, email: "test@example.com", name: "User" };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: "test@example.com" });

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/If this email exists/);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({
            passwordResetToken: "hashed_mocked_token",
          }),
        })
      );
    });

    it("should return 200 even if user does NOT exist (Security)", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: "unknown@example.com" });

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/If this email exists/);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it("should handle email sending errors gracefully", async () => {
      const mockUser = { id: 1, email: "test@example.com", name: "User" };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({});
      (emailService.sendPasswordResetEmail as jest.Mock).mockRejectedValue(
        new Error("Email service down")
      );

      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: "test@example.com" });

      expect(response.status).toBe(500);
      expect(response.body.message).toMatch(/Something went wrong!/);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: {
            passwordResetToken: null,
            passwordResetExpires: null,
          },
        })
      );
    });
  });

  describe("PATCH /api/v1/auth/reset-password/:token", () => {
    it("should reset password successfully with valid token", async () => {
      const mockUser = { id: 1, email: "test@example.com" };
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue("salt");
      (bcrypt.hash as jest.Mock).mockResolvedValue("new_hashed_password");

      const response = await request(app)
        .post("/api/v1/auth/reset-password/valid_token")
        .send({
          password: "newPassword123",
          passwordConfirm: "newPassword123",
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/Password successfully reset/);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({
            password: "new_hashed_password",
            passwordResetToken: null,
            passwordResetExpires: null,
          }),
        })
      );
    });

    it("should return 400 if token is invalid or expired", async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post("/api/v1/auth/reset-password/invalid_token")
        .send({
          password: "newPassword123",
          passwordConfirm: "newPassword123",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/Token is invalid or has expired/);
    });
  });
});
