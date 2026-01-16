import { exchangeRateService } from "../exchangeRate.service";
import axios from "axios";
import { prisma } from "../../lib/prisma";
import redis from "../../lib/redis";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";

jest.mock("axios");
jest.mock("../../lib/prisma");

jest.mock("../../lib/redis", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("ExchangeRateService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReset(prismaMock);
  });

  describe("getRates", () => {
    it("should return cached rates from Redis if available", async () => {
      const cachedRates = JSON.stringify({ EUR: 1, USD: 1.1 });
      (redis.get as jest.Mock).mockResolvedValue(cachedRates);

      const rates = await exchangeRateService.getRates();

      expect(redis.get).toHaveBeenCalledWith("exchange_rates");
      expect(rates).toEqual({ EUR: 1, USD: 1.1 });
      expect(prismaMock.exchangeRate.findMany).not.toHaveBeenCalled();
    });

    it("should fetch from DB if Redis is empty, then cache it", async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      prismaMock.exchangeRate.findMany.mockResolvedValue([
        { id: 1, currency: "USD", rate: 1.1, updatedAt: new Date() },
      ] as any);

      const rates = await exchangeRateService.getRates();

      expect(rates).toEqual({ USD: 1.1 });
      expect(redis.set).toHaveBeenCalled();
    });
  });

  describe("updateRates", () => {
    it("should fetch from API, update DB, and update Redis", async () => {
      const apiResponse = { data: { rates: { GBP: 0.85 } } };
      (axios.get as jest.Mock).mockResolvedValue(apiResponse);

      prismaMock.$transaction.mockResolvedValue([]);

      const rates = await exchangeRateService.updateRates();

      expect(axios.get).toHaveBeenCalled();
      expect(prismaMock.exchangeRate.upsert).toHaveBeenCalledTimes(2);

      expect(redis.set).toHaveBeenCalled();
      expect(rates.GBP).toBe(0.85);
      expect(rates.USD).toBe(1);
    });
  });
});
