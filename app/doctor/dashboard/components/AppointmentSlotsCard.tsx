"use client";

import { CalendarDayPicker } from "./CalendarDayPicker";
import { TimeRangePicker }   from "./TimeRangePicker";
import { generatePreviewSlots } from "../utils/timeUtils";
import type { Doctor, DoctorOverrides } from "../types/doctor.types";

const WEEK_DAY_NAMES = [
  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",
];

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
  const slotDuration = overrides.slotDurationMinutes ?? 30;
  const startTime    = overrides.defaultStartTime    ?? "09:00";
  const endTime      = overrides.defaultEndTime      ?? "17:00";
  const recurringDay = overrides.recurringDay         ?? "Friday";
  const selectedDates: string[] = overrides.selectedDates ?? [];

  const previewSlots = generatePreviewSlots(startTime, endTime, slotDuration);

  return (
    <section className="dd-card">
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
            Configure default timings used when patients book a visit.
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
                  ["Date Selection",   "Pick dates directly on the calendar"],
                  ["Time Setup",       "Start time, end time & slot length"],
                  ["Appointment Type", "Individual or group slots"],
                  ["Capacity",         "Max patients per slot"],
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

            {/* Calendar Day Picker — replaces old DayPicker tabs */}
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

            <div className="dd-help">
              These settings drive the slot grid on the patient booking page.
              In this demo they are stored in your browser only.
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer actions ── */}
      <div className="dd-footer-actions">
        <button
          type="button"
          className="dd-btn dd-btn--ghost"
          onClick={onReset}
        >
          Reset Changes
        </button>
        <button
          type="button"
          className="dd-btn dd-btn--primary"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save & Update Patient View"}
        </button>
      </div>
    </section>
  );
} 