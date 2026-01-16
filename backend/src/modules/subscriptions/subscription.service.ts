import { PrismaClient } from "@prisma/client";
import { prisma } from "../shared/lib/prisma";
import { AppError } from "../shared/utils/AppError";
import { currencyService } from "../shared/services/currency.service";
import { exchangeRateService } from "../shared/services/exchangeRate.service";
import { getNextPaymentDate } from "../shared/utils/scheduler.utils";

/**
 * Service class for managing subscriptions
 */
export class SubscriptionService {
  /**
   * Creates an instance of SubscriptionService
   * @param {PrismaClient} db - Prisma client instance for database operations
   */
  constructor(private db: PrismaClient) {}

  /**
   * Get all subscriptions for a user with converted prices
   * @param {number} userId - The ID of the user
   * @returns {Promise<Array>} - Array of subscriptions with converted prices
   */
  async getAll(userId: number) {
    // Fetch user's preferred currency
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { preferredCurrency: true },
    });

    // Set target currency to user's preference or default to EUR
    const targetCurrency = user?.preferredCurrency || "EUR";

    // Fetch all subscriptions for the user, ordered by start date
    const subscriptions = await this.db.subscription.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { startDate: "desc" },
    });

    // Get current exchange rates
    const rates = await exchangeRateService.getRates();

    // Convert prices and format subscription data
    return subscriptions.map((sub) => {
      const convertedPrice = currencyService.convert(
        sub.price,
        sub.currency,
        targetCurrency,
        rates
      );

      return {
        ...sub,
        convertedPrice,
        displayCurrency: targetCurrency,
      };
    });
  }

  /**
   * Get comprehensive statistics about user's subscriptions
   * @param {number} userId - The ID of the user
   * @returns {Promise<Object>} - Object containing subscription statistics
   */
  async getStats(userId: number) {
    // Fetch user's preferred currency
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { preferredCurrency: true },
    });

    if (!user) throw new AppError("User not found", 404);

    const targetCurrency = user.preferredCurrency;
    const rates = await exchangeRateService.getRates();

    // Fetch all active subscriptions for the user
    const subscriptions = await this.db.subscription.findMany({
      where: { userId, isActive: true },
      include: { category: true },
    });

    // Initialize statistical variables
    let totalAnnual = 0;
    let totalOneTime = 0;
    let highestMonthlyNormalized = -1;
    let highestSub: {
      name: string;
      price: number;
      frequency: string;
      categoryName: string;
      normalizedMonthlyCost: number;
    } | null = null;

    let next7DaysAmount = 0;
    let digitalTotalAnnual = 0;
    let physicalTotalAnnual = 0;

    const categoryMap = new Map<string, number>();

    // Set date range for next 7 days calculation
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const in7Days = new Date(today);
    in7Days.setDate(today.getDate() + 7);

    // Process each subscription
    for (const sub of subscriptions) {
      const convertedPrice = currencyService.convert(
        sub.price,
        sub.currency,
        targetCurrency,
        rates
      );

      if (sub.frequency === "ONCE") {
        totalOneTime += convertedPrice;
        continue;
      }

      const annualCost = currencyService.getAnnualCost(
        convertedPrice,
        sub.frequency
      );

      totalAnnual += annualCost;

      if (sub.category.isDigital) {
        digitalTotalAnnual += annualCost;
      } else {
        physicalTotalAnnual += annualCost;
      }

      // Track costs by category
      const catName = sub.category.name;
      const currentCatTotal = categoryMap.get(catName) ?? 0;
      categoryMap.set(catName, currentCatTotal + annualCost);

      // Track highest monthly subscription
      const monthlyNormalized = annualCost / 12;
      if (monthlyNormalized > highestMonthlyNormalized) {
        highestMonthlyNormalized = monthlyNormalized;
        highestSub = {
          name: sub.name,
          price: convertedPrice,
          frequency: sub.frequency,
          categoryName: sub.category.name,
          normalizedMonthlyCost: monthlyNormalized,
        };
      }

      // Calculate next payment amount for next 7 days
      const nextDate = getNextPaymentDate(sub.startDate, sub.frequency);
      if (nextDate && nextDate >= today && nextDate <= in7Days) {
        next7DaysAmount += convertedPrice;
      }
    }

    // Find the top spending category
    let topCategory: {
      name: string;
      totalAnnual: number;
      percentage: number;
    } | null = null;

    let maxCatCost = -1;

    for (const [name, cost] of categoryMap.entries()) {
      if (cost > maxCatCost) {
        maxCatCost = cost;
        topCategory = {
          name,
          totalAnnual: cost,
          percentage: totalAnnual > 0 ? (cost / totalAnnual) * 100 : 0,
        };
      }
    }

    // Format top category result
    let topCategoryResult: {
      name: string;
      percentage: number;
    } | null = null;

    if (topCategory) {
      topCategoryResult = {
        name: topCategory.name,
        percentage: Number(topCategory.percentage.toFixed(1)),
      };
    }

    // Return formatted statistics
    return {
      summary: {
        daily: Number((totalAnnual / 365).toFixed(2)),
        weekly: Number((totalAnnual / 52).toFixed(2)),
        monthly: Number((totalAnnual / 12).toFixed(2)),
        yearly: Number(totalAnnual.toFixed(2)),
        totalOneTimeSpent: Number(totalOneTime.toFixed(2)),
        currency: targetCurrency,
      },
      insights: {
        highestRecurringSub: highestSub,
        projectedCosts: {
          next7Days: Number(next7DaysAmount.toFixed(2)),
        },
        digitalVsPhysical: {
          digitalPercentage:
            totalAnnual > 0
              ? Number(((digitalTotalAnnual / totalAnnual) * 100).toFixed(1))
              : 0,
          physicalPercentage:
            totalAnnual > 0
              ? Number(((physicalTotalAnnual / totalAnnual) * 100).toFixed(1))
              : 0,
        },
        topCategory: topCategoryResult,
      },
    };
  }

  async create(userId: number, data: any) {
    return await this.db.subscription.create({
      data: { ...data, userId },
      include: { category: true },
    });
  }

  async update(userId: number, subscriptionId: number, data: any) {
    const subscription = await this.db.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription || subscription.userId !== userId)
      throw new AppError("Subscription not found or permission denied", 404);

    return await this.db.subscription.update({
      where: { id: subscriptionId },
      data,
      include: { category: true },
    });
  }

  async delete(userId: number, subscriptionId: number) {
    const subscription = await this.db.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription || subscription.userId !== userId)
      throw new AppError("Subscription not found or permission denied", 404);

    return await this.db.subscription.delete({
      where: { id: subscriptionId },
    });
  }

  async getAllActiveWithUsers() {
    return await this.db.subscription.findMany({
      where: { isActive: true },
      include: { user: true, category: true },
    });
  }
}

export const subscriptionService = new SubscriptionService(prisma);
