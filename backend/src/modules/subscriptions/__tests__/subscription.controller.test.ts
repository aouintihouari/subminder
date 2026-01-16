import { Request, Response } from "express";
import {
  createSubscription,
  getSubscriptionStats,
  getMySubscriptions,
} from "../subscription.controller";
import { subscriptionService } from "../subscription.service";

jest.mock("../subscription.service");

describe("SubscriptionController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    req = { user: { id: 1 } as any, body: {} };

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    res = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;

    jest.clearAllMocks();
  });

  describe("getMySubscriptions", () => {
    it("should return all subscriptions for the user", async () => {
      const mockSubscriptions = [
        {
          id: 1,
          name: "Netflix",
          price: 10,
          category: { name: "Entertainment" },
        },
        {
          id: 2,
          name: "Spotify",
          price: 12,
          category: { name: "Entertainment" },
        },
      ];

      (subscriptionService.getAll as jest.Mock).mockResolvedValue(
        mockSubscriptions
      );

      await getMySubscriptions(req as Request, res as Response);

      expect(subscriptionService.getAll).toHaveBeenCalledWith(1);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        status: "success",
        results: 2,
        data: { subscriptions: mockSubscriptions },
      });
    });
  });

  describe("createSubscription", () => {
    it("should call service.create and return 201 when data is valid", async () => {
      const validData = {
        name: "Netflix",
        price: 15,
        currency: "EUR",
        frequency: "MONTHLY",
        categoryId: 1, // ✅ V2: ID
        startDate: "2024-01-01",
      };
      req.body = validData;

      (subscriptionService.create as jest.Mock).mockResolvedValue({
        id: 1,
        ...validData,
        startDate: new Date(validData.startDate),
        category: { id: 1, name: "Entertainment" },
      });

      await createSubscription(req as Request, res as Response);

      expect(subscriptionService.create).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          name: "Netflix",
          categoryId: 1,
          startDate: expect.any(Date),
        })
      );

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          data: expect.anything(),
        })
      );
    });
  });

  describe("getSubscriptionStats", () => {
    it("should call service.getStats and return 200 (Structure V2)", async () => {
      // ✅ Mock de la nouvelle structure Dashboard V2
      const mockStats = {
        summary: {
          daily: 1,
          monthly: 30,
          yearly: 360,
          currency: "EUR",
        },
        insights: {
          highestRecurringSub: { name: "Rent" },
          projectedCosts: { next7Days: 0 },
        },
      };
      (subscriptionService.getStats as jest.Mock).mockResolvedValue(mockStats);

      await getSubscriptionStats(req as Request, res as Response);

      expect(subscriptionService.getStats).toHaveBeenCalledWith(1);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        status: "success",
        data: mockStats,
      });
    });
  });
});
