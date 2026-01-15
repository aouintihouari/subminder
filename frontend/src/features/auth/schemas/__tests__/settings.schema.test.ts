import { describe, it, expect } from "vitest";
import { updateProfileSchema, updatePasswordSchema } from "../settings.schema";

describe("Settings Schemas", () => {
  describe("updateProfileSchema", () => {
    it("validates valid profile data", () => {
      expect(
        updateProfileSchema.safeParse({
          name: "Alex",
          email: "alex@example.com",
          preferredCurrency: "USD",
        }).success,
      ).toBe(true);
    });

    it("rejects too short name", () => {
      expect(
        updateProfileSchema.safeParse({
          name: "A",
          email: "alex@example.com",
          preferredCurrency: "USD",
        }).success,
      ).toBe(false);
    });

    it("rejects invalid email", () => {
      expect(
        updateProfileSchema.safeParse({
          name: "Alex",
          email: "not-an-email",
          preferredCurrency: "USD",
        }).success,
      ).toBe(false);
    });
  });

  describe("updatePasswordSchema", () => {
    it("validates correct password change", () => {
      const validData = {
        currentPassword: "oldPassword123",
        newPassword: "newPassword123",
        passwordConfirm: "newPassword123",
      };
      expect(updatePasswordSchema.safeParse(validData).success).toBe(true);
    });

    it("rejects if new password is same as current", () => {
      const invalidData = {
        currentPassword: "samePassword123",
        newPassword: "samePassword123",
        passwordConfirm: "samePassword123",
      };
      const result = updatePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error.issues[0].message).toContain("must be different");
    });

    it("rejects if confirmation does not match", () => {
      const invalidData = {
        currentPassword: "oldPassword123",
        newPassword: "newPassword123",
        passwordConfirm: "typoPassword123",
      };
      expect(updatePasswordSchema.safeParse(invalidData).success).toBe(false);
    });
  });
});
