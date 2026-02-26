"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import mockData from "@/data/mockData.json";

interface DoctorOTPVerificationProps {
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string;
  onBack: () => void;
}

const DoctorOTPVerification = ({
  doctorId,
  doctorName,
  doctorSpecialty,
  onBack,
}: DoctorOTPVerificationProps) => {
  const router = useRouter();

  // ✅ FIX: Determine correct OTP reliably
  // Check if doctorAuth exists in mockData, otherwise use testUser.otp
  const hasDoctorAuth = "doctorAuth" in (mockData as any);
  const CORRECT_OTP = hasDoctorAuth
    ? (mockData as any).doctorAuth.otp
    : mockData.testUser.otp;
  const OTP_LENGTH = hasDoctorAuth
    ? (mockData as any).doctorAuth.otpLength
    : mockData.settings.otpLength || 4;
  const OTP_EXPIRY = hasDoctorAuth
    ? (mockData as any).doctorAuth.otpExpirySeconds
    : mockData.settings.otpExpirySeconds || 60;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(OTP_EXPIRY);
  const [canResend, setCanResend] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false); // ✅ NEW
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

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    // ✅ Block input during redirect
    if (isRedirecting) return;

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

  const handlePaste = (e: React.ClipboardEvent) => {
    if (isRedirecting) return;
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
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

  const handleNumberClick = (num: string) => {
    if (isRedirecting) return;
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
    if (isRedirecting) return;
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
    if (isRedirecting) return;
    setActiveIndex(index);
    inputRefs.current[index]?.focus();
  };

  const handleVerify = useCallback(async () => {
    // ✅ Prevent double-calls
    if (isRedirecting || showSuccess) return;

    const otpValue = otp.join("");
    if (otpValue.length < OTP_LENGTH) {
      setError("Please enter complete OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // ✅ FIX: Log for debugging
      console.log("Entered OTP:", otpValue, "Expected:", CORRECT_OTP);

      if (otpValue === CORRECT_OTP) {
        // ✅ FIX: Set localStorage FIRST, before any state changes
        localStorage.setItem("doctorId", String(doctorId));
        localStorage.setItem("doctorLoggedInAt", new Date().toISOString());

        // ✅ Verify it was saved
        console.log(
          "doctorId saved:",
          localStorage.getItem("doctorId")
        );

        setShowSuccess(true);
        setIsRedirecting(true);
        setIsLoading(false); // ✅ Stop loading before redirect

        // ✅ FIX: Use replace instead of push to avoid back-button issues
        // Give the UI time to show success state
       setTimeout(() => {
  console.log("Redirecting to /doctor/dashboard...");
  router.replace("/doctor/dashboard");  // ✅ FIX: correct path
}, 1000);

        // ✅ Don't proceed to finally's setIsLoading(false)
        return;
      } else {
        setError(
          `Invalid OTP. Please try again. (Hint: ${CORRECT_OTP})`
        );
        setOtp(Array(OTP_LENGTH).fill(""));
        setActiveIndex(0);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError("Verification failed. Please try again.");
    }

    setIsLoading(false);
  }, [otp, OTP_LENGTH, CORRECT_OTP, doctorId, router, isRedirecting, showSuccess]);

  // Auto-verify when all digits entered
  useEffect(() => {
    if (
      otp.every((d) => d !== "") &&
      !isLoading &&
      !showSuccess &&
      !isRedirecting // ✅ Don't auto-verify during redirect
    ) {
      const timeout = setTimeout(() => handleVerify(), 400);
      return () => clearTimeout(timeout);
    }
  }, [otp, isLoading, showSuccess, isRedirecting, handleVerify]);

  const handleResend = async () => {
    if (!canResend || isRedirecting) return;
    setCanResend(false);
    setTimer(OTP_EXPIRY);
    setOtp(Array(OTP_LENGTH).fill(""));
    setActiveIndex(0);
    setError("");
    await new Promise((resolve) => setTimeout(resolve, 500));
    inputRefs.current[0]?.focus();
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return mins > 0
      ? `${mins}:${secs.toString().padStart(2, "0")}`
      : `${secs}s`;
  };

  return (
    <div className="otp-wrapper">
      {/* Header */}
      <div className="otp-top">
        <button
          onClick={onBack}
          className="otp-back-btn"
          aria-label="Go back"
          disabled={isRedirecting}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="otp-content">
        {/* Icon */}
        <div className="otp-icon-circle otp-icon-circle--doctor">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 4v16M4 12h16"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        <h1 className="otp-heading">Doctor Verification</h1>
        <p className="otp-subtext">
          Enter the {OTP_LENGTH}-digit code to sign in as
        </p>

        {/* Doctor Info Card */}
        <div className="otp-doctor-card">
          <div className="otp-doctor-card__avatar">
            {doctorName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="otp-doctor-card__info">
            <span className="otp-doctor-card__name">{doctorName}</span>
            <span className="otp-doctor-card__spec">
              {doctorSpecialty}
            </span>
          </div>
          <div className="otp-doctor-card__badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 12l2 2 4-4m6 2a10 10 0 11-20 0 10 10 0 0120 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* OTP Input Boxes */}
        <div className="otp-inputs-row">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onClick={() => handleInputClick(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              onChange={() => {}}
              disabled={isRedirecting}
              className={`otp-box ${
                activeIndex === index ? "otp-box-active" : ""
              } ${digit ? "otp-box-filled" : ""} ${
                error ? "otp-box-error" : ""
              } ${showSuccess ? "otp-box-success" : ""}`}
              aria-label={`OTP digit ${index + 1}`}
              autoComplete="one-time-code"
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="otp-error-msg">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M10 6v4m0 3v1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="otp-success-msg">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M7 10l2 2 4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Verified! Redirecting to dashboard...</span>
          </div>
        )}

        {/* Resend Timer */}
        <div className="otp-timer-row">
          {canResend ? (
            <button
              onClick={handleResend}
              className="otp-resend-btn"
              disabled={isRedirecting}
            >
              Resend code
            </button>
          ) : (
            <p className="otp-timer-text">
              Resend code in{" "}
              <span className="otp-timer-count">
                {formatTimer(timer)}
              </span>
            </p>
          )}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={
            isLoading ||
            otp.join("").length < OTP_LENGTH ||
            showSuccess ||
            isRedirecting
          }
          className={`btn btn-primary btn-full ${
            showSuccess ? "btn-success" : ""
          }`}
        >
          {isLoading ? (
            <span className="btn-loading">
              <span className="spinner" />
              Verifying...
            </span>
          ) : showSuccess ? (
            <span className="btn-loading">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M4 10l4 4 8-8"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Verified!
            </span>
          ) : (
            "Verify & Sign In"
          )}
        </button>

        {/* Hint for demo */}
        <p className="otp-hint">
          Demo OTP: <strong>{CORRECT_OTP}</strong>
        </p>
      </div>

      {/* Number Pad — mobile */}
      <div className="otp-numpad-mobile">
        <div className="numpad-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              className="numpad-btn"
              disabled={isLoading || isRedirecting}
              type="button"
            >
              {num}
            </button>
          ))}
          <div className="numpad-btn numpad-empty" />
          <button
            onClick={() => handleNumberClick("0")}
            className="numpad-btn"
            disabled={isLoading || isRedirecting}
            type="button"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="numpad-btn numpad-delete"
            disabled={isLoading || isRedirecting}
            type="button"
            aria-label="Delete"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2zM18 9l-6 6M12 9l6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorOTPVerification;