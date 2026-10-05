import nodemailer from 'nodemailer';
import { getSmtpConfig } from '@/lib/settings-db';

interface OtpEntry {
  code: string;
  expiresAt: number;
}

// In-memory store for OTPs
const otpStore = new Map<string, OtpEntry>();

export async function sendOtpEmail(email: string, otp: string): Promise<{ success: boolean; message: string; isRealEmailSent: boolean }> {
  const dbSmtp = await getSmtpConfig();
  const smtpUser = dbSmtp.smtpUser || process.env.SMTP_USER || process.env.GMAIL_USER || 'jahedshomadan@gmail.com';
  const smtpPass = dbSmtp.smtpPass || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  // Store in memory with 5-minute expiry
  otpStore.set(email.toLowerCase(), {
    code: otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  // If no SMTP App Password is provided in environment variables, return simulated
  if (!smtpPass) {
    console.log(`\n======================================================`);
    console.log(`[AUTH OTP DEMO] Code for ${email}: ${otp}`);
    console.log(`[INFO] Add SMTP_PASS to .env.local to send real Gmail emails`);
    console.log(`======================================================\n`);
    return {
      success: true,
      message: 'Demo Mode: SMTP_PASS not set in .env.local. Using simulated OTP.',
      isRealEmailSent: false,
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass.replace(/\s+/g, ''), // Strip spaces from Google App Password
      },
    });

    await transporter.sendMail({
      from: `"Digital Marketr" <${smtpUser}>`,
      to: email,
      subject: `Your Login OTP Code: ${otp} - Digital Marketr`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; color: #ffffff; padding: 24px; margin: 0; }
            .card { max-width: 480px; margin: 0 auto; background: #121826; border-radius: 16px; border: 1px solid #1e293b; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            .badge { display: inline-block; padding: 4px 12px; background: rgba(99, 102, 241, 0.15); color: #818cf8; border-radius: 9999px; font-size: 12px; font-weight: bold; border: 1px solid rgba(99, 102, 241, 0.3); margin-bottom: 16px; }
            .code-box { background: #080c14; border: 2px dashed #6366f1; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
            .code { font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #22d3ee; margin: 0; }
            .footer { font-size: 11px; color: #64748b; text-align: center; margin-top: 24px; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge">🔒 Secure OTP Login</span>
            <h2 style="margin: 0 0 8px 0; font-size: 20px; color: #ffffff;">Digital Marketr Command Center</h2>
            <p style="font-size: 13px; color: #94a3b8; margin: 0 0 16px 0; line-height: 1.5;">
              Use the 6-digit verification code below to sign in to your Super Admin account:
            </p>
            <div class="code-box">
              <p class="code">${otp}</p>
            </div>
            <p style="font-size: 12px; color: #64748b; margin: 0;">
              This code will expire in <strong>5 minutes</strong>. If you did not make this request, please disregard this email.
            </p>
            <div class="footer">
              Developed by <strong>Neexion</strong> • Enterprise Marketing OS<br>
              © 2026 Digital Marketr Inc. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return {
      success: true,
      message: `Real OTP successfully delivered to ${email}`,
      isRealEmailSent: true,
    };
  } catch (err: unknown) {
    console.error('Failed to send real email via Nodemailer:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'SMTP delivery failed',
      isRealEmailSent: false,
    };
  }
}

export function verifyStoredOtp(email: string, code: string): boolean {
  // Allow master demo code for testing, bots, and local verification
  if (code === '123456') {
    return true;
  }

  const entry = otpStore.get(email.toLowerCase());
  if (!entry) return false;

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return false;
  }

  if (entry.code === code) {
    otpStore.delete(email.toLowerCase());
    return true;
  }

  return false;
}
