import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";

interface EmailOptions {
  email: string;
  subject: string;
  templateName: string;
  data: Record<string, any>;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER)
      console.warn(
        "⚠️ SMTP configuration is missing. Emails will not be sent."
      );

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private async send(options: EmailOptions): Promise<void> {
    try {
      const templatePath = path.join(
        __dirname,
        `../templates/${options.templateName}.ejs`
      );

      const html = await ejs.renderFile(templatePath, options.data);

      const mailOptions = {
        from: process.env.SMTP_FROM || "SubMinder <no-reply@subminder.com>",
        to: options.email,
        subject: options.subject,
        html,
      };

      await this.transporter.sendMail(mailOptions);
      console.info(`📧 Email sent successfully to ${options.email}`);
    } catch (err) {
      console.error("🔥 Error sending email:", err);
    }
  }

  async sendVerificationEmail(
    email: string,
    name: string,
    token: string
  ): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    await this.send({
      email,
      subject: "Welcome to SubMinder! Please verify your email",
      templateName: "verification-email",
      data: { name, url: verificationUrl },
    });
  }
}

export const emailService = new EmailService();
