import { Frequency } from "@prisma/client";

export const currencyService = {
  convert: (
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    rates: Record<string, number>
  ): number => {
    if (fromCurrency === toCurrency) return amount;
    const fromRate = rates[fromCurrency] || 1;
    const toRate = rates[toCurrency] || 1;
    return (amount / fromRate) * toRate;
  },

  getAnnualCost: (price: number, frequency: Frequency): number => {
    switch (frequency) {
      case "WEEKLY":
        return price * 52;
      case "MONTHLY":
        return price * 12;
      case "YEARLY":
        return price;
      case "ONCE":
      default:
        return 0;
    }
  },
};
