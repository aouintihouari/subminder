// src/features/subscriptions/types/types.ts

export const Frequency = {
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
  YEARLY: "YEARLY",
  ONCE: "ONCE",
} as const;

export type Frequency = (typeof Frequency)[keyof typeof Frequency];

export const Category = {
  ENTERTAINMENT: "ENTERTAINMENT",
  LEARNING: "LEARNING",
  UTILITIES: "UTILITIES",
  WORK: "WORK",
  HEALTH: "HEALTH",
  FOOD: "FOOD",
  OTHER: "OTHER",
} as const;

export type Category = (typeof Category)[keyof typeof Category];

export interface Subscription {
  id: number;
  name: string;
  price: number;
  currency: string;
  frequency: Frequency;
  category: Category;
  description?: string;
  startDate: string;
  isActive: boolean;
  userId: number;
  createdAt: string;
}

export interface CreateSubscriptionDTO {
  name: string;
  price: number;
  currency: string;
  frequency: Frequency;
  category: Category;
  description?: string;
  startDate: Date;
}

export interface SubscriptionResponse {
  status: string;
  results?: number;
  data: {
    subscriptions?: Subscription[];
    subscription?: Subscription;
  };
}
