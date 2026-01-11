process.env.RESEND_API_KEY = "re_123456789";
process.env.FRONTEND_URL = "http://localhost:3000";
process.env.EMAIL_FROM = "onboarding@resend.dev";

const mockSend = jest.fn();

jest.mock("resend", () => {
  return {
    Resend: jest.fn().mockImplementation(() => {
      return { emails: { send: mockSend } };
    }),
  };
});

import { emailService } from "../email.service";

describe("EmailService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSend.mockResolvedValue({ data: { id: "test_email_id" }, error: null });
  });

  it("should send a verification email with correct parameters via Resend", async () => {
    const email = "test@example.com";
    const name = "Test User";
    const token = "123456";

    await emailService.sendVerificationEmail(email, name, token);
    expect(mockSend).toHaveBeenCalledTimes(1);
    const callArgs = mockSend.mock.calls[0][0];

    expect(callArgs.to).toBe(email);
    expect(callArgs.from).toContain("onboarding@resend.dev");
    expect(callArgs.subject).toContain("Welcome to SubMinder");
    expect(callArgs.html).toContain(token);
    expect(callArgs.html).toContain("verify-email");
  });

  it("should handle Resend API errors gracefully", async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { message: "API Key invalid", name: "invalid_api_key" },
    });

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await emailService.sendVerificationEmail(
      "fail@test.com",
      "Fail User",
      "token"
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      "🔥 Resend API Error:",
      expect.objectContaining({ message: "API Key invalid" })
    );

    consoleSpy.mockRestore();
  });

  it("should send a password reset email with correct link", async () => {
    const email = "reset@example.com";
    const token = "reset_token_123";
    const name = "Reset User";

    await emailService.sendPasswordResetEmail(email, token, name);

    expect(mockSend).toHaveBeenCalledTimes(1);
    const callArgs = mockSend.mock.calls[0][0];

    expect(callArgs.to).toBe(email);
    expect(callArgs.subject).toContain("Reset your password");
    expect(callArgs.html).toContain(token);
    expect(callArgs.html).toContain("/reset-password/");
  });

  it("should send a reminder email with correct parameters", async () => {
    const email = "user@example.com";
    const subscriptionName = "Netflix";
    const renewalDate = "2026-02-01";
    const price = 15.99;
    const currency = "USD";

    await emailService.sendReminderEmail(
      email,
      subscriptionName,
      renewalDate,
      price,
      currency
    );

    expect(mockSend).toHaveBeenCalledTimes(1);
    const callArgs = mockSend.mock.calls[0][0];

    expect(callArgs.to).toBe(email);
    expect(callArgs.subject).toContain("Netflix");
    expect(callArgs.html).toContain(subscriptionName);
    expect(callArgs.html).toContain(renewalDate);
  });

  it("should not send email if required parameters are missing", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await emailService.sendReminderEmail(
      "",
      "Netflix",
      "2026-02-01",
      15.99,
      "USD"
    );

    expect(mockSend).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Invalid parameters")
    );

    consoleSpy.mockRestore();
  });
});
