"use client";

import type { Doctor, DoctorOverrides } from "../types/doctor.types";

interface ProfessionalInfoCardProps {
  mergedDoctor: Doctor & { availability: { days: string; hours: string } };
  overrides: DoctorOverrides;
  doctor: Doctor;
  isAvailable: boolean;
  onChange: <K extends keyof DoctorOverrides>(
    key: K,
    value: DoctorOverrides[K]
  ) => void;
}

export function ProfessionalInfoCard({
  mergedDoctor,
  overrides,
  doctor,
  isAvailable,
  onChange,
}: ProfessionalInfoCardProps) {
  const fields: {
    label: string;
    key: keyof DoctorOverrides;
    placeholder?: string;
    baseValue: string | number;
  }[] = [
    { label: "Name",               key: "name",          baseValue: mergedDoctor.name },
    { label: "Specialty",          key: "specialty",     baseValue: mergedDoctor.specialty },
    { label: "Qualification",      key: "qualification", baseValue: mergedDoctor.qualification },
    { label: "Experience (years)", key: "experience",    baseValue: mergedDoctor.experience },
    { label: "Location / Clinic",  key: "location",      baseValue: mergedDoctor.location ?? "", placeholder: "City, State" },
    { label: "Profile Image URL",  key: "image",         baseValue: overrides.image ?? "",       placeholder: "https://example.com/image.jpg" },
  ];

  return (
    <section className="dd-card">
      <div className="dd-card__header">
        <div>
          <div className="dd-card__title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="M5 20c0-3.314 2.686-6 6-6h2c3.314 0 6 2.686 6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <span>Professional Information</span>
          </div>
          <p className="dd-card__subtitle">
            Update details that patients see on the booking screen.
          </p>
        </div>
      </div>

      <div className="dd-card__body">
        <div className="dd-profile">
          <div>
            <div className="dd-profile__avatar">
              {(overrides.image || mergedDoctor.image) ? (
                <img
                  src={overrides.image || mergedDoctor.image}
                  alt={mergedDoctor.name}
                />
              ) : (
                mergedDoctor.name.split(" ").map((n) => n[0]).join("")
              )}
              <span
                className={`dd-profile__status-dot ${
                  isAvailable
                    ? "dd-profile__status-dot--online"
                    : "dd-profile__status-dot--offline"
                }`}
              />
            </div>
            <p className="dd-profile__avatar-badge">
              Paste an image URL to change the profile picture.
            </p>
          </div>

          <div className="dd-form-grid">
            {fields.map(({ label, key, placeholder, baseValue }) => (
              <div key={key} className="dd-form-row">
                <label className="dd-label">
                  <span>{label}</span>
                </label>
                <input
                  className="dd-input"
                  placeholder={placeholder}
                  value={(overrides[key] as string | undefined) ?? String(baseValue)}
                  onChange={(e) => onChange(key, e.target.value as DoctorOverrides[typeof key])}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="dd-form-row">
          <label className="dd-label">
            <span>About</span>
            <span>Shown on the doctor details page</span>
          </label>
          <textarea
            className="dd-textarea"
            value={overrides.about ?? (doctor as any).about ?? ""}
            onChange={(e) => onChange("about", e.target.value)}
          />
        </div>

        <div className="dd-chip-row">
          <span className="dd-chip">
            Patients see these updates immediately in the patient app.
          </span>
          <span className="dd-chip">Tip: keep it short and clear.</span>
        </div>
      </div>
    </section>
  );
}