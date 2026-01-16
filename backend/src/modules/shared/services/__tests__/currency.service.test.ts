import { currencyService } from "../currency.service";
import { Frequency } from "@prisma/client";

describe("CurrencyService", () => {
  describe("convert", () => {
    const rates = { EUR: 1, USD: 1.2, GBP: 0.85 };

    it("should return same amount if currencies are identical", () => {
      expect(currencyService.convert(100, "EUR", "EUR", rates)).toBe(100);
    });

    it("should convert correctly based on rates", () => {
      expect(currencyService.convert(100, "EUR", "USD", rates)).toBe(120);

      expect(currencyService.convert(120, "USD", "EUR", rates)).toBe(100);
    });

    it("should handle missing rates gracefully (fallback to 1)", () => {
      expect(currencyService.convert(100, "EUR", "UNKNOWN", rates)).toBe(100);
    });
  });

  describe("getAnnualCost", () => {
    it("should calculate monthly correctly", () => {
      expect(currencyService.getAnnualCost(10, Frequency.MONTHLY)).toBe(120);
    });

    it("should calculate weekly correctly", () => {
      expect(currencyService.getAnnualCost(10, Frequency.WEEKLY)).toBe(520);
    });

    it("should calculate yearly correctly", () => {
      expect(currencyService.getAnnualCost(100, Frequency.YEARLY)).toBe(100);
    });

    it("should return 0 for ONCE", () => {
      expect(currencyService.getAnnualCost(500, Frequency.ONCE)).toBe(0);
    });
  });
});
