import request from "supertest";
import { mockReset, DeepMockProxy } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

jest.mock("node-cron", () => ({ schedule: jest.fn() }));

jest.mock("../../shared/services/exchangeRate.service", () => ({
  exchangeRateService: {
    getRates: jest.fn().mockResolvedValue({ EUR: 1, USD: 1 }),
    updateRates: jest.fn(),
  },
}));

jest.mock("../../shared/lib/prisma");

import app from "../../../app";
import { prisma } from "../../shared/lib/prisma";

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

  const mockCategory = {
    id: 10,
    name: "Entertainment",
    isDigital: true,
    type: "EXPENSE",
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
      categoryId: 10,
      startDate: "2024-01-01T00:00:00.000Z",
      description: "Remember to cancel",
    };

    it("should create a subscription successfully", async () => {
      prismaMock.subscription.create.mockResolvedValue({
        id: 101,
        ...validData,
        userId: mockUser.id,
        isActive: true,
        category: mockCategory,
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
      expect(response.body.data.subscription.category.name).toBe(
        "Entertainment"
      );
    });

    it("should fail if categoryId is invalid format", async () => {
      const invalidData = { ...validData, categoryId: "not-a-number" }; // ❌ String

      const response = await request(app)
        .post("/api/v1/subscriptions")
        .set("Authorization", `Bearer ${token}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation failed");
    });
  });

  describe("GET /api/v1/subscriptions/stats", () => {
    it("should return V2 dashboard structure", async () => {
      const mockActiveSubs = [
        {
          id: 1,
          name: "Netflix",
          price: 10,
          currency: "EUR",
          frequency: "MONTHLY",
          categoryId: 10,
          category: mockCategory,
          isActive: true,
          userId: mockUser.id,
        },
      ];

      prismaMock.subscription.findMany.mockResolvedValue(mockActiveSubs as any);

      const response = await request(app)
        .get("/api/v1/subscriptions/stats")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);

      const data = response.body.data;

      expect(data).toHaveProperty("summary");
      expect(data.summary).toHaveProperty("daily");
      expect(data.summary).toHaveProperty("monthly");

      expect(data).toHaveProperty("insights");
      expect(data.insights).toHaveProperty("digitalVsPhysical");
      expect(data.insights.digitalVsPhysical.digitalPercentage).toBe(100);
    });
  });
});
