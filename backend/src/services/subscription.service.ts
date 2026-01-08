import { PrismaClient, Frequency } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";

export class SubscriptionService {
  constructor(private db: PrismaClient) {}

  async getAll(userId: number) {
    return await this.db.subscription.findMany({
      where: { userId },
      orderBy: { startDate: "desc" },
    });
  }

  async getStats(userId: number) {
    const subscriptions = await this.db.subscription.findMany({
      where: { userId, isActive: true },
    });

    const totalMonthly = subscriptions.reduce((acc, sub) => {
      switch (sub.frequency) {
        case Frequency.WEEKLY:
          return acc + (sub.price * 52) / 12;
        case Frequency.MONTHLY:
          return acc + sub.price;
        case Frequency.YEARLY:
          return acc + sub.price / 12;
        case Frequency.ONCE:
          return acc;
        default:
          return acc;
      }
    }, 0);

    const totalYearly = totalMonthly * 12;

    const mostExpensive = subscriptions.reduce(
      (prev, current) => (prev.price > current.price ? prev : current),
      subscriptions[0] || null
    );

    const uniqueCategories = new Set(subscriptions.map((s) => s.category)).size;

    return {
      totalMonthly,
      totalYearly,
      activeCount: subscriptions.length,
      categoryCount: uniqueCategories,
      mostExpensive,
    };
  }

  async create(userId: number, data: any) {
    return await this.db.subscription.create({ data: { ...data, userId } });
  }

  async update(userId: number, subscriptionId: number, data: any) {
    const subscription = await this.db.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription || subscription.userId !== userId) {
      throw new AppError("Subscription not found or permission denied", 404);
    }

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
