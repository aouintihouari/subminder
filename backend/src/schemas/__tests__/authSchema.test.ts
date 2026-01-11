import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../authSchema";

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

  it("should reject short passwords", () => {
    const invalidData = {
      body: {
        email: "test@example.com",
        password: "123",
        passwordConfirm: "123",
      },
    };

    const result = signupSchema.safeParse(invalidData);
    expect(result.success).toBe(false);

    if (!result.success)
      expect(result.error.issues[0].message).toBe(
        "Password must be at least 8 characters long"
      );
  });

  it("should reject mismatched passwords", () => {
    const invalidData = {
      body: {
        email: "test@example.com",
        password: "password123",
        passwordConfirm: "password456",
      },
    };

    const result = signupSchema.safeParse(invalidData);
    expect(result.success).toBe(false);

    if (!result.success)
      expect(result.error.issues[0].message).toBe("Passwords do not match");
  });
});

describe("Zod Validation - Login", () => {
  it("should validate well formatted email and non empty password fields", () => {
    const validData = {
      body: { email: "test@example.com", password: "password123" },
    };
    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject empty emails", () => {
    const invalidData = {
      body: { email: "", password: "password123" },
    };
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);

    if (!result.success)
      expect(result.error.issues[0].message).toBe("Invalid email address");
  });

  it("should reject empty passwords", () => {
    const invalidData = {
      body: { email: "test@example.com", password: "" },
    };
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);

    if (!result.success)
      expect(result.error.issues[0].message).toBe("Password is required");
  });
});

describe("Zod Validation - Forgot Password", () => {
  it("should validate a correct email", () => {
    const validData = { body: { email: "user@example.com" } };
    const result = forgotPasswordSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject an invalid email", () => {
    const invalidData = { body: { email: "not-an-email" } };
    const result = forgotPasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Invalid email address");
    }
  });
});

describe("Zod Validation - Reset Password", () => {
  it("should validate matching passwords", () => {
    const validData = {
      body: { password: "newpassword123", passwordConfirm: "newpassword123" },
    };
    const result = resetPasswordSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject short passwords", () => {
    const invalidData = {
      body: { password: "short", passwordConfirm: "short" },
    };
    const result = resetPasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].message).toContain("at least 8 characters");
  });

  it("should reject mismatched passwords", () => {
    const invalidData = {
      body: { password: "password123", passwordConfirm: "different123" },
    };
    const result = resetPasswordSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].message).toBe("Passwords do not match");
  });
});
