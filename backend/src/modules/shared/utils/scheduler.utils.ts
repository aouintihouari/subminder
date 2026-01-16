import { Frequency } from "@prisma/client";

const addInterval = (
  date: Date,
  frequency: Frequency,
  amount: number
): Date => {
  const newDate = new Date(date);

  switch (frequency) {
    case "WEEKLY":
      newDate.setUTCDate(newDate.getUTCDate() + 7 * amount);
      break;
    case "MONTHLY":
      newDate.setUTCMonth(newDate.getUTCMonth() + amount);
      break;
    case "YEARLY":
      newDate.setUTCFullYear(newDate.getUTCFullYear() + amount);
      break;
    case "ONCE":
      break;
  }

  return newDate;
};

export const getNextPaymentDate = (
  startDate: Date,
  frequency: Frequency
): Date | null => {
  if (frequency === "ONCE") return null;

  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);

  let nextDate = new Date(startDate);
  nextDate.setUTCHours(0, 0, 0, 0);

  if (nextDate >= now) return nextDate;

  while (nextDate < now) {
    nextDate = addInterval(nextDate, frequency, 1);
  }

  return nextDate;
};

export const isRenewalDue = (
  startDate: Date,
  frequency: Frequency,
  targetDate: Date
): boolean => {
  if (frequency === "ONCE") return false;

  const start = new Date(startDate);
  start.setUTCHours(0, 0, 0, 0);

  const target = new Date(targetDate);
  target.setUTCHours(0, 0, 0, 0);

  if (target.getTime() < start.getTime()) return false;

  let currentDate = new Date(start);
  let safetyCounter = 0;

  while (currentDate.getTime() <= target.getTime() && safetyCounter < 1200) {
    if (currentDate.getTime() === target.getTime()) return true;
    currentDate = addInterval(currentDate, frequency, 1);
    safetyCounter++;
  }

  return false;
};
