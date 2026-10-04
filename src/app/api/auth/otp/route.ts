import { NextRequest, NextResponse } from 'next/server';
import { sendOtpEmail, verifyStoredOtp } from '@/lib/email-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, code } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    // Action 1: Send OTP
    if (action === 'SEND') {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const result = await sendOtpEmail(email, generatedOtp);
      return NextResponse.json({
        success: result.success,
        message: result.message,
        isRealEmailSent: result.isRealEmailSent,
      });
    }

    // Action 2: Verify OTP
    if (action === 'VERIFY') {
      if (!code || typeof code !== 'string') {
        return NextResponse.json({ success: false, error: 'Code is required' }, { status: 400 });
      }

      const isValid = verifyStoredOtp(email, code);
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Invalid or expired OTP code' }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        message: 'OTP verified successfully',
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action. Use SEND or VERIFY.' }, { status: 400 });
  } catch (error: unknown) {
    console.error('OTP API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    }, { status: 500 });
  }
}
