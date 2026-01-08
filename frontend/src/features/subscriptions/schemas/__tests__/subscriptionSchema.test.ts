import { describe, it, expect } from "vitest";
import { subscriptionSchema } from "../subscriptionSchema";
import { Category, Frequency } from "../../types/types";

describe("Subscription Schema", () => {
  const validBase = {
    name: "Netflix",
    price: 15.99,
    currency: "EUR",
    frequency: Frequency.MONTHLY,
    category: Category.ENTERTAINMENT,
    startDate: "2024-01-01",
    description: "Family plan",
  };

  it("validates a correct subscription", () => {
    const result = subscriptionSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it("rejects negative or zero price", () => {
    const result = subscriptionSchema.safeParse({ ...validBase, price: -5 });
    expect(result.success).toBe(false);

    const resultZero = subscriptionSchema.safeParse({ ...validBase, price: 0 });
    expect(resultZero.success).toBe(false);
  });

  it("rejects invalid date string", () => {
    const result = subscriptionSchema.safeParse({
      ...validBase,
      startDate: "invalid-date",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid category enum", () => {
    const result = subscriptionSchema.safeParse({
      ...validBase,
      category: "INVALID_CAT",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional description as undefined", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { description, ...withoutDesc } = validBase;
    const result = subscriptionSchema.safeParse(withoutDesc);
    expect(result.success).toBe(true);
  });
});
