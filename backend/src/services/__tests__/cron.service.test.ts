import { CronService } from "../cron.service";
import { subscriptionService } from "../subscription.service";
import { emailService } from "../email.service";
import { Frequency } from "@prisma/client";

jest.mock("../subscription.service");
jest.mock("../email.service");

describe("CronService", () => {
  const cronInstance = new CronService();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should send email when renewal is due in 3 days", async () => {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    const renewalDate = new Date(threeDaysFromNow);
    renewalDate.setMonth(renewalDate.getMonth() - 1);

    const mockSubs = [
      {
        id: 1,
        name: "Netflix",
        price: 15,
        currency: "EUR",
        frequency: Frequency.MONTHLY,
        startDate: renewalDate,
        user: { email: "test@example.com" },
      },
    ];

    (subscriptionService.getAllActiveWithUsers as jest.Mock).mockResolvedValue(
      mockSubs
    );

    await cronInstance.checkUpcomingRenewals();
    expect(emailService.sendReminderEmail).toHaveBeenCalledTimes(1);
    expect(emailService.sendReminderEmail).toHaveBeenCalledWith(
      "test@example.com",
      "Netflix",
      expect.any(String),
      15,
      "EUR"
    );
  });

  it("should NOT send email if renewal is NOT due", async () => {
    const mockSubs = [
      {
        id: 1,
        name: "Spotify",
        frequency: Frequency.MONTHLY,
        startDate: new Date(),
        user: { email: "test@example.com" },
      },
    ];

    (subscriptionService.getAllActiveWithUsers as jest.Mock).mockResolvedValue(
      mockSubs
    );

    await cronInstance.checkUpcomingRenewals();
    expect(emailService.sendReminderEmail).not.toHaveBeenCalled();
  });
});
