import { describe, it, expect } from "vitest";
import { signupSchema } from "../signup.schema";

describe("Signup Schema", () => {
  it("validates a correct signup payload", () => {
    const validData = {
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      passwordConfirm: "password123",
    };
    const result = signupSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects short passwords", () => {
    const invalidData = {
      email: "john@example.com",
      password: "123",
      passwordConfirm: "123",
    };
    const result = signupSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("rejects passwords that do not match", () => {
    const invalidData = {
      email: "john@example.com",
      password: "password123",
      passwordConfirm: "differentPassword",
    };
    const result = signupSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].message).toBe("Passwords do not match.");
  });
});
