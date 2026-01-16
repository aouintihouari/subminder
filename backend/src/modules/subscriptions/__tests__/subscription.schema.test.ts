import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
} from "../subscription.schema";
import { Frequency, Category } from "@prisma/client";

describe("Subscription Schema", () => {
  describe("createSubscriptionSchema", () => {
    it("should validate a correct subscription", () => {
      const validData = {
        body: {
          name: "Netflix",
          price: 15.99,
          currency: "USD",
          frequency: Frequency.MONTHLY,
          category: Category.ENTERTAINMENT,
          startDate: "2024-01-01T00:00:00.000Z",
          description: "Family plan",
        },
      };

      const result = createSubscriptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body.currency).toBe("USD");
      }
    });

    it("should use default values (EUR, isActive)", () => {
      const dataWithDefaults = {
        body: {
          name: "Spotify",
          price: 10,
          frequency: Frequency.MONTHLY,
          category: Category.ENTERTAINMENT,
          startDate: "2024-01-01",
        },
      };

      const result = createSubscriptionSchema.safeParse(dataWithDefaults);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body.currency).toBe("EUR");
        expect(result.data.body.isActive).toBe(true);
      }
    });

    it("should fail if price is negative", () => {
      const invalidData = {
        body: {
          name: "Netflix",
          price: -5,
          frequency: Frequency.MONTHLY,
          category: Category.ENTERTAINMENT,
          startDate: "2024-01-01",
        },
      };

      const result = createSubscriptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Price must be positive"
        );
      }
    });

    it("should fail if frequency is invalid", () => {
      const invalidData = {
        body: {
          name: "Netflix",
          price: 10,
          frequency: "DAILY",
          category: Category.ENTERTAINMENT,
          startDate: "2024-01-01",
        },
      };

      const result = createSubscriptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should fail if date is invalid", () => {
      const invalidData = {
        body: {
          name: "Netflix",
          price: 10,
          frequency: Frequency.MONTHLY,
          category: Category.ENTERTAINMENT,
          startDate: "not-a-date",
        },
      };

      const result = createSubscriptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("updateSubscriptionSchema", () => {
    it("should allow partial updates", () => {
      const partialData = {
        body: {
          price: 20.99,
        },
      };

      const result = updateSubscriptionSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });

    it("should fail if partial update contains invalid data", () => {
      const invalidPartial = {
        body: { price: -10 },
      };

      const result = updateSubscriptionSchema.safeParse(invalidPartial);
      expect(result.success).toBe(false);
    });
  });
});
