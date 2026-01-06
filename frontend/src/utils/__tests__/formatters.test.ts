import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate } from "../formatters";

describe("Formatters Utils", () => {
  describe("formatCurrency", () => {
    it("formats EUR correctly", () => {
      const result = formatCurrency(10.5, "EUR");
      expect(result).toContain("€");
      expect(result).toContain("10.50");
    });

    it("formats USD correctly", () => {
      const result = formatCurrency(100, "USD");
      expect(result).toContain("$");
      expect(result).toContain("100.00");
    });

    it("handles zero correctly", () => {
      expect(formatCurrency(0, "EUR")).toContain("0.00");
    });
  });

  describe("formatDate", () => {
    it("formats ISO date string correctly", () => {
      const result = formatDate("2026-01-05T00:00:00.000Z");
      expect(result).toMatch(/Jan/);
      expect(result).toMatch(/2026/);
    });

    it("handles invalid dates gracefully", () => {
      const result = formatDate("invalid-date");
      expect(result).toBe("invalid-date");
    });
  });
});
