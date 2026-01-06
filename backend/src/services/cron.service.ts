import { prisma } from "../lib/prisma";
import { emailService } from "./email.service";
import { isRenewalDue } from "../utils/scheduler.utils";

export class CronService {
  public async checkUpcomingRenewals() {
    console.log("🔄 Cron Job started: Checking for upcoming renewals...");

    try {
      const subscriptions = await prisma.subscription.findMany({
        where: { isActive: true },
        include: { user: true },
      });

      const today = new Date();
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + 3);

      console.log(`📅 Target Date for reminder: ${targetDate.toDateString()}`);

      let sentCount = 0;

      for (const sub of subscriptions) {
        if (isRenewalDue(sub.startDate, sub.frequency, targetDate)) {
          console.log(
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
            console.error(
              `❌ Failed to send email to ${sub.user.email}`,
              emailError
            );
          }
        }
      }

      console.log(`✅ Cron Job finished. ${sentCount} reminders sent.`);
    } catch (error) {
      console.error("💥 Cron Job Critical Error:", error);
    }
  }
}

export const cronService = new CronService();
