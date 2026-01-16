import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
} from "../subscription.schema";
import { Frequency } from "@prisma/client";

describe("Subscription Schema", () => {
  describe("createSubscriptionSchema", () => {
    it("should validate a correct subscription (V2)", () => {
      const validData = {
        body: {
          name: "Netflix",
          price: 15.99,
          currency: "USD",
          frequency: Frequency.MONTHLY,
          categoryId: 1,
          startDate: "2024-01-01T00:00:00.000Z",
          description: "Family plan",
        },
      };

      const result = createSubscriptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body.currency).toBe("USD");
        expect(result.data.body.categoryId).toBe(1);
      }
    });

    it("should reject subscription with missing categoryId", () => {
      const invalidData = {
        body: {
          name: "Netflix",
          price: 15.99,
          frequency: Frequency.MONTHLY,
          startDate: "2024-01-01",
        },
      };
      const result = createSubscriptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].path).toContain("body");
        expect(result.error.issues[0].path).toContain("categoryId");
      }
    });

    it("should reject subscription with invalid categoryId (negative)", () => {
      const invalidData = {
        body: {
          name: "Netflix",
          price: 15.99,
          frequency: Frequency.MONTHLY,
          categoryId: -5,
          startDate: "2024-01-01",
        },
      };

      const result = createSubscriptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should use default values (EUR, isActive)", () => {
      const dataWithDefaults = {
        body: {
          name: "Spotify",
          price: 10,
          frequency: Frequency.MONTHLY,
          categoryId: 2,
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
  });

  describe("updateSubscriptionSchema", () => {
    it("should allow partial updates (changing only category)", () => {
      const partialData = {
        body: {
          categoryId: 5,
        },
      };

      const result = updateSubscriptionSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });

    it("should fail if partial update contains invalid price", () => {
      const invalidPartial = {
        body: { price: -10 },
      };

      const result = updateSubscriptionSchema.safeParse(invalidPartial);
      expect(result.success).toBe(false);
    });
  });
});
