import request from "supertest";
import { mockReset, DeepMockProxy } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

jest.mock("../../lib/prisma");

import app from "../../app";
import { prisma } from "../../lib/prisma";

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("Subscription Routes", () => {
  let token: string;
  const mockUser = {
    id: 1,
    email: "test@example.com",
    role: "USER",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockReset(prismaMock);
    process.env.JWT_SECRET = "test-secret";
    token = jwt.sign({ id: mockUser.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
  });

  describe("POST /api/v1/subscriptions", () => {
    const validData = {
      name: "Netflix",
      price: 15.99,
      currency: "EUR",
      frequency: "MONTHLY",
      category: "ENTERTAINMENT",
      startDate: "2024-01-01T00:00:00.000Z",
      description: "Remember to cancel after trial",
    };

    it("should create a subscription successfully", async () => {
      prismaMock.subscription.create.mockResolvedValue({
        id: 101,
        ...validData,
        userId: mockUser.id,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const response = await request(app)
        .post("/api/v1/subscriptions")
        .set("Authorization", `Bearer ${token}`)
        .send(validData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.data.subscription.name).toBe("Netflix");
      expect(response.body.data.subscription.category).toBe("ENTERTAINMENT");
      expect(response.body.data.subscription.description).toBe(
        "Remember to cancel after trial"
      );

      expect(prismaMock.subscription.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: mockUser.id,
            category: "ENTERTAINMENT",
          }),
        })
      );
    });

    it("should fail if category is invalid", async () => {
      const invalidData = { ...validData, category: "INVALID_CATEGORY" };

      const response = await request(app)
        .post("/api/v1/subscriptions")
        .set("Authorization", `Bearer ${token}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation failed");
      expect(response.body.errors[0].message).toMatch(/Invalid category/);
    });

    it("should fail if not authenticated", async () => {
      const response = await request(app)
        .post("/api/v1/subscriptions")
        .send(validData);

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/v1/subscriptions", () => {
    it("should return a list of user subscriptions", async () => {
      const mockSubs = [
        {
          id: 1,
          name: "Spotify",
          userId: mockUser.id,
          category: "ENTERTAINMENT",
        },
        { id: 2, name: "Gym", userId: mockUser.id, category: "HEALTH" },
      ];

      prismaMock.subscription.findMany.mockResolvedValue(mockSubs as any);

      const response = await request(app)
        .get("/api/v1/subscriptions")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.results).toBe(2);
      expect(response.body.data.subscriptions[0].name).toBe("Spotify");

      expect(prismaMock.subscription.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUser.id },
        })
      );
    });
  });

  describe("PATCH /api/v1/subscriptions/:id", () => {
    const updateData = {
      price: 19.99,
      description: "Updated price",
    };

    it("should update a subscription successfully", async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        id: 1,
        userId: mockUser.id,
      } as any);

      prismaMock.subscription.update.mockResolvedValue({
        id: 1,
        name: "Netflix",
        price: 19.99,
        currency: "EUR",
        frequency: "MONTHLY",
        userId: mockUser.id,
        description: "Updated price",
      } as any);

      const response = await request(app)
        .patch("/api/v1/subscriptions/1")
        .set("Authorization", `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.subscription.price).toBe(19.99);
      expect(response.body.data.subscription.description).toBe("Updated price");
    });

    it("should fail (404) if subscription belongs to another user", async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        id: 1,
        userId: 2,
      } as any);

      const response = await request(app)
        .patch("/api/v1/subscriptions/1")
        .set("Authorization", `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/v1/subscriptions/:id", () => {
    it("should delete a subscription successfully", async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        id: 1,
        userId: mockUser.id,
      } as any);

      prismaMock.subscription.delete.mockResolvedValue({ id: 1 } as any);

      const response = await request(app)
        .delete("/api/v1/subscriptions/1")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(204);
    });

    it("should fail if subscription does not exist", async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .delete("/api/v1/subscriptions/999")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });
});
