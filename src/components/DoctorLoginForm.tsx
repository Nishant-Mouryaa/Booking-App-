"use client";

import { useState } from "react";
import mockData from "@/data/mockData.json";
import DoctorOTPVerification from "./DoctorOTPVerification";

interface DoctorOption {
  id: number;
  name: string;
  specialty: string;
}

const doctors: DoctorOption[] = mockData.doctors.map((d) => ({
  id: d.id,
  name: d.name,
  specialty: d.specialty,
}));

const DoctorLoginForm = () => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) return;
    setIsLoading(true);

    // Simulate sending OTP
    await new Promise((resolve) => setTimeout(resolve, 800));

    setIsLoading(false);
    setShowOTP(true);
  };

  const handleBackFromOTP = () => {
    setShowOTP(false);
  };

  // ✅ Show OTP screen after doctor selection
  if (showOTP && selectedDoctor) {
    return (
      <DoctorOTPVerification
        doctorId={selectedDoctor.id}
        doctorName={selectedDoctor.name}
        doctorSpecialty={selectedDoctor.specialty}
        onBack={handleBackFromOTP}
      />
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form-header">
        <h1 className="auth-form-title">Doctor Sign In</h1>
        <p className="auth-form-subtitle">
          Select your profile to manage appointments and settings
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="doctor" className="form-label">
          Choose Doctor Profile
        </label>
        <div className="form-input-wrapper">
          <span className="form-input-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="8"
                r="4"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M5 20C5 16.6863 7.68629 14 11 14H13C16.3137 14 19 16.6863 19 20"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <select
            id="doctor"
            className="form-input"
            value={selectedDoctorId}
            onChange={(e) =>
              setSelectedDoctorId(
                e.target.value ? Number(e.target.value) : ""
              )
            }
          >
            <option value="">Select a doctor</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} — {doc.specialty}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ✅ Show selected doctor preview */}
      {selectedDoctor && (
        <div className="doctor-preview">
          <div className="doctor-preview__avatar">
            {selectedDoctor.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="doctor-preview__info">
            <span className="doctor-preview__name">
              {selectedDoctor.name}
            </span>
            <span className="doctor-preview__spec">
              {selectedDoctor.specialty}
            </span>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!selectedDoctorId || isLoading}
        className="btn btn-primary btn-full"
      >
        {isLoading ? (
          <span className="btn-loading">
            <span className="spinner" />
            Sending OTP...
          </span>
        ) : (
          "Continue — Send OTP"
        )}
      </button>

      {/* ✅ OTP Hint */}
      {selectedDoctor && (
        <p className="auth-hint">
          A {(mockData as any).doctorAuth?.otpLength ?? 4}-digit verification
          code will be sent to the registered number.
        </p>
      )}
    </form>
  );
};

export default DoctorLoginForm;