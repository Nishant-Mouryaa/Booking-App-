"use client";

import React from "react";
import Logo from "./Logo";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="auth-layout">
      {/* Left branding panel — desktop only */}
      <div className="auth-branding">
        <div className="auth-branding-inner">
          <Logo variant="light" />

          <div className="auth-branding-content">
            <h1 className="auth-branding-title">
              Your Health, <br /> Our Priority
            </h1>
            <p className="auth-branding-desc">
              Book appointments with top-rated doctors near you. 
              Fast, easy, and completely secure.
            </p>

            <div className="auth-features">
              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="auth-feature-text-group">
                  <span className="auth-feature-label">500+ Verified Doctors</span>
                  <span className="auth-feature-sub">Qualified healthcare professionals</span>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="auth-feature-text-group">
                  <span className="auth-feature-label">Easy Online Booking</span>
                  <span className="auth-feature-sub">Book in just a few clicks</span>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="auth-feature-text-group">
                  <span className="auth-feature-label">Secure &amp; Private</span>
                  <span className="auth-feature-sub">Your health data is safe with us</span>
                </div>
              </div>
            </div>
          </div>

          <p className="auth-branding-footer">
            © 2025 Shedula. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-scroll">
          <div className="auth-form-wrapper">
            {/* Mobile-only logo */}
            <div className="auth-mobile-logo">
              <Logo variant="dark" />
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;