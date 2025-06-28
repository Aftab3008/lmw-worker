import {
  WelcomeEmailData,
  OTPEmailData,
  PasswordResetEmailData,
} from "../types/index.js";

const baseStyles = `
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9fafb;
    }
    .email-container {
      background-color: white;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      width: 60px;
      height: 60px;
      background-color: #16a34a;
      border-radius: 50%;
      display: inline-block;
      position: relative;
      margin-bottom: 20px;
    }
    .logo::after {
      content: '📚';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 24px;
    }
    .title {
      color: #16a34a;
      font-size: 24px;
      font-weight: bold;
      margin: 10px 0;
    }
    .content {
      margin: 20px 0;
      line-height: 1.8;
    }
    .highlight {
      color: #16a34a;
      font-weight: bold;
    }
    .button {
      display: inline-block;
      background-color: #16a34a;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 20px 0;
      transition: background-color 0.3s;
    }
    .button:hover {
      background-color: #15803d;
    }
    .otp-code {
      background-color: #f0f9ff;
      border: 2px dashed #16a34a;
      padding: 20px;
      text-align: center;
      border-radius: 8px;
      margin: 20px 0;
    }
    .otp-digits {
      font-size: 32px;
      font-weight: bold;
      color: #16a34a;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
      text-align: center;
    }
    .warning {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .security-notice {
      background-color: #fee2e2;
      border-left: 4px solid #ef4444;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
`;

export function generateWelcomeEmail(data: WelcomeEmailData): string {
  const { userName, userEmail, loginUrl } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to LMS Platform</title>
  ${baseStyles}
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo"></div>
      <h1 class="title">Welcome to LMS Platform!</h1>
    </div>
    
    <div class="content">
      <p>Hello <span class="highlight">${userName}</span>,</p>
      
      <p>We're thrilled to welcome you to our Learning Management System! Your account has been successfully created and you're now part of our growing community of learners.</p>
      
      <p><strong>Your account details:</strong></p>
      <ul>
        <li><strong>Email:</strong> ${userEmail}</li>
        <li><strong>Account Status:</strong> <span class="highlight">Active</span></li>
      </ul>
      
      <p>Here's what you can do next:</p>
      <ul>
        <li>Complete your profile setup</li>
        <li>Browse available courses</li>
        <li>Join study groups and discussions</li>
        <li>Track your learning progress</li>
      </ul>
      
      ${
        loginUrl
          ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${loginUrl}" class="button">Get Started Now</a>
      </div>
      `
          : ""
      }
      
      <div class="warning">
        <strong>💡 Pro Tip:</strong> Complete your profile within the first 24 hours to unlock additional features and get personalized course recommendations.
      </div>
    </div>
    
    <div class="footer">
      <p>If you have any questions, our support team is here to help you at <a href="mailto:support@lms.com" style="color: #16a34a;">support@lms.com</a></p>
      <p>Happy Learning!</p>
      <p><strong>The LMS Team</strong></p>
    </div>
  </div>
</body>
</html>
  `;
}

export function generateOTPEmail(data: OTPEmailData): string {
  const { userName, otpCode, expiryMinutes = 10 } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code</title>
  ${baseStyles}
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo"></div>
      <h1 class="title">Verification Code</h1>
    </div>
    
    <div class="content">
      <p>Hello <span class="highlight">${userName}</span>,</p>
      
      <p>You requested a verification code for your LMS account. Please use the code below to complete your verification:</p>
      
      <div class="otp-code">
        <p style="margin: 0; font-size: 16px; color: #6b7280;">Your verification code is:</p>
        <div class="otp-digits">${otpCode}</div>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">
          This code will expire in <strong>${expiryMinutes} minutes</strong>
        </p>
      </div>
      
      <p><strong>For your security:</strong></p>
      <ul>
        <li>Do not share this code with anyone</li>
        <li>Our team will never ask for your verification code</li>
        <li>If you didn't request this code, please ignore this email</li>
      </ul>
      
      <div class="security-notice">
        <strong>⚠️ Security Notice:</strong> If you didn't request this verification code, someone may be trying to access your account. Please contact our support team immediately.
      </div>
    </div>
    
    <div class="footer">
      <p>This is an automated message, please do not reply to this email.</p>
      <p>If you need assistance, contact us at <a href="mailto:support@lms.com" style="color: #16a34a;">support@lms.com</a></p>
      <p><strong>The LMS Security Team</strong></p>
    </div>
  </div>
</body>
</html>
  `;
}

export function generatePasswordResetEmail(
  data: PasswordResetEmailData
): string {
  const { userName, resetLink, expiryHours = 1 } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  ${baseStyles}
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo"></div>
      <h1 class="title">Password Reset Request</h1>
    </div>
    
    <div class="content">
      <p>Hello <span class="highlight">${userName}</span>,</p>
      
      <p>We received a request to reset the password for your LMS account. If you made this request, click the button below to set a new password:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" class="button">Reset My Password</a>
      </div>
      
      <p><strong>Important details:</strong></p>
      <ul>
        <li>This link will expire in <strong>${expiryHours} hour${
    expiryHours > 1 ? "s" : ""
  }</strong></li>
        <li>You can only use this link once</li>
        <li>If the link expires, you'll need to request a new password reset</li>
      </ul>
      
      <div class="warning">
        <strong>📋 Alternative Method:</strong> If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${resetLink}" style="color: #16a34a; word-break: break-all;">${resetLink}</a>
      </div>
      
      <div class="security-notice">
        <strong>🔒 Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged. For additional security, consider enabling two-factor authentication on your account.
      </div>
      
      <p><strong>Tips for creating a strong password:</strong></p>
      <ul>
        <li>Use at least 8 characters</li>
        <li>Include uppercase and lowercase letters</li>
        <li>Add numbers and special characters</li>
        <li>Avoid using personal information</li>
      </ul>
    </div>
    
    <div class="footer">
      <p>This link was sent to you because a password reset was requested for your account.</p>
      <p>If you need help, contact our support team at <a href="mailto:support@lms.com" style="color: #16a34a;">support@lms.com</a></p>
      <p><strong>The LMS Security Team</strong></p>
    </div>
  </div>
</body>
</html>
  `;
}

export function getEmailSubject(
  type: "welcome" | "otp" | "passwordReset",
  data?: any
): string {
  switch (type) {
    case "welcome":
      return `Welcome to LMS Platform - Let's Get Started! 🎉`;
    case "otp":
      return "Verification Code - Action Required 🔑";
    case "passwordReset":
      return "Reset Your  Password - Action Required 🔐";
    default:
      return "LMS Platform Notification";
  }
}

export const emailTemplates = {
  welcome: generateWelcomeEmail,
  otp: generateOTPEmail,
  passwordReset: generatePasswordResetEmail,
  getSubject: getEmailSubject,
};
