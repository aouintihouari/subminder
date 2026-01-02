import request from "supertest";
import app from "../../app";
import { prisma } from "../../lib/prisma";

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

describe("Auth Controller - Verify Email", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should verify email successfully with valid token", async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({
      id: 1,
      email: "test@example.com",
      verificationToken: "valid-token",
    });

    const response = await request(app)
      .post("/api/v1/auth/verify-email")
      .send({ token: "valid-token" });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "Email verified successfully! You can now log in."
    );
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      },
    });
  });

  it("should return 400 if token is invalid or expired", async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
    const response = await request(app)
      .post("/api/v1/auth/verify-email")
      .send({ token: "invalid-token" });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid or expired verification token");
  });
});
