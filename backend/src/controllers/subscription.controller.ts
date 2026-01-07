import { Request, Response } from "express";
import { Frequency } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { createSubscriptionSchema } from "../schemas/subscriptionSchema";
import { updateSubscriptionSchema } from "../schemas/subscriptionSchema";
import { AppError } from "../utils/AppError";

export const getMySubscriptions = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const subscriptions = await prisma.subscription.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
  });

  res.status(200).json({
    status: "success",
    results: subscriptions.length,
    data: { subscriptions },
  });
};

export const getSubscriptionStats = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const subscriptions = await prisma.subscription.findMany({
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

  res.status(200).json({
    status: "success",
    data: {
      totalMonthly,
      totalYearly,
      activeCount: subscriptions.length,
      categoryCount: uniqueCategories,
      mostExpensive,
    },
  });
};

export const createSubscription = async (req: Request, res: Response) => {
  const validatedData = createSubscriptionSchema.parse({ body: req.body });
  const { startDate, ...otherData } = validatedData.body;

  const subscription = await prisma.subscription.create({
    data: {
      ...otherData,
      startDate: new Date(startDate),
      userId: req.user!.id,
    },
  });

  res.status(201).json({ status: "success", data: { subscription } });
};

export const updateSubscription = async (req: Request, res: Response) => {
  const subscriptionId = Number(req.params.id);
  const userId = req.user!.id;

  const validatedData = updateSubscriptionSchema.parse({ body: req.body });
  const { startDate, ...otherData } = validatedData.body;

  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription || subscription.userId !== userId)
    throw new AppError("Subscription not found or permission denied", 404);

  const updatedSubscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      ...otherData,
      ...(startDate && { startDate: new Date(startDate) }),
    },
  });

  res
    .status(200)
    .json({ status: "success", data: { subscription: updatedSubscription } });
};

export const deleteSubscription = async (req: Request, res: Response) => {
  const subscriptionId = Number(req.params.id);
  const userId = req.user!.id;

  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription || subscription.userId !== userId)
    throw new AppError("Subscription not found or permission denied", 404);

  await prisma.subscription.delete({ where: { id: subscriptionId } });

  res.status(204).json({ status: "success", data: null });
};
