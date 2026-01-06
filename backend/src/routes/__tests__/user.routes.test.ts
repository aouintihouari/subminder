import request from "supertest";
import { mockReset, DeepMockProxy } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

jest.mock("../../lib/prisma");
jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
  genSalt: jest.fn(),
}));

import app from "../../app";
import { prisma } from "../../lib/prisma";

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("User Routes (Profile Management)", () => {
  let token: string;
  const mockUser = {
    id: 1,
    email: "test@example.com",
    name: "Old Name",
    password: "hashedPassword123",
    role: "USER",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockReset(prismaMock);
    jest.clearAllMocks();

    process.env.JWT_SECRET = "test-secret";
    token = jwt.sign({ id: mockUser.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
  });

  describe("PATCH /api/v1/users/update-me", () => {
    it("should update user name successfully", async () => {
      prismaMock.user.update.mockResolvedValue({
        ...mockUser,
        name: "New Name",
      } as any);

      const response = await request(app)
        .patch("/api/v1/users/update-me")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "New Name" });
      expect(response.status).toBe(200);
      expect(response.body.data.user.name).toBe("New Name");
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          data: { name: "New Name" },
        })
      );
    });

    it("should fail validation if name is empty", async () => {
      const response = await request(app)
        .patch("/api/v1/users/update-me")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "" });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation failed");
    });
  });

  describe("PATCH /api/v1/users/update-password", () => {
    const passwordData = {
      currentPassword: "oldpassword",
      newPassword: "newsecurepassword",
      passwordConfirm: "newsecurepassword",
    };

    it("should update password successfully", async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue("newHashedPassword");
      prismaMock.user.update.mockResolvedValue({ ...mockUser } as any);

      const response = await request(app)
        .patch("/api/v1/users/update-password")
        .set("Authorization", `Bearer ${token}`)
        .send(passwordData);

      expect(response.status).toBe(200);
      expect(prismaMock.user.update).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalled();
    });

    it("should fail if current password is incorrect", async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .patch("/api/v1/users/update-password")
        .set("Authorization", `Bearer ${token}`)
        .send(passwordData);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Incorrect current password");

      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it("should fail if new passwords do not match", async () => {
      const response = await request(app)
        .patch("/api/v1/users/update-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          ...passwordData,
          passwordConfirm: "mismatch",
        });

      expect(response.status).toBe(400);
    });

    it("should fail if new password is same as current password", async () => {
      const response = await request(app)
        .patch("/api/v1/users/update-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: "password123",
          newPassword: "password123",
          passwordConfirm: "password123",
        });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].message).toBe(
        "New password must be different from the current password"
      );
    });
  });

  describe("DELETE /api/v1/users/delete-me", () => {
    it("should delete the user account", async () => {
      prismaMock.user.delete.mockResolvedValue(mockUser as any);

      const response = await request(app)
        .delete("/api/v1/users/delete-me")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(204); // No Content
      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });
  });

  describe("Security Checks", () => {
    it("should return 401 if trying to update profile without login", async () => {
      const response = await request(app)
        .patch("/api/v1/users/update-me")
        .send({ name: "Hacker" });
      expect(response.status).toBe(401);
    });

    it("should return 401 if trying to delete account without login", async () => {
      const response = await request(app).delete("/api/v1/users/delete-me");
      expect(response.status).toBe(401);
    });
  });

  describe("Server Error Handling", () => {
    it("should return 500 if database fails during update", async () => {
      prismaMock.user.update.mockRejectedValue(
        new Error("Database connection lost")
      );

      const response = await request(app)
        .patch("/api/v1/users/update-me")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "New Name" });

      expect(response.status).toBe(500);
      expect(response.body.status).toBe("error");
    });
  });
});
