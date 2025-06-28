import transporter from "../config/nodemailer.js";
import { generateOTPEmail, getEmailSubject } from "../templates/templates.js";

export const sendOtpEmail = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) => {
  try {
    const subject = getEmailSubject("otp");
    const htmlContent = generateOTPEmail({
      userName: email,
      otpCode: otp,
      expiryMinutes: 15,
    });
    await transporter.sendMail({
      from: `"OTP Service" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject,
      html: htmlContent,
    });
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send OTP to ${email}:`, error);
    throw error;
  }
};
