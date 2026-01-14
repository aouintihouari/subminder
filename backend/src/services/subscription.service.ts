import { PrismaClient } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { currencyService } from "./currency.service";
import { exchangeRateService } from "./exchangeRate.service";

export class SubscriptionService {
  constructor(private db: PrismaClient) {}

  async getAll(userId: number) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { preferredCurrency: true },
    });

    const targetCurrency = user?.preferredCurrency || "EUR";

    const subscriptions = await this.db.subscription.findMany({
      where: { userId },
      orderBy: { startDate: "desc" },
    });

    const rates = await exchangeRateService.getRates();

    return subscriptions.map((sub) => {
      const convertedPrice = currencyService.convert(
        sub.price,
        sub.currency,
        targetCurrency,
        rates
      );

      return { ...sub, convertedPrice };
    });
  }

  async getStats(userId: number) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { preferredCurrency: true },
    });

    if (!user) throw new AppError("User not found", 404);

    const targetCurrency = user.preferredCurrency || "USD";

    const subscriptions = await this.db.subscription.findMany({
      where: { userId, isActive: true },
    });

    return await currencyService.calculateUserStats(
      subscriptions,
      targetCurrency
    );
  }

  async create(userId: number, data: any) {
    return await this.db.subscription.create({ data: { ...data, userId } });
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
    });
  }

  async delete(userId: number, subscriptionId: number) {
    const subscription = await this.db.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription || subscription.userId !== userId)
      throw new AppError("Subscription not found or permission denied", 404);

    return await this.db.subscription.delete({ where: { id: subscriptionId } });
  }

  async getAllActiveWithUsers() {
    return await this.db.subscription.findMany({
      where: { isActive: true },
      include: { user: true },
    });
  }
}

export const subscriptionService = new SubscriptionService(prisma);
