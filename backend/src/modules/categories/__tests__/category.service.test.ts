import { CategoryService } from "../category.service";
import { prismaMock } from "../../shared/lib/__mocks__/prisma";
import { CategoryType } from "@prisma/client";

describe("CategoryService", () => {
  let categoryService: CategoryService;

  beforeEach(() => {
    categoryService = new CategoryService(prismaMock as any);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a category with generated slug", async () => {
      const input = {
        name: "My Cat",
        icon: "test",
        color: "#fff",
        type: CategoryType.EXPENSE,
        isDigital: false,
      };

      prismaMock.category.findFirst.mockResolvedValue(null);
      prismaMock.category.create.mockResolvedValue({
        id: 1,
        ...input,
        userId: 1,
        isSystem: false,
        slug: "my-cat-123",
      } as any);

      const result = await categoryService.create(1, input);

      expect(prismaMock.category.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 1,
            isSystem: false,
            slug: expect.stringMatching(/my-cat-\d+/),
          }),
        })
      );
      expect(result.slug).toBeDefined();
    });

    it("should throw error if name already exists for user", async () => {
      prismaMock.category.findFirst.mockResolvedValue({ id: 1 } as any);

      await expect(
        categoryService.create(1, { name: "Duplicate" } as any)
      ).rejects.toThrow("already have a category");
    });
  });

  describe("delete", () => {
    it("should delete user category", async () => {
      prismaMock.category.findUnique.mockResolvedValue({
        id: 1,
        userId: 1,
        isSystem: false,
      } as any);

      await categoryService.delete(1, 1);
      expect(prismaMock.category.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should prevent deleting system category", async () => {
      prismaMock.category.findUnique.mockResolvedValue({
        id: 99,
        isSystem: true,
      } as any);

      await expect(categoryService.delete(1, 99)).rejects.toThrow(
        "cannot delete a system category"
      );
    });

    it("should prevent deleting another user's category", async () => {
      prismaMock.category.findUnique.mockResolvedValue({
        id: 2,
        userId: 2, // Autre user
        isSystem: false,
      } as any);

      await expect(categoryService.delete(1, 2)).rejects.toThrow(
        "Access denied"
      );
    });
  });
});
