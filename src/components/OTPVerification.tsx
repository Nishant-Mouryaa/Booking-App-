"use client";

import { useState, useRef, useEffect } from "react";
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

  const [otp, setOtp] = useState<string[]>(
    Array.from({ length: OTP_LENGTH }, () => "")
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(OTP_EXPIRY);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-fill OTP in development mode
  useEffect(() => {
    if (mockData.settings.autoFillOtp) {
      const mockOtp = mockData.testUser.otp.split("").slice(0, OTP_LENGTH);
      setOtp((prev) =>
        prev.map((_, index) => mockOtp[index] ?? "")
      );
      setActiveIndex(OTP_LENGTH - 1);
    }
  }, [OTP_LENGTH]);

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
    if (activeIndex >= 0) {
      const newOtp = [...otp];
      if (otp[activeIndex] === "" && activeIndex > 0) {
        newOtp[activeIndex - 1] = "";
        setActiveIndex(activeIndex - 1);
        inputRefs.current[activeIndex - 1]?.focus();
      } else {
        newOtp[activeIndex] = "";
        setOtp(newOtp);
      }
      setError("");
    }
  };

  const handleInputClick = (index: number) => {
    setActiveIndex(index);
    inputRefs.current[index]?.focus();
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");

    if (otpValue.length < OTP_LENGTH) {
      setError("Please enter complete OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Verify OTP
      if (otpValue === mockData.testUser.otp) {
        // Success - redirect to home
        router.push("/home");
      } else {
        setError("Invalid OTP. Please try again.");
        setOtp(Array.from({ length: OTP_LENGTH }, () => ""));
        setActiveIndex(0);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setCanResend(false);
    setTimer(OTP_EXPIRY);
    setOtp(Array.from({ length: OTP_LENGTH }, () => ""));
    setActiveIndex(0);
    setError("");

    // Simulate resend API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert(`OTP resent to ${phoneNumber}\nNew OTP: ${mockData.testUser.otp}`);
    
    // Auto-fill again if enabled
    if (mockData.settings.autoFillOtp) {
      const mockOtp = mockData.testUser.otp.split("").slice(0, OTP_LENGTH);
      setOtp((prev) =>
        prev.map((_, index) => mockOtp[index] ?? "")
      );
      setActiveIndex(OTP_LENGTH - 1);
    }
  };

  const maskPhoneNumber = (phone: string) => {
    if (phone.length <= 4) return phone;
    const visibleDigits = 2;
    const maskedPart = "*".repeat(phone.length - visibleDigits - 2);
    return phone.slice(0, visibleDigits) + " " + maskedPart + phone.slice(-2);
  };

  return (
    <div className="otp-container">
      {/* Header */}
      <div className="otp-header">
        <button onClick={onBack || (() => router.back())} className="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="otp-title">OTP Code Verification</h1>
      </div>

      {/* Message */}
      <div className="otp-message">
        <p>Code has been sent to {maskPhoneNumber(phoneNumber)}</p>
      </div>

      {/* OTP Input Boxes */}
      <div className="otp-inputs">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="none"
            value={digit}
            onClick={() => handleInputClick(index)}
            readOnly
            className={`otp-input ${activeIndex === index ? "otp-input-active" : ""} ${
              error ? "otp-input-error" : ""
            }`}
            aria-label={`OTP digit ${index + 1}`}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="otp-error">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="#EF4444" strokeWidth="2"/>
            <path d="M10 6V10M10 13V14" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Resend Timer */}
      <div className="otp-resend">
        {canResend ? (
          <button onClick={handleResend} className="resend-button">
            Resend code
          </button>
        ) : (
          <p>
            Resend code in <span className="timer-highlight">{timer}</span> s
          </p>
        )}
      </div>

      {/* Verify Button */}
      <button
        onClick={handleVerify}
        disabled={isLoading || otp.join("").length < 4}
        className="verify-button"
      >
        {isLoading ? (
          <span className="button-content">
            <div className="spinner" />
            <span>Verifying...</span>
          </span>
        ) : (
          "Verify"
        )}
      </button>

      {/* Number Pad */}
      <div className="number-pad">
        <div className="number-row">
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              className="number-button"
              disabled={isLoading}
            >
              {num}
            </button>
          ))}
        </div>
        <div className="number-row">
          {[4, 5, 6].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              className="number-button"
              disabled={isLoading}
            >
              {num}
            </button>
          ))}
        </div>
        <div className="number-row">
          {[7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              className="number-button"
              disabled={isLoading}
            >
              {num}
            </button>
          ))}
        </div>
        <div className="number-row">
          <button className="number-button number-button-special" disabled>
            *
          </button>
          <button
            onClick={() => handleNumberClick("0")}
            className="number-button"
            disabled={isLoading}
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="number-button number-button-delete"
            disabled={isLoading}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 7L15.5 11.5M15.5 11.5L20 16M15.5 11.5L11 16M15.5 11.5L11 7M9 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H9L14 12L9 5Z"
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

export default OTPVerification;