import { SubscriptionService } from "../subscription.service";
import { prismaMock } from "../../shared/lib/__mocks__/prisma";

jest.mock("../../shared/services/exchangeRate.service", () => ({
  exchangeRateService: {
    getRates: jest.fn().mockResolvedValue({ EUR: 1, USD: 1.1 }), // 1 EUR = 1.1 USD
  },
}));

describe("SubscriptionService", () => {
  let subscriptionService: SubscriptionService;

  beforeEach(() => {
    // Injection du mock Prisma
    subscriptionService = new SubscriptionService(prismaMock as any);
    jest.clearAllMocks();
  });

  const mockCategoryDigital = {
    id: 1,
    name: "Entertainment",
    slug: "entertainment",
    icon: "film",
    color: "#FF0000",
    isSystem: true,
    isDigital: true,
    type: "EXPENSE",
    userId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategoryPhysical = {
    id: 2,
    name: "Health",
    slug: "health",
    icon: "activity",
    color: "#00FF00",
    isSystem: true,
    isDigital: false,
    type: "EXPENSE",
    userId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("getStats (Dashboard V2)", () => {
    it("should calculate totals, digital ratio and top category correctly", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        preferredCurrency: "EUR",
      } as any);
      const mockSubs = [
        {
          id: 1,
          name: "Netflix",
          price: 10,
          currency: "EUR",
          frequency: "MONTHLY",
          categoryId: 1,
          category: mockCategoryDigital,
          startDate: new Date("2024-01-01"),
          isActive: true,
          userId: 1,
        },
        {
          id: 2,
          name: "Gym",
          price: 50,
          currency: "EUR",
          frequency: "MONTHLY",
          categoryId: 2,
          category: mockCategoryPhysical,
          startDate: new Date("2024-01-01"),
          isActive: true,
          userId: 1,
        },
        {
          id: 3,
          name: "One Time Setup",
          price: 100,
          currency: "EUR",
          frequency: "ONCE",
          categoryId: 1,
          category: mockCategoryDigital,
          startDate: new Date("2024-01-01"),
          isActive: true,
          userId: 1,
        },
      ];

      prismaMock.subscription.findMany.mockResolvedValue(mockSubs as any);

      const stats = await subscriptionService.getStats(1);

      expect(stats.summary.monthly).toBe(60);
      expect(stats.summary.yearly).toBe(720); // 60 * 12
      expect(stats.summary.totalOneTimeSpent).toBe(100);

      expect(stats.insights.digitalVsPhysical.digitalPercentage).toBe(16.7);

      expect(stats.insights.topCategory?.name).toBe("Health");
    });

    it("should handle empty subscriptions gracefully", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        preferredCurrency: "EUR",
      } as any);
      prismaMock.subscription.findMany.mockResolvedValue([]);

      const stats = await subscriptionService.getStats(1);

      expect(stats.summary.monthly).toBe(0);
      expect(stats.insights.topCategory).toBeNull();
    });
  });

  describe("CRUD Operations", () => {
    it("create should include category relation", async () => {
      const inputData = { name: "Test", price: 10, categoryId: 1 };

      prismaMock.subscription.create.mockResolvedValue({
        id: 1,
        ...inputData,
        category: mockCategoryDigital,
      } as any);

      const result = await subscriptionService.create(1, inputData);

      expect(prismaMock.subscription.create).toHaveBeenCalledWith(
        expect.objectContaining({ include: { category: true } })
      );
      expect(result.category).toBeDefined();
    });

    it("update should throw error if user does not own subscription", async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        id: 1,
        userId: 99, // Pas le bon user
      } as any);

      await expect(
        subscriptionService.update(1, 1, { price: 20 })
      ).rejects.toThrow("permission denied");
    });
  });
});
