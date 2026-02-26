"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import mockData from "@/data/mockData.json";
import "../dashboard.css";


interface Doctor {
  id: number;
  name: string;
  specialty: string;
  qualification: string;
  experience: string;
  location?: string;
  image: string;
  rating: number;
  reviews: number;
  consultationFee: number;
  timing: string;
  available: boolean;
  availability: {
    days: string;
    hours: string;
  };
}

interface DoctorOverrides {
  name?: string;
  specialty?: string;
  qualification?: string;
  experience?: string;
  location?: string;
  image?: string;
  about?: string;
  consultationFee?: number;
  timing?: string;
  available?: boolean;                          // ✅ NEW
  availabilityDays?: string;
  availabilityHours?: string;
  contactEmail?: string;
  contactPhone?: string;
  appointmentType?: "individual" | "group";
  slotDurationMinutes?: number;
  maxPatientsPerSlot?: number;
  defaultStartTime?: string;
  defaultEndTime?: string;
  recurringDay?: string;
}

type OverridesStore = Record<number, DoctorOverrides>;

const loadOverrides = (): OverridesStore => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("doctorOverrides");
    return raw ? (JSON.parse(raw) as OverridesStore) : {};
  } catch {
    return {};
  }
};

const saveOverrides = (data: OverridesStore) => {
  try {
    localStorage.setItem("doctorOverrides", JSON.stringify(data));
  } catch {
    // ignore
  }
};

export default function DoctorDashboardPage() {
  const router = useRouter();
const [doctor, setDoctor] = useState<Doctor | null>(null);
const [overrides, setOverrides] = useState<DoctorOverrides>({});
const [saving, setSaving] = useState(false);
const [authChecked, setAuthChecked] = useState(false);
const [doctorIdState, setDoctorId] = useState<number | null>(null);

const doctorId = useMemo(() => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("doctorId");
  return raw ? Number(raw) : null;
}, []);

useEffect(() => {
  setAuthChecked(true);
}, [router]);

useEffect(() => {
  if (!authChecked) return;
  if (!doctorId) return;

  const base = (mockData.doctors as Doctor[]).find(
    (d) => d.id === doctorId
  );
  if (!base) {
    router.replace("/doctor/login");
    return;
  }
  setDoctor(base);

  const store = loadOverrides();
  setOverrides(store[doctorId] || {});
}, [doctorId, authChecked, router]);


  const mergedDoctor = useMemo(() => {
    if (!doctor) return null;
    return {
      ...doctor,
      name: overrides.name ?? doctor.name,
      specialty: overrides.specialty ?? doctor.specialty,
      qualification: overrides.qualification ?? doctor.qualification,
      experience: overrides.experience ?? doctor.experience,
      consultationFee: overrides.consultationFee ?? doctor.consultationFee,
      timing: overrides.timing ?? doctor.timing,
      available: overrides.available ?? doctor.available,    // ✅ NEW
      availability: {
        days: overrides.availabilityDays ?? doctor.availability.days,
        hours: overrides.availabilityHours ?? doctor.availability.hours,
      },
    };
  }, [doctor, overrides]);

  // ✅ NEW: Computed availability status
  const isAvailable = mergedDoctor?.available ?? true;

  const handleFieldChange = <K extends keyof DoctorOverrides>(
    key: K,
    value: DoctorOverrides[K]
  ) => {
    setOverrides((prev) => ({ ...prev, [key]: value }));
  };

  // ✅ NEW: Toggle availability with instant save
  const handleAvailabilityToggle = async () => {
    if (!doctor || !doctorId) return;
    const newValue = !isAvailable;
    const updatedOverrides = { ...overrides, available: newValue };
    setOverrides(updatedOverrides);

    // Instant save so it reflects immediately on patient app
    const store = loadOverrides();
    const next: OverridesStore = { ...store, [doctorId]: updatedOverrides };
    saveOverrides(next);
  };

  const handleSave = async () => {
    if (!doctor || !doctorId) return;
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    const store = loadOverrides();
    const next: OverridesStore = { ...store, [doctorId]: overrides };
    saveOverrides(next);
    setSaving(false);
    alert("Profile and appointment settings saved for this doctor.");
  };

  const handleLogout = () => {
    localStorage.removeItem("doctorId");
    router.push("/doctor/login");
  };

  if (!mergedDoctor) {
    return (
      <div className="dd">
        <div className="dd-main">
          <div style={{ padding: "40px 24px", fontSize: 14, color: "#6b7280" }}>
            Loading doctor dashboard...
          </div>
        </div>
      </div>
    );
  }

  const slotDuration = overrides.slotDurationMinutes ?? 30;
  const startTime = overrides.defaultStartTime ?? "09:00";
  const endTime = overrides.defaultEndTime ?? "17:00";
  const recurringDay = overrides.recurringDay ?? "Friday";

  const generatePreviewSlots = () => {
    const result: string[] = [];
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    let current = sh * 60 + sm;
    const end = eh * 60 + em;
    let count = 0;
    while (current < end && count < 8) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      result.push(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
      );
      current += slotDuration;
      count += 1;
    }
    return result;
  };

  const previewSlots = generatePreviewSlots();

  return (
    <div className="dd">
      {/* Sidebar */}
      <aside className="dd-sidebar">
        <div className="dd-sidebar__head">
          <div className="dd-sidebar__brand">
            <div className="dd-sidebar__logo">
              <span>Sh</span>
            </div>
            <div className="dd-sidebar__title">
              <span className="dd-sidebar__title-main">Shedula Health</span>
              <span className="dd-sidebar__title-sub">Doctor Console</span>
            </div>
          </div>
        </div>

        <nav className="dd-sidebar__nav">
          <button className="dd-sidebar__link dd-sidebar__link--active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
              <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span>Profile</span>
          </button>
          <button className="dd-sidebar__link" onClick={() => router.push("/appointments")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>My Appointments</span>
          </button>
        </nav>

        <div className="dd-sidebar__user">
          <div className="dd-sidebar__user-main">
            <div className="dd-sidebar__avatar">
              {mergedDoctor.image ? (
                <img src={mergedDoctor.image} alt={mergedDoctor.name} />
              ) : (
                mergedDoctor.name.split(" ").map((n) => n[0]).join("")
              )}
            </div>
            <div className="dd-sidebar__user-info">
              <span className="dd-sidebar__user-name">{mergedDoctor.name}</span>
              <span className="dd-sidebar__user-role">Doctor</span>
            </div>
          </div>
          <button className="dd-sidebar__logout" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="dd-main">
        <header className="dd-topbar">
          <div className="dd-topbar__left">
            <span className="dd-topbar__subtitle">Profile</span>
            <h1 className="dd-topbar__title">Professional Information</h1>
          </div>
          <div className="dd-topbar__right">
            {/* ✅ NEW: Availability Toggle in top bar */}
            <div
              className={`dd-availability-toggle ${
                isAvailable
                  ? "dd-availability-toggle--online"
                  : "dd-availability-toggle--offline"
              }`}
            >
              <div className="dd-availability-toggle__info">
                <span className="dd-availability-toggle__dot" />
                <span className="dd-availability-toggle__label">
                  {isAvailable ? "Available for Patients" : "Currently Unavailable"}
                </span>
              </div>
              <button
                className={`dd-toggle ${isAvailable ? "dd-toggle--on" : "dd-toggle--off"}`}
                onClick={handleAvailabilityToggle}
                role="switch"
                aria-checked={isAvailable}
                aria-label="Toggle availability"
              >
                <span className="dd-toggle__track">
                  <span className="dd-toggle__thumb" />
                </span>
              </button>
            </div>
          </div>
        </header>

        <div className="dd-main-scroll">
          {/* ✅ NEW: Unavailability Banner */}
          {!isAvailable && (
            <div className="dd-unavailable-banner">
              <div className="dd-unavailable-banner__content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <div>
                  <strong>You are currently set as unavailable</strong>
                  <p>
                    Patients cannot book new appointments with you. Your profile
                    will show as &quot;Unavailable&quot; on the patient app. Existing
                    appointments are not affected.
                  </p>
                </div>
              </div>
              <button
                className="dd-unavailable-banner__btn"
                onClick={handleAvailabilityToggle}
              >
                Go Available
              </button>
            </div>
          )}

          <div className="dd-grid">
            {/* Left column — Professional Information */}
            <section className="dd-card">
              <div className="dd-card__header">
                <div>
                  <div className="dd-card__title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M5 20c0-3.314 2.686-6 6-6h2c3.314 0 6 2.686 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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
                      {overrides.image || mergedDoctor.image ? (
                        <img
                          src={overrides.image || mergedDoctor.image}
                          alt={mergedDoctor.name}
                        />
                      ) : (
                        mergedDoctor.name.split(" ").map((n) => n[0]).join("")
                      )}
                      {/* ✅ NEW: Availability dot on avatar */}
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
                    <div className="dd-form-row">
                      <label className="dd-label"><span>Name</span></label>
                      <input
                        className="dd-input"
                        value={overrides.name ?? mergedDoctor.name}
                        onChange={(e) => handleFieldChange("name", e.target.value)}
                      />
                    </div>
                    <div className="dd-form-row">
                      <label className="dd-label"><span>Specialty</span></label>
                      <input
                        className="dd-input"
                        value={overrides.specialty ?? mergedDoctor.specialty}
                        onChange={(e) => handleFieldChange("specialty", e.target.value)}
                      />
                    </div>
                    <div className="dd-form-row">
                      <label className="dd-label"><span>Qualification</span></label>
                      <input
                        className="dd-input"
                        value={overrides.qualification ?? mergedDoctor.qualification}
                        onChange={(e) => handleFieldChange("qualification", e.target.value)}
                      />
                    </div>
                    <div className="dd-form-row">
                      <label className="dd-label"><span>Experience (years)</span></label>
                      <input
                        className="dd-input"
                        value={overrides.experience ?? mergedDoctor.experience}
                        onChange={(e) => handleFieldChange("experience", e.target.value)}
                      />
                    </div>
                    <div className="dd-form-row">
                      <label className="dd-label"><span>Location / Clinic</span></label>
                      <input
                        className="dd-input"
                        placeholder="City, State"
                        value={overrides.location ?? mergedDoctor.location ?? ""}
                        onChange={(e) => handleFieldChange("location", e.target.value)}
                      />
                    </div>
                    <div className="dd-form-row">
                      <label className="dd-label"><span>Profile Image URL</span></label>
                      <input
                        className="dd-input"
                        placeholder="https://example.com/image.jpg"
                        value={overrides.image ?? ""}
                        onChange={(e) => handleFieldChange("image", e.target.value)}
                      />
                    </div>
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
                    onChange={(e) => handleFieldChange("about", e.target.value)}
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

            {/* Right column: rating + contact */}
            <section className="dd-card">
              <div className="dd-card__header">
                <div>
                  <div className="dd-card__title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    </svg>
                    <span>Reviews & Ratings</span>
                  </div>
                  <p className="dd-card__subtitle">
                    This is based on patient feedback from the mock data.
                  </p>
                </div>
              </div>
              <div className="dd-card__body">
                <div className="dd-rating">
                  <div className="dd-rating__value">{mergedDoctor.rating}</div>
                  <div>
                    <div className="dd-rating__stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill={i + 1 <= Math.round(mergedDoctor.rating) ? "#FBBF24" : "none"}
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" stroke="#FBBF24" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                      ))}
                    </div>
                    <div className="dd-rating__meta">
                      <span>Based on {mergedDoctor.reviews.toLocaleString()} patient reviews</span>
                      <span>Patients see this rating on the doctor listing and booking screen.</span>
                    </div>
                  </div>
                </div>

                <div className="dd-form-row">
                  <label className="dd-label"><span>Contact Email</span></label>
                  <input
                    className="dd-input"
                    placeholder="clinic@example.com"
                    value={overrides.contactEmail ?? (overrides.location ? "" : (mockData.testUser.email || ""))}
                    onChange={(e) => handleFieldChange("contactEmail", e.target.value)}
                  />
                </div>
                <div className="dd-form-row">
                  <label className="dd-label"><span>Phone Number</span></label>
                  <input
                    className="dd-input"
                    placeholder="+91XXXXXXXXXX"
                    value={overrides.contactPhone ?? (overrides.location ? "" : (mockData.testUser.mobile || ""))}
                    onChange={(e) => handleFieldChange("contactPhone", e.target.value)}
                  />
                </div>

                <div className="dd-contact-pill">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M21 16.5v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 1.5 3.18 2 2 0 0 1 3.5 1h3a2 2 0 0 1 2 1.72 12.75 12.75 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l2.27-1.66a2 2 0 0 1 2.11-.45 12.75 12.75 0 0 0 2.81.7A2 2 0 0 1 21 16.5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>These contact details are only used inside this demo and are not sent anywhere.</span>
                </div>
              </div>
            </section>
          </div>

          {/* Appointment slots row */}
          <div className="dd-grid" style={{ marginTop: 14 }}>
            <section className="dd-card">
              <div className="dd-card__header">
                <div>
                  <div className="dd-card__title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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
                  <div>
                    <div className="dd-quick-guide">
                      <div className="dd-quick-guide__title">Quick Setup Guide</div>
                      <div className="dd-quick-guide__grid">
                        <div className="dd-quick-guide__item">
                          <span>Date Selection</span>
                          <span>Choose specific date or recurring day</span>
                        </div>
                        <div className="dd-quick-guide__item">
                          <span>Time Setup</span>
                          <span>Start time, end time & slot length</span>
                        </div>
                        <div className="dd-quick-guide__item">
                          <span>Appointment Type</span>
                          <span>Individual or group slots</span>
                        </div>
                        <div className="dd-quick-guide__item">
                          <span>Capacity</span>
                          <span>Max patients per slot</span>
                        </div>
                      </div>
                    </div>

                    <div className="dd-slots-grid">
                      <div className="dd-form-row">
                        <label className="dd-label"><span>Default Start Time</span></label>
                        <input type="time" className="dd-input" value={startTime} onChange={(e) => handleFieldChange("defaultStartTime", e.target.value)} />
                      </div>
                      <div className="dd-form-row">
                        <label className="dd-label"><span>Default End Time</span></label>
                        <input type="time" className="dd-input" value={endTime} onChange={(e) => handleFieldChange("defaultEndTime", e.target.value)} />
                      </div>
                      <div className="dd-form-row">
                        <label className="dd-label"><span>Slot Duration (mins)</span></label>
                        <input type="number" className="dd-input" min={10} max={120} value={slotDuration} onChange={(e) => handleFieldChange("slotDurationMinutes", Number(e.target.value) || 30)} />
                      </div>
                      <div className="dd-form-row">
                        <label className="dd-label"><span>Appointment Type</span></label>
                        <select className="dd-select" value={overrides.appointmentType ?? "individual"} onChange={(e) => handleFieldChange("appointmentType", e.target.value as "individual" | "group")}>
                          <option value="individual">Individual</option>
                          <option value="group">Group (multiple per slot)</option>
                        </select>
                      </div>
                      <div className="dd-form-row">
                        <label className="dd-label"><span>Max Patients / Slot</span></label>
                        <input type="number" className="dd-input" min={1} max={20} value={overrides.maxPatientsPerSlot ?? 1} onChange={(e) => handleFieldChange("maxPatientsPerSlot", Number(e.target.value) || 1)} />
                      </div>
                      <div className="dd-form-row">
                        <label className="dd-label"><span>Recurring Day</span></label>
                        <select className="dd-select" value={recurringDay} onChange={(e) => handleFieldChange("recurringDay", e.target.value)}>
                          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="dd-form-row">
                      <label className="dd-label">
                        <span>Availability</span>
                        <span>Displayed on patient app</span>
                      </label>
                      <input className="dd-input" value={overrides.availabilityDays ?? mergedDoctor.availability.days} onChange={(e) => handleFieldChange("availabilityDays", e.target.value)} />
                    </div>
                    <div className="dd-form-row">
                      <label className="dd-label"><span>Hours</span></label>
                      <input className="dd-input" value={overrides.availabilityHours ?? mergedDoctor.availability.hours} onChange={(e) => handleFieldChange("availabilityHours", e.target.value)} />
                    </div>

                    <div className="dd-slot-preview">
                      <div>Preview for <strong>{recurringDay}</strong></div>
                      <div className="dd-slot-preview__chips">
                        {previewSlots.map((s) => (
                          <span key={s} className="dd-slot-chip">{s}</span>
                        ))}
                        {previewSlots.length === 0 && (
                          <span style={{ fontSize: 11, color: "#9ca3af" }}>
                            Adjust start / end time or duration to generate slots.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="dd-help">
                      These settings drive the slot grid on the patient booking page. In this demo they are stored in your browser only.
                    </div>
                  </div>
                </div>
              </div>

              <div className="dd-footer-actions">
                <button
                  type="button"
                  className="dd-btn dd-btn--ghost"
                  onClick={() => {
                    if (!doctorId) return;
                    const store = loadOverrides();
                    setOverrides(store[doctorId] || {});
                  }}
                >
                  Reset Changes
                </button>
                <button
                  type="button"
                  className="dd-btn dd-btn--primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save & Update Patient View"}
                </button>
              </div>
            </section>

            <section className="dd-card">
              <div className="dd-card__header">
                <div>
                  <div className="dd-card__title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 8V4m0 0a4 4 0 1 1 0 8m0-8a4 4 0 1 0 0 8m0 0v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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
                  <label className="dd-label"><span>Consultation Fee (₹)</span></label>
                  <input
                    type="number"
                    className="dd-input"
                    min={0}
                    value={overrides.consultationFee ?? mergedDoctor.consultationFee}
                    onChange={(e) => handleFieldChange("consultationFee", Number(e.target.value) || 0)}
                  />
                  <div className="dd-help">
                    This fee is reflected on the home doctor cards, appointment details and booking summary.
                  </div>
                </div>

                <div className="dd-pill-row">
                  <span className="dd-pill dd-pill--accent">
                    Current timing: {overrides.timing ?? mergedDoctor.timing}
                  </span>
                  <span className="dd-pill">
                    Availability: {mergedDoctor.availability.days}, {mergedDoctor.availability.hours}
                  </span>
                  <span className="dd-pill">
                    Patients booked so far: {(doctor as any).patients}
                  </span>
                  {/* ✅ NEW: Show current availability status */}
                  <span className={`dd-pill ${isAvailable ? "dd-pill--green" : "dd-pill--red"}`}>
                    Status: {isAvailable ? "Available" : "Unavailable"}
                  </span>
                  <span className="dd-badge-small">
                    Demo only — stored in localStorage
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}