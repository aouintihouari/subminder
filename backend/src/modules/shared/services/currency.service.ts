import { exchangeRateService } from "../../shared/services/exchangeRate.service";

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

  getMonthlyCost: (price: number, frequency: string): number => {
    switch (frequency) {
      case "WEEKLY":
        return (price * 52) / 12;
      case "YEARLY":
        return price / 12;
      case "ONCE":
        return 0;
      case "MONTHLY":
      default:
        return price;
    }
  },

  calculateUserStats: async (
    userSubscriptions: any[],
    targetCurrency: string
  ) => {
    const rates = await exchangeRateService.getRates();

    let totalMonthly = 0;
    let highestMonthlyCost = -1;
    let highestSub = null;
    const categories = new Set();

    for (const sub of userSubscriptions) {
      if (!sub.isActive) continue;

      categories.add(sub.category);

      const convertedPrice = currencyService.convert(
        sub.price,
        sub.currency,
        targetCurrency,
        rates
      );

      const monthlyCost = currencyService.getMonthlyCost(
        convertedPrice,
        sub.frequency
      );

      if (sub.frequency !== "ONCE") totalMonthly += monthlyCost;

      if (monthlyCost > highestMonthlyCost) {
        highestMonthlyCost = monthlyCost;

        highestSub = {
          ...sub,
          convertedPrice: convertedPrice,
          displayCurrency: targetCurrency,
        };
      }
    }

    return {
      totalMonthly: Number(totalMonthly.toFixed(2)),
      totalYearly: Number((totalMonthly * 12).toFixed(2)),
      activeCount: userSubscriptions.filter((s: any) => s.isActive).length,
      categoryCount: categories.size,
      currency: targetCurrency,
      mostExpensive: highestSub,
    };
  },
};
