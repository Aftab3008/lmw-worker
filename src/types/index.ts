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

// OTP Worker specific types
export interface OtpJobPayload {
  email: string;
  otp: string;
  retryCount: number; // Required with default 0
  jobId?: string;
  timestamp?: number;
  priority?: "low" | "normal" | "high";
  metadata?: Record<string, any>;
}

export interface WorkerConfig {
  queueName: string;
  maxRetries: number;
  baseDelayMs: number;
  prefetchCount: number;
}

export interface ProcessingResult {
  success: boolean;
  error?: Error;
  processingTimeMs: number;
}
