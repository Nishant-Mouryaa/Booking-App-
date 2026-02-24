"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import mockData from "@/data/mockData.json";

const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [touched, setTouched] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Validation
  const validateEmail = (value: string) => {
    if (!value.trim()) return "Email or mobile number is required";
    const isPhone = /^\+?\d+$/.test(value.trim());
    if (isPhone) {
      if (value.replace(/\D/g, "").length < 10) return "Please enter a valid mobile number";
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Please enter a valid email address";
    }
    return "";
  };

  useEffect(() => {
    if (touched) {
      const error = validateEmail(email);
      setErrors(error ? { email: error } : {});
    }
  }, [email, touched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    const error = validateEmail(email);
    if (error) {
      setErrors({ email: error });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const isValidUser =
        email === mockData.testUser.email || email === mockData.testUser.mobile;

      if (isValidUser) {
        setShowSuccess(true);
        const phone = email.includes("@") ? mockData.testUser.mobile : email;
        localStorage.setItem("verificationPhone", phone);
        localStorage.setItem("userEmail", email);

        setTimeout(() => {
          router.push("/verify-otp");
        }, 800);
      } else {
        setErrors({
          email: "No account found with these credentials. Please try again or sign up.",
        });
      }
    } catch {
      setErrors({ email: "Login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    localStorage.setItem("userEmail", `${provider}.user@example.com`);
    localStorage.setItem("socialLogin", provider);
    router.push("/home");
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form" noValidate>
      {/* Header */}
      <div className="auth-form-header">
        <h1 className="auth-form-title">Welcome back</h1>
        <p className="auth-form-subtitle">
          Enter your credentials to access your account
        </p>
      </div>

      {/* Email / Mobile Input */}
      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email or Mobile Number
        </label>
        <div className={`form-input-wrapper ${errors.email ? "has-error" : ""} ${showSuccess ? "has-success" : ""}`}>
          <span className="form-input-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M2.5 6.667L9.075 11.05a2 2 0 002.85 0L17.5 6.667M4.167 15.833h11.666A1.667 1.667 0 0017.5 14.167V5.833a1.667 1.667 0 00-1.667-1.666H4.167A1.667 1.667 0 002.5 5.833v8.334a1.667 1.667 0 001.667 1.666z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <input
            id="email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            onFocus={() => errors.email && setErrors({})}
            placeholder="you@example.com or +91XXXXXXXXXX"
            className="form-input"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            autoComplete="email"
          />
          {errors.email && (
            <span className="form-input-status error">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M10 6v4m0 3v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
          )}
          {showSuccess && !errors.email && (
            <span className="form-input-status success">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          )}
        </div>
        {errors.email && (
          <p id="email-error" className="form-error">{errors.email}</p>
        )}
      </div>

      {/* Remember / Forgot */}
      <div className="form-row-between">
        <label className="form-checkbox-label">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="form-checkbox"
          />
          <span className="form-checkbox-custom" />
          <span>Remember me</span>
        </label>
        <button type="button" className="form-link-btn" onClick={() => alert("Forgot password flow")}>
          Forgot password?
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || showSuccess}
        className={`btn btn-primary btn-full ${showSuccess ? "btn-success" : ""}`}
      >
        {isLoading ? (
          <span className="btn-loading">
            <span className="spinner" />
            Signing in...
          </span>
        ) : showSuccess ? (
          <span className="btn-loading">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Success!
          </span>
        ) : (
          "Sign In"
        )}
      </button>

      {/* Divider */}
      <div className="form-divider">
        <span>Or continue with</span>
      </div>

      {/* Social Buttons */}
      <div className="social-buttons">
        <button
          type="button"
          className="btn btn-social"
          onClick={() => handleSocialLogin("google")}
          disabled={isLoading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09A6.97 6.97 0 015.49 12c0-.72.13-1.43.35-2.09V7.07H2.18A10.99 10.99 0 001 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>

        <button
          type="button"
          className="btn btn-social"
          onClick={() => handleSocialLogin("apple")}
          disabled={isLoading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          Apple
        </button>
      </div>

      {/* Footer */}
      <p className="auth-form-footer">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="form-link">
          Sign up
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;