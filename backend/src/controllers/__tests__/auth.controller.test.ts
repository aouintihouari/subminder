import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { prisma } from "../../lib/prisma";
import app from "../../app";

jest.mock("../../lib/prisma", () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("../../services/email.service", () => ({
  emailService: {
    sendVerificationEmail: jest.fn(),
  },
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
  genSalt: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

describe("Auth Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/auth/login", () => {
    it("should return 200 and a token if credentials are valid", async () => {
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
      expect(response.body.token).toBe("fake-jwt-token");
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
});
