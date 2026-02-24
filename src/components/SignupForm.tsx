"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FormData {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  mobile?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

const SignupForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Password strength
  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "#EF4444", "#F59E0B", "#3B82F6", "#10B981"];
  const passwordStrength = getPasswordStrength(formData.password);

  // Validation
  const validate = (): FormErrors => {
    const errs: FormErrors = {};

    if (!formData.fullName.trim()) errs.fullName = "Full name is required";
    else if (formData.fullName.trim().length < 2) errs.fullName = "Name must be at least 2 characters";

    if (!formData.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
      errs.email = "Please enter a valid email address";

    if (!formData.mobile.trim()) errs.mobile = "Mobile number is required";
    else if (formData.mobile.replace(/\D/g, "").length < 10)
      errs.mobile = "Please enter a valid mobile number";

    if (!formData.password) errs.password = "Password is required";
    else if (formData.password.length < 8) errs.password = "Password must be at least 8 characters";

    if (!formData.confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      errs.confirmPassword = "Passwords do not match";

    if (!agreeToTerms) errs.terms = "You must agree to the terms";

    return errs;
  };

  // Real-time validation for touched fields
  useEffect(() => {
    const newErrors: FormErrors = {};
    const fullErrors = validate();
    Object.keys(touched).forEach((key) => {
      if (touched[key] && fullErrors[key as keyof FormErrors]) {
        newErrors[key as keyof FormErrors] = fullErrors[key as keyof FormErrors];
      }
    });
    setErrors(newErrors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, agreeToTerms, touched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Touch all fields
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach((k) => (allTouched[k] = true));
    allTouched.terms = true;
    setTouched(allTouched);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setShowSuccess(true);
      localStorage.setItem("verificationPhone", formData.mobile);
      localStorage.setItem("userEmail", formData.email);
      localStorage.setItem("userName", formData.fullName);

      setTimeout(() => {
        router.push("/verify-otp");
      }, 800);
    } catch {
      setErrors({ email: "Signup failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = (provider: string) => {
    localStorage.setItem("userEmail", `${provider}.user@example.com`);
    localStorage.setItem("socialLogin", provider);
    router.push("/home");
  };

  const renderField = (
    field: keyof FormData,
    label: string,
    placeholder: string,
    type: string = "text",
    icon: React.ReactNode
  ) => {
    const isPasswordField = field === "password" || field === "confirmPassword";
    const showPwd = field === "password" ? showPassword : showConfirmPassword;
    const togglePwd = field === "password" ? setShowPassword : setShowConfirmPassword;

    return (
      <div className="form-group" key={field}>
        <label htmlFor={field} className="form-label">{label}</label>
        <div className={`form-input-wrapper ${errors[field] && touched[field] ? "has-error" : ""}`}>
          <span className="form-input-icon">{icon}</span>
          <input
            id={field}
            type={isPasswordField ? (showPwd ? "text" : "password") : type}
            value={formData[field]}
            onChange={(e) => handleChange(field, e.target.value)}
            onBlur={() => handleBlur(field)}
            onFocus={() => {
              if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
            }}
            placeholder={placeholder}
            className="form-input"
            autoComplete={
              field === "email" ? "email" : 
              field === "fullName" ? "name" : 
              field === "mobile" ? "tel" : 
              field === "password" ? "new-password" : "new-password"
            }
          />
          {isPasswordField && (
            <button
              type="button"
              className="form-input-toggle"
              onClick={() => togglePwd(!showPwd)}
              tabIndex={-1}
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
            </button>
          )}
        </div>
        {/* Password strength bar */}
        {field === "password" && formData.password && (
          <div className="password-strength">
            <div className="password-strength-bars">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className="password-strength-bar"
                  style={{
                    backgroundColor: passwordStrength >= level ? strengthColors[passwordStrength] : "#E5E7EB",
                  }}
                />
              ))}
            </div>
            <span className="password-strength-label" style={{ color: strengthColors[passwordStrength] }}>
              {strengthLabels[passwordStrength]}
            </span>
          </div>
        )}
        {errors[field] && touched[field] && (
          <p className="form-error">{errors[field]}</p>
        )}
      </div>
    );
  };

  // Icons
  const userIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  const emailIcon = (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M2.5 6.667L9.075 11.05a2 2 0 002.85 0L17.5 6.667M4.167 15.833h11.666A1.667 1.667 0 0017.5 14.167V5.833a1.667 1.667 0 00-1.667-1.666H4.167A1.667 1.667 0 002.5 5.833v8.334a1.667 1.667 0 001.667 1.666z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  const phoneIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  const lockIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );

  return (
    <form onSubmit={handleSubmit} className="auth-form" noValidate>
      <div className="auth-form-header">
        <h1 className="auth-form-title">Create account</h1>
        <p className="auth-form-subtitle">Fill in your details to get started</p>
      </div>

      {renderField("fullName", "Full Name", "John Doe", "text", userIcon)}
      {renderField("email", "Email Address", "you@example.com", "email", emailIcon)}
      {renderField("mobile", "Mobile Number", "+91 XXXXXXXXXX", "tel", phoneIcon)}
      {renderField("password", "Password", "Min. 8 characters", "password", lockIcon)}
      {renderField("confirmPassword", "Confirm Password", "Re-enter your password", "password", lockIcon)}

      {/* Terms */}
      <div className="form-group">
        <label className="form-checkbox-label">
          <input
            type="checkbox"
            checked={agreeToTerms}
            onChange={(e) => {
              setAgreeToTerms(e.target.checked);
              setTouched((prev) => ({ ...prev, terms: true }));
            }}
            className="form-checkbox"
          />
          <span className="form-checkbox-custom" />
          <span>
            I agree to the{" "}
            <button type="button" className="form-link inline" onClick={() => alert("Terms & Conditions")}>
              Terms of Service
            </button>{" "}
            and{" "}
            <button type="button" className="form-link inline" onClick={() => alert("Privacy Policy")}>
              Privacy Policy
            </button>
          </span>
        </label>
        {errors.terms && touched.terms && (
          <p className="form-error">{errors.terms}</p>
        )}
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
            Creating account...
          </span>
        ) : showSuccess ? (
          <span className="btn-loading">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Account created!
          </span>
        ) : (
          "Create Account"
        )}
      </button>

      {/* Divider */}
      <div className="form-divider">
        <span>Or sign up with</span>
      </div>

      {/* Social */}
      <div className="social-buttons">
        <button type="button" className="btn btn-social" onClick={() => handleSocialSignup("google")} disabled={isLoading}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09A6.97 6.97 0 015.49 12c0-.72.13-1.43.35-2.09V7.07H2.18A10.99 10.99 0 001 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>

        <button type="button" className="btn btn-social" onClick={() => handleSocialSignup("apple")} disabled={isLoading}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          Apple
        </button>
      </div>

      {/* Footer */}
      <p className="auth-form-footer">
        Already have an account?{" "}
        <Link href="/login" className="form-link">
          Sign in
        </Link>
      </p>
    </form>
  );
};

export default SignupForm;