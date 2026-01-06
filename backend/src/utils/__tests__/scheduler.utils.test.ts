import { isRenewalDue } from "../scheduler.utils";

describe("Scheduler Utils - isRenewalDue", () => {
  it("should detect a monthly renewal correctly", () => {
    const startDate = new Date("2024-01-15");
    const targetDateTrue = new Date("2024-02-15");
    expect(isRenewalDue(startDate, "MONTHLY", targetDateTrue)).toBe(true);
    const targetDateFalse = new Date("2024-02-16");
    expect(isRenewalDue(startDate, "MONTHLY", targetDateFalse)).toBe(false);
  });

  it("should detect a weekly renewal correctly", () => {
    const startDate = new Date("2024-01-01");
    const targetDateTrue = new Date("2024-01-08");
    expect(isRenewalDue(startDate, "WEEKLY", targetDateTrue)).toBe(true);
    const targetDateFalse = new Date("2024-01-04");
    expect(isRenewalDue(startDate, "WEEKLY", targetDateFalse)).toBe(false);
  });

  it("should detect a yearly renewal correctly", () => {
    const startDate = new Date("2023-05-10");
    const targetDateTrue = new Date("2024-05-10");
    expect(isRenewalDue(startDate, "YEARLY", targetDateTrue)).toBe(true);
  });

  it("should never return true for ONCE frequency", () => {
    const startDate = new Date("2024-01-01");
    const targetDate = new Date("2024-02-01");
    expect(isRenewalDue(startDate, "ONCE", targetDate)).toBe(false);
  });

  it("should return false if target date is before start date", () => {
    const startDate = new Date("2024-01-01");
    const targetDate = new Date("2023-12-31");
    expect(isRenewalDue(startDate, "MONTHLY", targetDate)).toBe(false);
  });
});
