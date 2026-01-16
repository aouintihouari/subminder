import request from "supertest";
import { mockReset, DeepMockProxy } from "jest-mock-extended";
import { PrismaClient, CategoryType } from "@prisma/client";
import jwt from "jsonwebtoken";
import app from "../../../app";
import { prisma } from "../../shared/lib/prisma";

// Mock Prisma
jest.mock("../../shared/lib/prisma");
const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("Category Routes", () => {
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

  describe("GET /api/v1/categories", () => {
    it("should return all categories", async () => {
      prismaMock.category.findMany.mockResolvedValue([
        { id: 1, name: "System Cat", isSystem: true },
        { id: 2, name: "User Cat", isSystem: false, userId: 1 },
      ] as any);

      const response = await request(app)
        .get("/api/v1/categories")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe("POST /api/v1/categories", () => {
    const validData = {
      name: "New Custom",
      icon: "star",
      color: "#ffffff",
      type: CategoryType.EXPENSE,
      isDigital: true,
    };

    it("should create category successfully", async () => {
      prismaMock.category.findFirst.mockResolvedValue(null);
      prismaMock.category.create.mockResolvedValue({
        id: 3,
        ...validData,
        userId: 1,
      } as any);

      const response = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", `Bearer ${token}`)
        .send(validData);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe("New Custom");
    });

    it("should fail validation with invalid color", async () => {
      const response = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", `Bearer ${token}`)
        .send({ ...validData, color: "invalid-color" });

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /api/v1/categories/:id", () => {
    it("should delete user category", async () => {
      prismaMock.category.findUnique.mockResolvedValue({
        id: 1,
        userId: 1,
        isSystem: false,
      } as any);
      prismaMock.category.delete.mockResolvedValue({ id: 1 } as any);

      const response = await request(app)
        .delete("/api/v1/categories/1")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it("should return 403 when deleting system category", async () => {
      prismaMock.category.findUnique.mockResolvedValue({
        id: 99,
        isSystem: true,
      } as any);

      const response = await request(app)
        .delete("/api/v1/categories/99")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(403);
    });
  });
});
