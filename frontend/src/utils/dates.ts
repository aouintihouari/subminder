import {
  addWeeks,
  addMonths,
  addYears,
  isAfter,
  isBefore,
  isSameDay,
  formatDistanceToNow,
  format,
} from "date-fns";
import { Frequency } from "@/features/subscriptions/types/types";

export const getNextPaymentDate = (
  startDate: string | Date,
  frequency: Frequency,
): Date | null => {
  if (frequency === Frequency.ONCE) return null;
  let nextDate = new Date(startDate);
  const now = new Date();
  if (isAfter(nextDate, now) && !isSameDay(nextDate, now)) return nextDate;
  while (isBefore(nextDate, now) || isSameDay(nextDate, now)) {
    switch (frequency) {
      case Frequency.WEEKLY:
        nextDate = addWeeks(nextDate, 1);
        break;
      case Frequency.MONTHLY:
        nextDate = addMonths(nextDate, 1);
        break;
      case Frequency.YEARLY:
        nextDate = addYears(nextDate, 1);
        break;
    }
  }
  return nextDate;
};

export const formatNextPayment = (date: Date | null): string => {
  if (!date) return "One-time payment";
  const now = new Date();
  if (isSameDay(date, now)) return "Today";
  const distance = formatDistanceToNow(date, { addSuffix: true });
  if (distance.includes("days") || distance.includes("hours"))
    return distance.replace("about ", "");
  return format(date, "MMM d, yyyy");
};
