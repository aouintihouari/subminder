import request from "supertest";
import { mockReset, DeepMockProxy } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

jest.mock("node-cron", () => ({ schedule: jest.fn() }));

jest.mock("../../services/exchangeRate.service", () => ({
  exchangeRateService: {
    getRates: jest.fn().mockResolvedValue({ EUR: 1, USD: 1 }),
    updateRates: jest.fn(),
  },
}));

jest.mock("../../lib/prisma");

import app from "../../app";
import { prisma } from "../../lib/prisma";
import { exchangeRateService } from "../../services/exchangeRate.service";

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("Subscription Routes", () => {
  let token: string;
  const mockUser = {
    id: 1,
    email: "test@example.com",
    role: "USER",
    createdAt: new Date(),
    updatedAt: new Date(),
    preferredCurrency: "USD",
  };

  beforeEach(() => {
    mockReset(prismaMock);

    (exchangeRateService.getRates as jest.Mock).mockResolvedValue({
      EUR: 1,
      USD: 1,
    });

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
    });

    it("should fail if category is invalid", async () => {
      const invalidData = { ...validData, category: "INVALID_CATEGORY" };

      const response = await request(app)
        .post("/api/v1/subscriptions")
        .set("Authorization", `Bearer ${token}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation failed");
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

  describe("GET /api/v1/subscriptions/stats", () => {
    it("should calculate stats correctly", async () => {
      const mockActiveSubs = [
        {
          id: 1,
          name: "Netflix",
          price: 10,
          currency: "EUR",
          frequency: "MONTHLY",
          category: "ENTERTAINMENT",
          isActive: true,
          userId: mockUser.id,
        },
        {
          id: 2,
          name: "Gym",
          price: 120,
          currency: "EUR",
          frequency: "YEARLY",
          category: "HEALTH",
          isActive: true,
          userId: mockUser.id,
        },
        {
          id: 3,
          name: "Weekly Mag",
          price: 10,
          currency: "EUR",
          frequency: "WEEKLY",
          category: "ENTERTAINMENT",
          isActive: true,
          userId: mockUser.id,
        },
      ];

      prismaMock.subscription.findMany.mockResolvedValue(mockActiveSubs as any);

      const response = await request(app)
        .get("/api/v1/subscriptions/stats")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);

      const stats = response.body.data;

      expect(stats.totalMonthly).toBeCloseTo(63.33, 1);

      expect(stats.activeCount).toBe(3);
      expect(stats.categoryCount).toBe(2);

      expect(stats.mostExpensive.name).toBe("Weekly Mag");
    });

    it("should return zeros for a user with no active subscriptions", async () => {
      prismaMock.subscription.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get("/api/v1/subscriptions/stats")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        totalMonthly: 0,
        totalYearly: 0,
        activeCount: 0,
        categoryCount: 0,
        mostExpensive: null,
        currency: "USD",
      });
    });

    it("should ignore inactive subscriptions in calculations", async () => {
      prismaMock.subscription.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get("/api/v1/subscriptions/stats")
        .set("Authorization", `Bearer ${token}`);

      expect(response.body.data.totalMonthly).toBe(0);
    });
  });
});
