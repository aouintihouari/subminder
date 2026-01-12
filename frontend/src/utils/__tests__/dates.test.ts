import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { getNextPaymentDate } from "../dates";
import { Frequency } from "@/features/subscriptions/types/types";
import { addDays, addMonths, subMonths } from "date-fns";

describe("Date Utils", () => {
  const MOCK_TODAY = new Date(2026, 0, 15);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_TODAY);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getNextPaymentDate", () => {
    it("returns null for ONCE frequency", () => {
      expect(getNextPaymentDate(new Date(), Frequency.ONCE)).toBeNull();
    });

    it("returns start date if it is in the future", () => {
      const futureDate = addDays(MOCK_TODAY, 5);
      const result = getNextPaymentDate(futureDate, Frequency.MONTHLY);
      expect(result).toEqual(futureDate);
    });

    it("calculates next monthly payment correctly", () => {
      const pastDate = subMonths(MOCK_TODAY, 2);
      const result = getNextPaymentDate(pastDate, Frequency.MONTHLY);
      const expectedNextMonth = addMonths(MOCK_TODAY, 1);
      expect(result).toEqual(expectedNextMonth);
    });

    it("calculates next monthly payment from past date", () => {
      const startDate = new Date(2026, 0, 10);
      const expected = new Date(2026, 1, 10);
      const result = getNextPaymentDate(startDate, Frequency.MONTHLY);
      expect(result).toEqual(expected);
    });
  });
});
