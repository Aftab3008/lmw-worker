export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  loginUrl?: string;
}

export interface OTPEmailData {
  userName: string;
  otpCode: string;
  expiryMinutes?: number;
}

export interface PasswordResetEmailData {
  userName: string;
  resetLink: string;
  expiryHours?: number;
}
