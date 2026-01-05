import { apiClient } from "@/lib/axios";
import {
  type CreateSubscriptionDTO,
  type SubscriptionResponse,
} from "../types/types";

export const subscriptionService = {
  getAll: async (): Promise<SubscriptionResponse> => {
    const response =
      await apiClient.get<SubscriptionResponse>("/subscriptions");
    return response.data;
  },

  create: async (
    data: CreateSubscriptionDTO,
  ): Promise<SubscriptionResponse> => {
    const response = await apiClient.post<SubscriptionResponse>(
      "/subscriptions",
      {
        ...data,
        startDate: data.startDate.toISOString(),
      },
    );
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<CreateSubscriptionDTO>,
  ): Promise<SubscriptionResponse> => {
    const payload = {
      ...data,
      ...(data.startDate && { startDate: data.startDate.toISOString() }),
    };
    const response = await apiClient.patch<SubscriptionResponse>(
      `/subscriptions/${id}`,
      payload,
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/subscriptions/${id}`);
  },
};
