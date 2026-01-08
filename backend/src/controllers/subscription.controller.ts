import { Request, Response } from "express";

import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
} from "../schemas/subscriptionSchema";
import { subscriptionService } from "../services/subscription.service";

export const getMySubscriptions = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const subscriptions = await subscriptionService.getAll(userId);

  res.status(200).json({
    status: "success",
    results: subscriptions.length,
    data: { subscriptions },
  });
};

export const getSubscriptionStats = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const stats = await subscriptionService.getStats(userId);

  res.status(200).json({ status: "success", data: stats });
};

export const createSubscription = async (req: Request, res: Response) => {
  const validatedData = createSubscriptionSchema.parse({ body: req.body });
  const { startDate, ...otherData } = validatedData.body;

  const subscription = await subscriptionService.create(req.user!.id, {
    ...otherData,
    startDate: new Date(startDate),
  });

  res.status(201).json({ status: "success", data: { subscription } });
};

export const updateSubscription = async (req: Request, res: Response) => {
  const subscriptionId = Number(req.params.id);
  const validatedData = updateSubscriptionSchema.parse({ body: req.body });
  const { startDate, ...otherData } = validatedData.body;
  const updatedSubscription = await subscriptionService.update(
    req.user!.id,
    subscriptionId,
    { ...otherData, ...(startDate && { startDate: new Date(startDate) }) }
  );

  res
    .status(200)
    .json({ status: "success", data: { subscription: updatedSubscription } });
};

export const deleteSubscription = async (req: Request, res: Response) => {
  const subscriptionId = Number(req.params.id);
  await subscriptionService.delete(req.user!.id, subscriptionId);
  res.status(204).json({ status: "success", data: null });
};
