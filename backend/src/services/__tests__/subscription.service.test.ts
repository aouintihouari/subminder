import { mockReset, mockDeep } from "jest-mock-extended";
import { PrismaClient, Frequency, Category } from "@prisma/client";
import { SubscriptionService } from "../subscription.service";
import { exchangeRateService } from "../exchangeRate.service";

const prismaMock = mockDeep<PrismaClient>();

jest.mock("../exchangeRate.service");

const subscriptionService = new SubscriptionService(prismaMock);

describe("SubscriptionService", () => {
  beforeEach(() => {
    mockReset(prismaMock);
    jest.clearAllMocks();

    (exchangeRateService.getRates as jest.Mock).mockResolvedValue({
      USD: 1,
      EUR: 1,
    });
  });

  describe("createSubscription", () => {
    it("should create a monthly and yearly totals correctly", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        preferredCurrency: "EUR",
      } as any);

      const mockSubs = [
        {
          id: 1,
          price: 10,
          frequency: Frequency.MONTHLY,
          category: Category.ENTERTAINMENT,
          currency: "EUR",
          isActive: true,
        },
        {
          id: 2,
          price: 120,
          frequency: Frequency.YEARLY,
          category: Category.HEALTH,
          currency: "EUR",
          isActive: true,
        },
      ];

      prismaMock.subscription.findMany.mockResolvedValue(mockSubs as any);
      const stats = await subscriptionService.getStats(1);

      expect(stats.totalMonthly).toBe(20);
      expect(stats.totalYearly).toBe(240);
      expect(stats.activeCount).toBe(2);
    });

    it("should handle empty subscriptions", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        preferredCurrency: "EUR",
      } as any);

      prismaMock.subscription.findMany.mockResolvedValue([]);

      const stats = await subscriptionService.getStats(1);
      expect(stats.totalMonthly).toBe(0);
      expect(stats.activeCount).toBe(0);
      expect(stats.mostExpensive).toBeNull();
    });
  });

  describe("update", () => {
    it("should throw error if subscription belongs to another user", async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        id: 1,
        userId: 99,
      } as any);

      await expect(
        subscriptionService.update(1, 1, { price: 20 })
      ).rejects.toThrow("permission denied");
    });

    it("should update if user owns the subscription", async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        id: 1,
        userId: 1,
      } as any);
      prismaMock.subscription.update.mockResolvedValue({
        id: 1,
        price: 20,
      } as any);

      const result = await subscriptionService.update(1, 1, { price: 20 });

      expect(result.price).toBe(20);
    });
  });
});
