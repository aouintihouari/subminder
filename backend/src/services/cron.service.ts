import cron from "node-cron";
import { subscriptionService } from "./subscription.service";
import { exchangeRateService } from "./exchangeRate.service";
import { emailService } from "./email.service";
import { isRenewalDue } from "../utils/scheduler.utils";
import { logger } from "../lib/logger";

export class CronService {
  public async checkUpcomingRenewals() {
    logger.info("🔄 Cron Job started: Checking for upcoming renewals...");

    try {
      const subscriptions = await subscriptionService.getAllActiveWithUsers();

      const today = new Date();
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + 3);

      logger.debug(`📅 Target Date for reminder: ${targetDate.toDateString()}`);

      let sentCount = 0;

      for (const sub of subscriptions) {
        if (isRenewalDue(sub.startDate, sub.frequency, targetDate)) {
          logger.info(
            `🔔 Sending reminder for ${sub.name} (User: ${sub.user.email})`
          );

          try {
            await emailService.sendReminderEmail(
              sub.user.email,
              sub.name,
              targetDate.toDateString(),
              sub.price,
              sub.currency
            );
            sentCount++;
          } catch (emailError) {
            logger.error(
              emailError,
              `❌ Failed to send email to ${sub.user.email}`
            );
          }
        }
      }

      logger.info(`✅ Cron Job finished. ${sentCount} reminders sent.`);
    } catch (error) {
      logger.error(error, "💥 Cron Job Critical Error");
    }
  }

  public async handleDailyRatesUpdate() {
    try {
      logger.info("💱 Starting daily exchange rate update...");
      await exchangeRateService.updateRates();
      logger.info("✅ Daily exchange rate update completed.");
    } catch (error) {
      logger.error(error, "❌ Failed to update daily rates");
    }
  }
}

export const cronService = new CronService();

export const initCronJobs = () => {
  cron.schedule("0 8 * * *", () => {
    cronService.handleDailyRatesUpdate();
  });

  cron.schedule("0 9 * * *", () => {
    logger.info("⏰ Triggering Daily Renewal Check...");
    cronService.checkUpcomingRenewals();
  });

  logger.info("✅ Scheduler initialized: Rates at 08:00, Renewals at 09:00.");
};
