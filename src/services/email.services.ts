import transporter from "../config/nodemailer.js";
import { generateOTPEmail, getEmailSubject } from "../templates/templates.js";

export interface SendOtpEmailParams {
  email: string;
  otp: string;
  userName?: string;
  expiryMinutes?: number;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: Error;
}

export const sendOtpEmail = async ({
  email,
  otp,
  userName,
  expiryMinutes = 15,
}: SendOtpEmailParams): Promise<EmailResult> => {
  try {
    // Validate inputs
    if (!email || typeof email !== "string") {
      throw new Error("Valid email address is required");
    }

    if (!otp || typeof otp !== "string") {
      throw new Error("Valid OTP code is required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    const subject = getEmailSubject("otp");
    const htmlContent = generateOTPEmail({
      userName: userName || email.split("@")[0],
      otpCode: otp,
      expiryMinutes,
    });

    const senderEmail = process.env.SENDER_EMAIL;
    if (!senderEmail) {
      throw new Error("SENDER_EMAIL environment variable is not configured");
    }

    const mailResult = await transporter.sendMail({
      from: `"OTP Service" <${senderEmail}>`,
      to: email.trim().toLowerCase(),
      subject,
      html: htmlContent,
    });

    console.log(
      `[EMAIL SUCCESS] OTP sent to ${email} (MessageId: ${mailResult.messageId})`
    );

    return {
      success: true,
      messageId: mailResult.messageId,
    };
  } catch (error) {
    const emailError =
      error instanceof Error ? error : new Error(String(error));
    console.error(
      `[EMAIL ERROR] Failed to send OTP to ${email}: ${emailError.message}`
    );

    return {
      success: false,
      error: emailError,
    };
  }
};
