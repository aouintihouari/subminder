import { signupSchema } from "../authSchema";

describe("Zod Validation - Signup", () => {
  it("should validate correct data", () => {
    const validData = {
      body: {
        email: "test@example.com",
        password: "password123",
        passwordConfirm: "password123",
        name: "John Doe",
      },
    };

    const result = signupSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const invalidData = {
      body: {
        email: "not-an-email",
        password: "password123",
        passwordConfirm: "password123",
      },
    };

    const result = signupSchema.safeParse(invalidData);
    expect(result.success).toBe(false);

    if (!result.success)
      expect(result.error.issues[0].message).toBe("Invalid email address");
  });

  it("should reject mismatched passwords", () => {
    const invalidData = {
      body: {
        email: "test@example.com",
        password: "password123",
        passwordConfirm: "different",
      },
    };

    const result = signupSchema.safeParse(invalidData);
    expect(result.success).toBe(false);

    if (!result.success)
      expect(result.error.issues[0].message).toBe("Passwords do not match");
  });
});
