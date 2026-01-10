import { Resend } from "resend";
import ejs from "ejs";
import path from "path";

interface EmailOptions {
  email: string;
  subject: string;
  templateName: string;
  data: Record<string, any>;
}

class EmailService {
  private resend: Resend | null = null;

  constructor() {
    if (process.env.RESEND_API_KEY)
      this.resend = new Resend(process.env.RESEND_API_KEY);
    else
      console.warn(
        "⚠️ RESEND_API_KEY is missing. Emails will be logged in console only (Simulation Mode)."
      );
  }

  private async send(options: EmailOptions): Promise<void> {
    if (!this.resend) {
      console.log(
        `⚠️ [DEV MODE] Email Simulation: Sending "${options.subject}" to ${options.email}`
      );
      return;
    }

    try {
      const templatePath = path.join(
        __dirname,
        `../templates/${options.templateName}.ejs`
      );

      const html = await ejs.renderFile(templatePath, options.data);

      const data = await this.resend.emails.send({
        from: process.env.EMAIL_FROM || "SubMinder <onboarding@resend.dev>",
        to: options.email,
        subject: options.subject,
        html: html,
      });

      if (data.error) {
        console.error("🔥 Resend API Error:", data.error);
        throw new Error(data.error.message);
      }

      console.info(
        `📧 Email sent successfully to ${options.email} (ID: ${data.data?.id})`
      );
    } catch (err) {
      console.error("🔥 Error sending email:", err);
      if (process.env.NODE_ENV === "production_strict") throw err;
    }
  }

  async sendVerificationEmail(
    email: string,
    name: string,
    token: string
  ): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    if (!this.resend)
      console.log("🔗 Manual Verification Link:", verificationUrl);

    await this.send({
      email,
      subject: "Welcome to SubMinder! Please verify your email",
      templateName: "verification-email",
      data: { name, url: verificationUrl },
    });
  }

  async sendReminderEmail(
    email: string,
    subscriptionName: string,
    renewalDate: string,
    price: number,
    currency: string
  ): Promise<void> {
    if (!email || !subscriptionName || !renewalDate) {
      console.error("❌ Invalid parameters for reminder email. Aborting.");
      return;
    }

    await this.send({
      email,
      subject: `⚠️ Upcoming Renewal: ${subscriptionName}`,
      templateName: "reminder-email",
      data: { subscriptionName, renewalDate, price, currency },
    });
  }
}

export const emailService = new EmailService();
