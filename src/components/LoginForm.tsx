"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import mockData from "@/data/mockData.json";

const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [touched, setTouched] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Auto-fill with mock data on component mount
  useEffect(() => {
    setEmail(mockData.testUser.email);
  }, []);

  // Email/phone validation
  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return "Email or mobile number is required";
    }
    
    // Check if it's a phone number (simple check for digits)
    const isPhone = /^\+?\d+$/.test(value.trim());
    
    if (isPhone) {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length < 10) {
        return "Please enter a valid mobile number";
      }
    } else {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) {
        return "Please enter a valid email address";
      }
    }
    
    return "";
  };

  // Real-time validation
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Check if user exists in mock data
      const isValidUser = 
        email === mockData.testUser.email || 
        email === mockData.testUser.mobile;

      if (isValidUser) {
        // Show success state
        setShowSuccess(true);

        // Determine phone number for OTP
        const phone = email.includes("@") ? mockData.testUser.mobile : email;
        
        // Store phone number for OTP screen
        localStorage.setItem("verificationPhone", phone);
        localStorage.setItem("userEmail", email);
        
        // Navigate to OTP page after short delay
        setTimeout(() => {
          router.push("/verify-otp");
        }, 1000);

      } else {
        setShowSuccess(false);
        setErrors({ 
          email: `User not found. Try: ${mockData.testUser.email} or ${mockData.testUser.mobile}` 
        });
      }

    } catch (error) {
      setShowSuccess(false);
      setErrors({ email: "Login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log("Google login clicked");
    // For demo: Social login bypasses OTP
    localStorage.setItem("userEmail", "google.user@example.com");
    localStorage.setItem("socialLogin", "google");
    router.push("/home");
  };

  const handleAppleLogin = () => {
    console.log("Apple login clicked");
    // For demo: Social login bypasses OTP
    localStorage.setItem("userEmail", "apple.user@example.com");
    localStorage.setItem("socialLogin", "apple");
    router.push("/home");
  };

  const handleInputBlur = () => {
    setTouched(true);
  };

  const handleInputFocus = () => {
    // Clear error when user focuses back
    if (errors.email) {
      setErrors({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form" noValidate>
      {/* Dev Helper - Shows mock credentials */}
      {/* <div className="dev-helper">
        <p>🔧 Test Credentials (Auto-filled)</p>
        <p><strong>Email:</strong> {mockData.testUser.email}</p>
        <p><strong>Mobile:</strong> {mockData.testUser.mobile}</p>
        <p><strong>OTP:</strong> {mockData.testUser.otp}</p>
      </div> */}

      {/* Header */}
      <div className="form-header">
        <h1 className="form-title">Login</h1>
        <p className="form-subtitle">Welcome back! Please enter your details.</p>
      </div>

      {/* Input with validation */}
      <div className="input-group">
        <label htmlFor="email" className="input-label">
          Mobile / Email
        </label>
        <div className="input-wrapper">
          <div className="input-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.5 6.66669L9.0755 11.0504C9.63533 11.4236 10.3647 11.4236 10.9245 11.0504L17.5 6.66669M4.16667 15.8334H15.8333C16.7538 15.8334 17.5 15.0872 17.5 14.1667V5.83335C17.5 4.91288 16.7538 4.16669 15.8333 4.16669H4.16667C3.24619 4.16669 2.5 4.91288 2.5 5.83335V14.1667C2.5 15.0872 3.24619 15.8334 4.16667 15.8334Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <input
            id="email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
            placeholder="Enter your email or mobile"
            className={`form-input ${errors.email ? 'form-input-error' : ''} ${showSuccess ? 'form-input-success' : ''}`}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {/* Validation icons */}
          {errors.email && (
            <div className="input-validation-icon error-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="#EF4444" strokeWidth="2"/>
                <path d="M10 6V10M10 13V14" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          )}
          {showSuccess && !errors.email && email && (
            <div className="input-validation-icon success-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="#10B981" strokeWidth="2"/>
                <path d="M7 10L9 12L13 8" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
        {/* Error message */}
        {errors.email && (
          <p id="email-error" className="input-error-message">
            {errors.email}
          </p>
        )}
      </div>

      {/* Remember / Forgot */}
      <div className="remember-forgot-row">
        <label className="remember-label">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="custom-checkbox"
            aria-label="Remember me"
          />
          <span className="remember-text">Remember Me</span>
        </label>

        <button 
          type="button" 
          className="forgot-button"
          onClick={() => alert("Password reset functionality would go here")}
        >
          Forgot Password?
        </button>
      </div>

      {/* Login Button */}
      <button 
        type="submit" 
        disabled={isLoading || showSuccess} 
        className={`login-button ${showSuccess ? 'login-button-success' : ''}`}
      >
        <span className="button-content">
          {isLoading ? (
            <>
              <div className="spinner" />
              <span>Logging in...</span>
            </>
          ) : showSuccess ? (
            <>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="success-check">
                <path d="M4 10L8 14L16 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Success!</span>
            </>
          ) : (
            "Login"
          )}
        </span>
      </button>

      {/* Divider */}
      <div className="divider">
        <div className="divider-line" />
        <span className="divider-text">Or continue with</span>
        <div className="divider-line" />
      </div>

      {/* Social Login Buttons */}
      <div className="social-buttons">
        <button 
          type="button" 
          onClick={handleGoogleLogin} 
          className="social-button google-button"
          disabled={isLoading}
        >
          <span className="social-icon">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </span>
          <span>Google</span>
        </button>

        <button 
          type="button" 
          className="social-button apple-button"
          disabled={isLoading}
          onClick={handleAppleLogin}
        >
          <span className="social-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
          </span>
          <span>Apple</span>
        </button>
      </div>

      {/* Spacer */}
      <div className="spacer" />

      {/* Sign Up Footer */}
      <div className="signup-footer">
        <span className="signup-text">
          Don&apos;t have an account?
        </span>
        <button 
          type="button" 
          className="signup-button"
          onClick={() => alert("Sign up page would go here")}
        >
          Sign Up
        </button>
      </div>
    </form>
  );
};

export default LoginForm;