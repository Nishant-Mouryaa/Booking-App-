"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import mockData from "@/data/mockData.json";

interface OTPVerificationProps {
  phoneNumber: string;
  onBack?: () => void;
}

const OTPVerification = ({ phoneNumber, onBack }: OTPVerificationProps) => {
  const router = useRouter();
  const OTP_LENGTH = mockData.settings.otpLength || 4;
  const OTP_EXPIRY = mockData.settings.otpExpirySeconds || 60;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(OTP_EXPIRY);
  const [canResend, setCanResend] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Handle keyboard input (for desktop)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const newOtp = [...otp];

    if (e.key === "Backspace") {
      e.preventDefault();
      if (otp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = "";
        setOtp(newOtp);
        setActiveIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      }
      setError("");
      return;
    }

    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
      return;
    }

    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
      return;
    }

    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      newOtp[index] = e.key;
      setOtp(newOtp);
      setError("");
      if (index < OTP_LENGTH - 1) {
        setActiveIndex(index + 1);
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle paste (for desktop)
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (pasted) {
      const newOtp = Array(OTP_LENGTH).fill("");
      pasted.split("").forEach((char, i) => {
        newOtp[i] = char;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
      setActiveIndex(nextIndex);
      inputRefs.current[nextIndex]?.focus();
      setError("");
    }
  };

  // Handle number pad click (for mobile)
  const handleNumberClick = (num: string) => {
    if (activeIndex < OTP_LENGTH) {
      const newOtp = [...otp];
      newOtp[activeIndex] = num;
      setOtp(newOtp);
      setError("");
      if (activeIndex < OTP_LENGTH - 1) {
        setActiveIndex(activeIndex + 1);
        inputRefs.current[activeIndex + 1]?.focus();
      }
    }
  };

  const handleDelete = () => {
    const newOtp = [...otp];
    if (otp[activeIndex] === "" && activeIndex > 0) {
      newOtp[activeIndex - 1] = "";
      setOtp(newOtp);
      setActiveIndex(activeIndex - 1);
      inputRefs.current[activeIndex - 1]?.focus();
    } else {
      newOtp[activeIndex] = "";
      setOtp(newOtp);
    }
    setError("");
  };

  const handleInputClick = (index: number) => {
    setActiveIndex(index);
    inputRefs.current[index]?.focus();
  };

  const handleVerify = useCallback(async () => {
    const otpValue = otp.join("");
    if (otpValue.length < OTP_LENGTH) {
      setError("Please enter complete OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (otpValue === mockData.testUser.otp) {
        setShowSuccess(true);
        setTimeout(() => {
          router.push("/home");
        }, 800);
      } else {
        setError(`Invalid OTP. Please try again. (Hint: ${mockData.testUser.otp})`);
        setOtp(Array(OTP_LENGTH).fill(""));
        setActiveIndex(0);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [otp, OTP_LENGTH, router]);

  // Auto-verify when all digits entered
  useEffect(() => {
    if (otp.every((d) => d !== "") && !isLoading && !showSuccess) {
      // Small delay so user can see all digits filled
      const timeout = setTimeout(() => handleVerify(), 400);
      return () => clearTimeout(timeout);
    }
  }, [otp, isLoading, showSuccess, handleVerify]);

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setTimer(OTP_EXPIRY);
    setOtp(Array(OTP_LENGTH).fill(""));
    setActiveIndex(0);
    setError("");
    await new Promise((resolve) => setTimeout(resolve, 500));
    inputRefs.current[0]?.focus();
  };

  const maskPhoneNumber = (phone: string) => {
    if (phone.length <= 4) return phone;
    return phone.slice(0, 3) + " " + "*".repeat(Math.max(phone.length - 5, 4)) + " " + phone.slice(-2);
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${secs}s`;
  };

  return (
    <div className="otp-wrapper">
      {/* Header */}
      <div className="otp-top">
        <button
          onClick={onBack || (() => router.back())}
          className="otp-back-btn"
          aria-label="Go back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="otp-content">
        {/* Icon */}
        <div className="otp-icon-circle">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
          </svg>
        </div>

        <h1 className="otp-heading">Verify your identity</h1>
        <p className="otp-subtext">
          We&apos;ve sent a {OTP_LENGTH}-digit code to{" "}
          <strong>{maskPhoneNumber(phoneNumber)}</strong>
        </p>

        {/* OTP Input Boxes */}
        <div className="otp-inputs-row">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onClick={() => handleInputClick(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              onChange={() => {}} // controlled
              className={`otp-box ${activeIndex === index ? "otp-box-active" : ""} ${
                digit ? "otp-box-filled" : ""
              } ${error ? "otp-box-error" : ""} ${showSuccess ? "otp-box-success" : ""}`}
              aria-label={`OTP digit ${index + 1}`}
              autoComplete="one-time-code"
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="otp-error-msg">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M10 6v4m0 3v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="otp-success-msg">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Verified successfully! Redirecting...</span>
          </div>
        )}

        {/* Resend Timer */}
        <div className="otp-timer-row">
          {canResend ? (
            <button onClick={handleResend} className="otp-resend-btn">
              Resend code
            </button>
          ) : (
            <p className="otp-timer-text">
              Resend code in <span className="otp-timer-count">{formatTimer(timer)}</span>
            </p>
          )}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={isLoading || otp.join("").length < OTP_LENGTH || showSuccess}
          className={`btn btn-primary btn-full ${showSuccess ? "btn-success" : ""}`}
        >
          {isLoading ? (
            <span className="btn-loading">
              <span className="spinner" />
              Verifying...
            </span>
          ) : showSuccess ? (
            <span className="btn-loading">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Verified!
            </span>
          ) : (
            "Verify"
          )}
        </button>
      </div>

      {/* Number Pad — shown on mobile only */}
      <div className="otp-numpad-mobile">
        <div className="numpad-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              className="numpad-btn"
              disabled={isLoading}
              type="button"
            >
              {num}
            </button>
          ))}
          <div className="numpad-btn numpad-empty" />
          <button
            onClick={() => handleNumberClick("0")}
            className="numpad-btn"
            disabled={isLoading}
            type="button"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="numpad-btn numpad-delete"
            disabled={isLoading}
            type="button"
            aria-label="Delete"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2zM18 9l-6 6M12 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;