import axios from "axios";
import { prisma } from "../lib/prisma";
import redis from "../lib/redis";
import { AppError } from "../utils/AppError";

const CACHE_TTL = 60 * 60 * 24;
const CACHE_KEY = "exchange_rates";

export const exchangeRateService = {
  getRates: async (): Promise<Record<string, number>> => {
    try {
      const cachedRates = await redis.get(CACHE_KEY);
      if (cachedRates) return JSON.parse(cachedRates);

      const ratesFromDb = await prisma.exchangeRate.findMany();

      if (ratesFromDb.length > 0) {
        const ratesObject: Record<string, number> = Object.fromEntries(
          ratesFromDb.map((r) => [r.currency, r.rate])
        );

        await redis.set(
          CACHE_KEY,
          JSON.stringify(ratesObject),
          "EX",
          CACHE_TTL
        );
        return ratesObject;
      }

      return await exchangeRateService.updateRates();
    } catch (error) {
      console.error("⚠️ Error fetching rates:", error);
      throw new AppError("Unable to retrieve exchange rates", 503);
    }
  },

  updateRates: async (): Promise<Record<string, number>> => {
    console.log("🔄 Fetching new exchange rates from external API...");

    const response = await axios.get<{ rates: Record<string, number> }>(
      "https://api.frankfurter.app/latest?from=USD"
    );
    const rates = response.data.rates;

    rates["USD"] = 1;

    const operations = Object.entries(rates).map(([currency, rate]) =>
      prisma.exchangeRate.upsert({
        where: { currency },
        update: { rate: rate },
        create: { currency, rate: rate },
      })
    );
    await prisma.$transaction(operations);

    await redis.set(CACHE_KEY, JSON.stringify(rates), "EX", CACHE_TTL);

    console.log("✅ Exchange rates updated successfully");
    return rates;
  },
};
