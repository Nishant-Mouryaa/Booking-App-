"use client";

import type { Doctor, DoctorOverrides } from "../types/doctor.types";

interface FeeSummaryCardProps {
  mergedDoctor: Doctor & { availability: { days: string; hours: string } };
  overrides: DoctorOverrides;
  doctor: Doctor;
  isAvailable: boolean;
  onChange: <K extends keyof DoctorOverrides>(
    key: K,
    value: DoctorOverrides[K]
  ) => void;
}

export function FeeSummaryCard({
  mergedDoctor,
  overrides,
  doctor,
  isAvailable,
  onChange,
}: FeeSummaryCardProps) {
  return (
    <section className="dd-card">
      <div className="dd-card__header">
        <div>
          <div className="dd-card__title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 8V4m0 0a4 4 0 1 1 0 8m0-8a4 4 0 1 0 0 8m0 0v8"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <span>Consultation Fee & Summary</span>
          </div>
          <p className="dd-card__subtitle">
            Patients see this on every booking card and confirmation screen.
          </p>
        </div>
      </div>

      <div className="dd-card__body">
        <div className="dd-form-row">
          <label className="dd-label">
            <span>Consultation Fee (₹)</span>
          </label>
          <input
            type="number"
            className="dd-input"
            min={0}
            value={overrides.consultationFee ?? mergedDoctor.consultationFee}
            onChange={(e) =>
              onChange("consultationFee", Number(e.target.value) || 0)
            }
          />
          <div className="dd-help">
            This fee is reflected on the home doctor cards, appointment details
            and booking summary.
          </div>
        </div>

        <div className="dd-pill-row">
          <span className="dd-pill dd-pill--accent">
            Current timing: {overrides.timing ?? mergedDoctor.timing}
          </span>
          <span className="dd-pill">
            Availability: {mergedDoctor.availability.days},{" "}
            {mergedDoctor.availability.hours}
          </span>
          <span className="dd-pill">
            Patients booked so far: {(doctor as any).patients}
          </span>
          <span
            className={`dd-pill ${
              isAvailable ? "dd-pill--green" : "dd-pill--red"
            }`}
          >
            Status: {isAvailable ? "Available" : "Unavailable"}
          </span>
          <span className="dd-badge-small">
            Demo only — stored in localStorage
          </span>
        </div>
      </div>
    </section>
  );
}