import { createExpenseSchema, updateExpenseSchema } from "../expense.schema";

describe("Expense Schema Validation", () => {
  describe("createExpenseSchema", () => {
    it("should validate a correct expense", () => {
      const validData = {
        body: {
          amount: 50.5,
          currency: "EUR",
          date: "2024-01-01T10:00:00.000Z",
          description: "Groceries",
          categoryId: 1,
        },
      };

      const result = createExpenseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject negative amounts", () => {
      const invalidData = {
        body: { amount: -10, date: "2024-01-01T10:00:00.000Z", categoryId: 1 },
      };
      const result = createExpenseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject missing categoryId", () => {
      const invalidData = {
        body: { amount: 10, date: "2024-01-01T10:00:00.000Z" },
      };
      const result = createExpenseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("updateExpenseSchema", () => {
    it("should allow partial updates", () => {
      const validData = { body: { amount: 100 } };
      const result = updateExpenseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
