import { describe, it, expect } from "vitest";
import { loginSchema } from "../login.schema";

describe("Login Schema", () => {
  it("validates a correct login payload", () => {
    const validData = {
      email: "test@example.com",
      password: "password123",
    };
    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const invalidData = {
      email: "not-an-email",
      password: "password123",
    };
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].message).toContain("valid email");
  });

  it("rejects an empty password", () => {
    const invalidData = {
      email: "test@example.com",
      password: "",
    };
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
