import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { createSubscriptionSchema } from "../schemas/subscriptionSchema";

export const createSubscription = async (req: Request, res: Response) => {
  const validatedData = createSubscriptionSchema.parse({ body: req.body });
  const { name, price, currency, frequency, category, startDate, isActive } =
    validatedData.body;

  const userId = req.user!.id;

  const subscription = await prisma.subscription.create({
    data: {
      name,
      price,
      currency,
      frequency,
      category,
      startDate: new Date(startDate),
      isActive,
      userId,
    },
  });

  res.status(201).json({ status: "success", data: { subscription } });
};

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
