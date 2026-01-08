import { updateMeSchema, updatePasswordSchema } from "../userSchema";

describe("User Schema", () => {
  describe("updateMeSchema", () => {
    it("should validate a correct name update", () => {
      const validData = {
        body: {
          name: "John Doe Updated",
        },
      };
      const result = updateMeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should fail if name is empty", () => {
      const invalidData = {
        body: {
          name: "",
        },
      };
      const result = updateMeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "Name cannot be empty"
        );
      }
    });

    it("should fail if name is too long (>100 chars)", () => {
      const invalidData = {
        body: {
          name: "a".repeat(101),
        },
      };
      const result = updateMeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("updatePasswordSchema", () => {
    it("should validate correct password change", () => {
      const validData = {
        body: {
          currentPassword: "oldPassword123",
          newPassword: "newPassword123",
          passwordConfirm: "newPassword123",
        },
      };
      const result = updatePasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should fail if passwords do not match", () => {
      const invalidData = {
        body: {
          currentPassword: "old",
          newPassword: "newPassword123",
          passwordConfirm: "differentPassword",
        },
      };
      const result = updatePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "New passwords do not match"
        );
      }
    });

    it("should fail if new password is same as current", () => {
      const invalidData = {
        body: {
          currentPassword: "samePassword123",
          newPassword: "samePassword123",
          passwordConfirm: "samePassword123",
        },
      };
      const result = updatePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "New password must be different from the current password"
        );
      }
    });

    it("should fail if new password is too short", () => {
      const invalidData = {
        body: {
          currentPassword: "old",
          newPassword: "short",
          passwordConfirm: "short",
        },
      };
      const result = updatePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
