process.env.SMTP_HOST = "smtp.test.com";
process.env.SMTP_USER = "test@subminder.com";
process.env.SMTP_PASS = "secret";
process.env.EMAIL_FROM = "no-reply@test.com";
process.env.FRONTEND_URL = "http://localhost:3000";

const mockSendMail = jest.fn().mockResolvedValue(true);

jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: mockSendMail,
  }),
}));

import { emailService } from "../email.service";

describe("EmailService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should send a verification email with correct parameters", async () => {
    const email = "test@example.com";
    const name = "Test User";
    const token = "123456";

    await emailService.sendVerificationEmail(email, name, token);

    expect(mockSendMail).toHaveBeenCalledTimes(1);

    const callArgs = mockSendMail.mock.calls[0][0];
    expect(callArgs.to).toBe(email);
    expect(callArgs.subject).toContain("SubMinder");
    expect(callArgs.html).toContain(token);
  });
});
