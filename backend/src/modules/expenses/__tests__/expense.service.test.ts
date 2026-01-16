import { ExpenseService } from "../expense.service";
import { prismaMock } from "../../shared/lib/__mocks__/prisma";
import { AppError } from "../../shared/utils/AppError";

describe("ExpenseService", () => {
  let expenseService: ExpenseService;

  beforeEach(() => {
    expenseService = new ExpenseService(prismaMock as any);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create an expense if category exists", async () => {
      const input = {
        amount: 20,
        currency: "EUR",
        date: new Date(),
        categoryId: 1,
      };

      prismaMock.category.findUnique.mockResolvedValue({ id: 1 } as any);

      prismaMock.expense.create.mockResolvedValue({
        id: 10,
        ...input,
        userId: 1,
      } as any);

      const result = await expenseService.create(1, input as any);
      expect(result.amount).toBe(20);
      expect(prismaMock.expense.create).toHaveBeenCalled();
    });

    it("should throw error if category does not exist", async () => {
      prismaMock.category.findUnique.mockResolvedValue(null);

      await expect(
        expenseService.create(1, { categoryId: 999 } as any)
      ).rejects.toThrow("Category not found");
    });
  });

  describe("delete", () => {
    it("should delete expense if user owns it", async () => {
      prismaMock.expense.findUnique.mockResolvedValue({
        id: 10,
        userId: 1,
      } as any);
      prismaMock.expense.delete.mockResolvedValue({ id: 10 } as any);

      await expenseService.delete(1, 10);
      expect(prismaMock.expense.delete).toHaveBeenCalledWith({
        where: { id: 10 },
      });
    });

    it("should throw error if expense belongs to another user", async () => {
      prismaMock.expense.findUnique.mockResolvedValue({
        id: 10,
        userId: 2,
      } as any);

      await expect(expenseService.delete(1, 10)).rejects.toThrow(
        "Expense not found"
      );
    });
  });
});
