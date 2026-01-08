import { describe, it, expect } from "vitest";
import { createSubscriptionSchema } from "../createSubscription.schema";
import { Category, Frequency } from "../../types/types";

describe("Create Subscription Schema", () => {
  const validPayload = {
    name: "Spotify Premium",
    price: 10.99,
    currency: "EUR",
    frequency: Frequency.MONTHLY,
    category: Category.ENTERTAINMENT,
    startDate: "2024-01-01T00:00:00.000Z",
    description: "Music without adds",
  };

  it("validates a fully correct payload", () => {
    const result = createSubscriptionSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("validates payload without optional description", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { description, ...payloadWithoutDesc } = validPayload;
    const result = createSubscriptionSchema.safeParse(payloadWithoutDesc);
    expect(result.success).toBe(true);
  });

  it("rejects empty or missing name", () => {
    const invalidPayload = { ...validPayload, name: "" };
    const result = createSubscriptionSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].path).toContain("name");
    }
  });

  it("rejects negative or zero price", () => {
    const negativeResult = createSubscriptionSchema.safeParse({
      ...validPayload,
      price: -5,
    });
    expect(negativeResult.success).toBe(false);
    const zeroResult = createSubscriptionSchema.safeParse({
      ...validPayload,
      price: 0,
    });
    expect(zeroResult.success).toBe(false);
  });

  it("rejects invalid enum values", () => {
    const invalidCategory = { ...validPayload, category: "NOT_A_CATEGORY" };
    const resultCat = createSubscriptionSchema.safeParse(invalidCategory);
    expect(resultCat.success).toBe(false);

    const invalidFrequency = { ...validPayload, frequency: "DAILY" };
    const resultFreq = createSubscriptionSchema.safeParse(invalidFrequency);
    expect(resultFreq.success).toBe(false);
  });

  it("rejects invalid date format", () => {
    const invalidDate = { ...validPayload, startDate: "not-a-date" };
    const result = createSubscriptionSchema.safeParse(invalidDate);
    expect(result.success).toBe(false);
  });
});
