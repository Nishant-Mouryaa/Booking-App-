"use client";

import { CalendarDayPicker } from "./CalendarDayPicker";
import { TimeRangePicker } from "./TimeRangePicker";
import { generatePreviewSlots } from "../utils/timeUtils";
import type { Doctor, DoctorOverrides } from "../types/doctor.types";
import { useState, useEffect } from "react";

const WEEK_DAY_NAMES = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
];

// Custom Toast Component
function Toast({ message, type = "success", onClose }: { 
  message: string; 
  type?: "success" | "error" | "info" | "warning";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Slightly longer for better readability

    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: (
      <svg className="dd-toast-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6 10L9 13L14 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    error: (
      <svg className="dd-toast-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 13L13 7M7 7L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    info: (
      <svg className="dd-toast-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 7V10M10 13H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    warning: (
      <svg className="dd-toast-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 4L2 16H18L10 4Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <circle cx="10" cy="13" r="1" fill="currentColor"/>
        <path d="M10 8V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  };

  return (
    <div className={`dd-toast dd-toast--${type}`}>
      <div className="dd-toast__content">
        {icons[type]}
        <span className="dd-toast__message">{message}</span>
      </div>
      <button className="dd-toast__close" onClick={onClose}>×</button>
    </div>
  );
}

interface AppointmentSlotsCardProps {
  mergedDoctor: Doctor & { availability: { days: string; hours: string } };
  overrides: DoctorOverrides;
  saving: boolean;
  onChange: <K extends keyof DoctorOverrides>(
    key: K,
    value: DoctorOverrides[K]
  ) => void;
  onSave: () => void;
  onReset: () => void;
}

export function AppointmentSlotsCard({
  mergedDoctor,
  overrides,
  saving,
  onChange,
  onSave,
  onReset,
}: AppointmentSlotsCardProps) {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" | "warning" } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const slotDuration = overrides.slotDurationMinutes ?? 30;
  const startTime = overrides.defaultStartTime ?? "09:00";
  const endTime = overrides.defaultEndTime ?? "17:00";
  const recurringDay = overrides.recurringDay ?? "Friday";
  const selectedDates: string[] = overrides.selectedDates ?? [];

  const previewSlots = generatePreviewSlots(startTime, endTime, slotDuration);

  const validateSettings = (): boolean => {
    const errors: string[] = [];
    
    if (startTime >= endTime) {
      errors.push("End time must be after start time");
    }
    
    if (slotDuration < 10 || slotDuration > 120) {
      errors.push("Slot duration must be between 10 and 120 minutes");
    }
    
    if (selectedDates.length === 0) {
      errors.push("Please select at least one availability date");
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = async () => {
    if (!validateSettings()) {
      setToast({
        message: "Please fix the validation errors before saving",
        type: "warning"
      });
      return;
    }

    try {
      await onSave();
      setToast({
        message: "Appointment settings have been updated successfully",
        type: "success"
      });
    } catch (error) {
      setToast({
        message: "Unable to save changes. Please try again.",
        type: "error"
      });
    }
  };

  const handleReset = () => {
    onReset();
    setValidationErrors([]);
    setToast({
      message: "All settings have been restored to their default values",
      type: "info"
    });
  };

  return (
    <section className="dd-card">
      {/* Toast Container */}
      {toast && (
        <div className="dd-toast-container">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="dd-validation-errors">
          <div className="dd-validation-errors__title">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="#ef4444" strokeWidth="1.5"/>
              <path d="M8 4V8M8 11H8.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Please fix the following:
          </div>
          <ul className="dd-validation-errors__list">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Card header ── */}
      <div className="dd-card__header">
        <div>
          <div className="dd-card__title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2"
                stroke="currentColor" strokeWidth="1.8" />
              <path d="M16 2v4M8 2v4M3 10h18"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span>Appointment Slots</span>
          </div>
          <p className="dd-card__subtitle">
            Configure appointment settings and availability for patients
          </p>
        </div>
      </div>

      <div className="dd-card__body">
        <div className="dd-slots-layout">

          {/* ── LEFT: Slot configuration ── */}
          <div>
            <div className="dd-quick-guide">
              <div className="dd-quick-guide__title">Quick Setup Guide</div>
              <div className="dd-quick-guide__grid">
                {[
                  ["Date Selection", "Pick dates directly on the calendar"],
                  ["Time Setup", "Start time, end time & slot length"],
                  ["Appointment Type", "Individual or group slots"],
                  ["Capacity", "Max patients per slot"],
                ].map(([title, desc]) => (
                  <div key={title} className="dd-quick-guide__item">
                    <span>{title}</span>
                    <span>{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dd-slots-grid">
              <div className="dd-form-row">
                <label className="dd-label"><span>Default Start Time</span></label>
                <input
                  type="time"
                  className="dd-input"
                  value={startTime}
                  onChange={(e) => onChange("defaultStartTime", e.target.value)}
                />
              </div>

              <div className="dd-form-row">
                <label className="dd-label"><span>Default End Time</span></label>
                <input
                  type="time"
                  className="dd-input"
                  value={endTime}
                  onChange={(e) => onChange("defaultEndTime", e.target.value)}
                />
              </div>

              <div className="dd-form-row">
                <label className="dd-label"><span>Slot Duration (mins)</span></label>
                <input
                  type="number"
                  className="dd-input"
                  min={10}
                  max={120}
                  value={slotDuration}
                  onChange={(e) =>
                    onChange("slotDurationMinutes", Number(e.target.value) || 30)
                  }
                />
              </div>

              <div className="dd-form-row">
                <label className="dd-label"><span>Appointment Type</span></label>
                <select
                  className="dd-select"
                  value={overrides.appointmentType ?? "individual"}
                  onChange={(e) =>
                    onChange(
                      "appointmentType",
                      e.target.value as "individual" | "group"
                    )
                  }
                >
                  <option value="individual">Individual</option>
                  <option value="group">Group (multiple per slot)</option>
                </select>
              </div>

              <div className="dd-form-row">
                <label className="dd-label"><span>Max Patients / Slot</span></label>
                <input
                  type="number"
                  className="dd-input"
                  min={1}
                  max={20}
                  value={overrides.maxPatientsPerSlot ?? 1}
                  onChange={(e) =>
                    onChange("maxPatientsPerSlot", Number(e.target.value) || 1)
                  }
                />
              </div>

              <div className="dd-form-row">
                <label className="dd-label"><span>Recurring Day</span></label>
                <select
                  className="dd-select"
                  value={recurringDay}
                  onChange={(e) => onChange("recurringDay", e.target.value)}
                >
                  {WEEK_DAY_NAMES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Patient-visible availability ── */}
          <div>

            {/* Calendar Day Picker */}
            <div className="dd-form-row">
              <label className="dd-label">
                <span>Availability Dates</span>
                <span>Select the dates patients can book appointments</span>
              </label>

              <CalendarDayPicker
                value={selectedDates}
                onChange={(dates) => onChange("selectedDates", dates)}
              />

              {/* Patient-facing summary */}
              {selectedDates.length > 0 && (
                <div className="trp-summary" style={{ marginTop: 8 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2"
                      stroke="currentColor" strokeWidth="1.6" />
                    <path d="M16 2v4M8 2v4M3 10h18"
                      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <span>
                    Patients can book on{" "}
                    <strong>{selectedDates.length} selected date{selectedDates.length > 1 ? "s" : ""}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Time Range Picker */}
            <div className="dd-form-row" style={{ marginTop: 16 }}>
              <label className="dd-label">
                <span>Availability Hours</span>
                <span>Set hours displayed to patients</span>
              </label>
              <TimeRangePicker
                value={overrides.availabilityHours ?? mergedDoctor.availability.hours}
                onChange={(v) => onChange("availabilityHours", v)}
              />
            </div>

            {/* Slot preview */}
            <div className="dd-slot-preview">
              <div>
                Preview for <strong>{recurringDay}</strong>
              </div>
              <div className="dd-slot-preview__chips">
                {previewSlots.length > 0 ? (
                  previewSlots.map((s) => (
                    <span key={s} className="dd-slot-chip">{s}</span>
                  ))
                ) : (
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>
                    Adjust start / end time or duration to generate slots.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer actions ── */}
      <div className="dd-footer-actions">
        <button
          type="button"
          className="dd-btn dd-btn--ghost"
          onClick={handleReset}
        >
          Reset Changes
        </button>
        <button
          type="button"
          className="dd-btn dd-btn--primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </section>
  );
}