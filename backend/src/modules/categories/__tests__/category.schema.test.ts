import { createCategorySchema } from "../category.schema";
import { CategoryType } from "@prisma/client";

describe("Category Schema Validation", () => {
  describe("createCategorySchema", () => {
    it("should validate a correct category", () => {
      const validData = {
        body: {
          name: "My Custom Category",
          icon: "lucide-icon-name",
          color: "#FF5733",
          type: CategoryType.EXPENSE,
          isDigital: true,
        },
      };

      const result = createCategorySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid hex color", () => {
      const invalidData = {
        body: {
          name: "Bad Color",
          icon: "icon",
          color: "red", // Pas un hex
          type: CategoryType.EXPENSE,
        },
      };
      const result = createCategorySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Invalid Hex Color");
      }
    });

    it("should reject empty names", () => {
      const invalidData = {
        body: {
          name: "",
          icon: "icon",
          color: "#000000",
          type: CategoryType.EXPENSE,
        },
      };
      const result = createCategorySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should use default value for isDigital (false)", () => {
      const validData = {
        body: {
          name: "Physical Stuff",
          icon: "box",
          color: "#000000",
          type: CategoryType.EXPENSE,
        },
      };
      const result = createCategorySchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body.isDigital).toBe(false);
      }
    });
  });
});
