import { axiosInstance } from "@/lib/axios";
import { API_ROUTES } from "@/config/api.routes";
import { type SubscriptionFormData } from "../schemas/subscriptionSchema";

type SubscriptionCreatePayload = Omit<SubscriptionFormData, "startDate"> & {
  startDate: string | Date;
};

type SubscriptionUpdatePayload = Partial<
  Omit<SubscriptionFormData, "startDate">
> & {
  startDate?: string | Date;
};

export const subscriptionService = {
  getAll: async () => {
    const response = await axiosInstance.get(API_ROUTES.SUBSCRIPTIONS.GET_ALL);
    return response.data;
  },

  getStats: async () => {
    const response = await axiosInstance.get(API_ROUTES.SUBSCRIPTIONS.STATS);
    return response.data;
  },

  create: async (data: SubscriptionCreatePayload) => {
    const payload: SubscriptionCreatePayload = { ...data };

    if (payload.startDate instanceof Date) {
      payload.startDate = payload.startDate.toISOString();
    }

    const response = await axiosInstance.post(
      API_ROUTES.SUBSCRIPTIONS.CREATE,
      payload,
    );

    return response.data;
  },

  update: async (id: number, data: SubscriptionUpdatePayload) => {
    const payload: SubscriptionUpdatePayload = { ...data };

    if (payload.startDate instanceof Date) {
      payload.startDate = payload.startDate.toISOString();
    }

    const response = await axiosInstance.patch(
      API_ROUTES.SUBSCRIPTIONS.UPDATE(id),
      payload,
    );

    return response.data;
  },

  delete: async (id: number) => {
    const response = await axiosInstance.delete(
      API_ROUTES.SUBSCRIPTIONS.DELETE(id),
    );
    return response.data;
  },
};
