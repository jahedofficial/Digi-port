'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Sun, 
  Moon,
  Zap,
  Globe,
  KeyRound,
  RotateCcw,
  Edit2,
  AlertCircle,
  Lock,
  ChevronRight,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { UserProfile } from '@/types';
import { DEMO_USERS } from '@/lib/auth-users';

interface AuthLoginViewProps {
  onLogin: (user: UserProfile) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const AuthLoginView: React.FC<AuthLoginViewProps> = ({
  onLogin,
  theme,
  onToggleTheme,
}) => {
  const isLight = theme === 'light';

  // Step: 'EMAIL_STEP' | 'OTP_STEP'
  const [step, setStep] = useState<'EMAIL_STEP' | 'OTP_STEP'>('EMAIL_STEP');
  const [email, setEmail] = useState('');
  const [activeUser, setActiveUser] = useState<typeof DEMO_USERS[0] | null>(null);

  // 6-digit OTP states
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  // Loading & error
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Refs for 6 OTP input boxes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer when OTP is sent
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'OTP_STEP' && countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      setIsResendDisabled(true);
    } else if (countdown === 0) {
      setIsResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  // Handle Send OTP
  const handleSendOtp = async (targetEmail?: string) => {
    const emailToUse = targetEmail || email;
    if (!emailToUse || !emailToUse.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SEND', email: emailToUse }),
      });
      const data = await res.json();

      if (data.success) {
        const matched = DEMO_USERS.find(u => u.email.toLowerCase() === emailToUse.toLowerCase());
        setActiveUser(matched || null);

        setStep('OTP_STEP');
        setCountdown(60);
        setOtpDigits(['', '', '', '', '', '']);
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      } else {
        setErrorMessage(data.error || 'Failed to send OTP code. Please try again.');
      }
    } catch {
      setErrorMessage('Network error: Unable to contact OTP server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP individual box input
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric
    const cleanVal = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);
    setErrorMessage('');

    // Advance focus
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto verify if all 6 digits entered
    if (cleanVal && index === 5 && newDigits.every(d => d !== '')) {
      const fullOtp = newDigits.join('');
      verifyOtpCode(fullOtp);
    }
  };

  // Handle Backspace navigation
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Paste of full OTP
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setOtpDigits(newDigits);

    if (pasted.length === 6) {
      verifyOtpCode(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  // Verify OTP submission
  const verifyOtpCode = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length < 6) {
      setErrorMessage('Please enter the complete 6-digit OTP code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'VERIFY', email, code }),
      });
      const data = await res.json();

      if (data.success) {
        const isJahed = email.toLowerCase().includes('jahed');
        const defaultName = isJahed ? 'Jahed Shomaddar' : (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1));
        const initials = isJahed ? 'JS' : defaultName.slice(0, 2).toUpperCase();

        onLogin({
          id: activeUser ? activeUser.id : `user_${Date.now()}`,
          name: activeUser ? activeUser.name : defaultName,
          email: email,
          role: 'SUPER_ADMIN',
          initials: activeUser ? activeUser.initials : initials,
          lastLoginAt: 'Just now',
        });
      } else {
        setErrorMessage(data.error || 'Invalid OTP code! Please check your email and try again.');
      }
    } catch {
      setErrorMessage('Network error: Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col justify-between transition-colors relative overflow-hidden ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#090d16] text-white'
    }`}>
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-cyan-500/20 via-indigo-600/20 to-purple-600/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] rounded-full bg-gradient-to-br from-purple-500/20 via-blue-600/20 to-emerald-500/20 blur-[130px] pointer-events-none" />

      {/* Main Authentication Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10 my-6">
        <div className="w-full max-w-xl mx-auto">
          {/* Email + OTP Input Container */}
          <div className={`rounded-2xl border p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative ${
            isLight 
              ? 'bg-white/95 border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.06)]' 
              : 'bg-[#101522]/95 border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
          }`}>
            {/* Header of Form */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
                    {step === 'EMAIL_STEP' ? <Mail className="h-4 w-4" /> : <KeyRound className="h-4 w-4 text-cyan-500" />}
                  </div>
                  <h2 className="text-xl font-bold">
                    {step === 'EMAIL_STEP' ? 'Sign In with Email' : 'OTP Verification'}
                  </h2>
                </div>
                <p className="text-xs text-slate-400">
                  {step === 'EMAIL_STEP' 
                    ? 'Enter your work email to receive a 6-digit OTP verification code.' 
                    : `We sent a 6-digit code to ${email}.`}
                </p>
              </div>

              {/* Theme Switcher Button */}
              <button
                type="button"
                onClick={onToggleTheme}
                className={`p-2 rounded-lg border transition-colors shrink-0 ${
                  isLight ? 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200' : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Toggle Light / Dark Mode"
              >
                {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-400" />}
              </button>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* ==============================================================
                STEP 1: EMAIL ADDRESS INPUT
               ============================================================== */}
            {step === 'EMAIL_STEP' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Email Form */}
                <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-slate-400">
                      Work Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="jahedshomadan@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full rounded-xl border pl-10 pr-3.5 py-3 text-xs outline-none transition-all ${
                          isLight 
                            ? 'border-slate-200 bg-white text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100' 
                            : 'border-slate-700 bg-[#0a0d14] text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold py-3 px-4 text-xs transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending OTP to your email...</span>
                      </>
                    ) : (
                      <>
                        <span>Send 6-Digit OTP Code</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ==============================================================
                STEP 2: 6-DIGIT OTP VERIFICATION INPUT
               ============================================================== */}
            {step === 'OTP_STEP' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Security Verification Notice */}
                <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                  isLight ? 'bg-indigo-50/70 border-indigo-100 text-indigo-950' : 'bg-[#101726] border-indigo-900/40 text-indigo-200'
                }`}>
                  <div className="h-9 w-9 rounded-lg bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      6-Digit Security Code Sent
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      We sent your OTP code to <strong className="text-indigo-500 font-mono">{email}</strong>
                    </div>
                  </div>
                </div>

                {/* Destination Email Info with Change button */}
                <div className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                  isLight ? 'border-slate-200 bg-slate-50' : 'border-[#1e2638] bg-[#0a0d14]'
                }`}>
                  <div className="flex items-center gap-2 truncate pr-2">
                    <Mail className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <span className="text-slate-400">Sent to:</span>
                    <strong className="truncate font-mono">{email}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setStep('EMAIL_STEP'); setErrorMessage(''); }}
                    className="text-[11px] text-indigo-500 hover:underline flex items-center gap-1 font-semibold shrink-0"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Change</span>
                  </button>
                </div>

                {/* 6 OTP Input Boxes */}
                <div>
                  <label className="block text-xs font-bold mb-2 text-slate-400 text-center">
                    Enter the 6-Digit Code
                  </label>
                  <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { inputRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className={`h-12 w-11 sm:h-14 sm:w-13 text-center text-xl font-mono font-black rounded-xl border outline-none transition-all ${
                          digit 
                            ? 'border-indigo-500 bg-indigo-50/30 text-indigo-600 dark:text-cyan-400 ring-2 ring-indigo-500/20' 
                            : isLight 
                              ? 'border-slate-200 bg-white text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100' 
                              : 'border-slate-700 bg-[#0a0d14] text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Submit Verification Button */}
                <button
                  type="button"
                  onClick={() => verifyOtpCode()}
                  disabled={isLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold py-3 px-4 text-xs transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying OTP & Launching Session...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Enter Command Center</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                {/* Resend OTP countdown */}
                <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
                  <button
                    type="button"
                    onClick={() => { setStep('EMAIL_STEP'); setErrorMessage(''); }}
                    className="hover:text-slate-200 hover:underline"
                  >
                    ← Back to Email
                  </button>

                  <div className="flex items-center gap-1.5">
                    {countdown > 0 ? (
                      <span className="font-mono text-[11px] text-slate-500">
                        Resend code in {countdown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        className="text-indigo-500 font-bold hover:underline flex items-center gap-1"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Resend OTP</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`px-6 sm:px-12 py-3.5 pl-14 sm:pl-12 border-t text-center text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md relative z-10 ${
        isLight ? 'border-slate-200/80 bg-white/70' : 'border-slate-800/80 bg-[#0c101b]/70'
      }`}>
        <div className="flex items-center gap-1.5">
          <span>Developed by</span>
          <a
            href="https://neexion.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-cyan-400 font-bold hover:underline transition-colors"
          >
            Neexion
          </a>
        </div>

        <div>
          © 2026 Digital Marketr Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
