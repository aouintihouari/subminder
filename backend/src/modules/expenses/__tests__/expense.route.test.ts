import request from "supertest";
import { mockReset, DeepMockProxy } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import app from "../../../app";
import { prisma } from "../../shared/lib/prisma";

jest.mock("../../shared/lib/prisma");
jest.mock("../../shared/services/email.service", () => ({
  emailService: { sendVerificationEmail: jest.fn() },
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("Expense Routes", () => {
  let token: string;

  beforeEach(() => {
    mockReset(prismaMock);
    process.env.JWT_SECRET = "test-secret";
    token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: "1h" });
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      email: "test@test.com",
      role: "USER",
    } as any);
  });

  describe("POST /api/v1/expenses", () => {
    const validData = {
      amount: 15.5,
      currency: "EUR",
      date: "2024-01-01T12:00:00.000Z",
      categoryId: 5,
    };

    it("should create an expense successfully", async () => {
      // Mock category check
      prismaMock.category.findUnique.mockResolvedValue({ id: 5 } as any);
      // Mock create
      prismaMock.expense.create.mockResolvedValue({
        id: 100,
        userId: 1,
        ...validData,
      } as any);

      const response = await request(app)
        .post("/api/v1/expenses")
        .set("Authorization", `Bearer ${token}`)
        .send(validData);

      expect(response.status).toBe(201);
      expect(response.body.amount).toBe(15.5);
    });

    it("should fail if category does not exist", async () => {
      prismaMock.category.findUnique.mockResolvedValue(null); // Category not found

      const response = await request(app)
        .post("/api/v1/expenses")
        .set("Authorization", `Bearer ${token}`)
        .send(validData);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Category not found");
    });

    it("should fail validation if amount is missing", async () => {
      const response = await request(app)
        .post("/api/v1/expenses")
        .set("Authorization", `Bearer ${token}`)
        .send({ categoryId: 5 }); // Missing amount

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/v1/expenses", () => {
    it("should return user expenses", async () => {
      prismaMock.expense.findMany.mockResolvedValue([
        { id: 1, amount: 10, category: { name: "Food" } },
      ] as any);

      const response = await request(app)
        .get("/api/v1/expenses")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });
  });
});
