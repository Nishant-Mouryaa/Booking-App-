"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import mockData from "@/data/mockData.json";
import "../appointment.css";
import { getDoctorWithOverrides } from "../../../utils/getDoctorWithOverrides";
import type { DoctorSlotConfig } from "../../../utils/getDoctorWithOverrides";

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  qualification: string;
  experience: string;
  available: boolean;
  timing: string;
  description: string;
  image: string;
  rating: number;
  consultationFee: number;
  patients: string;
  reviews: number;
  affiliation: string;
  about: string;
  service: string;
  specialization: string;
  availability: {
    days: string;
    hours: string;
  };
}

interface BookedSlot {
  doctorId: number;
  date: string;
  time: string;
  bookedBy: string;
  appointmentId: number;
}

// ─── Day parser ───────────────────────────────────────────────────────────────
// Supports BOTH the old long format ("Monday to Friday") AND the new short
// format produced by the DayPicker component ("Mon-Fri", "Mon, Wed, Fri").
const getWorkingDays = (daysStr: string): number[] => {
  if (!daysStr) return [1, 2, 3, 4, 5, 6]; // sensible default

  // Map accepts both full names and 3-letter abbreviations
  const dayMap: Record<string, number> = {
    // Full names
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
    thursday: 4, friday: 5, saturday: 6,
    // Short names (DayPicker output)
    sun: 0, mon: 1, tue: 2, wed: 3,
    thu: 4, fri: 5, sat: 6,
  };

  const normalise = (s: string): number | undefined =>
    dayMap[s.trim().toLowerCase()];

  const lower = daysStr.toLowerCase().trim();

  // "all" / "everyday"
  if (lower.includes("all") || lower.includes("everyday")) {
    return [0, 1, 2, 3, 4, 5, 6];
  }

  // Range with dash: "Mon-Fri" or "Monday-Friday"
  const dashRangeMatch = lower.match(/^(\w+)\s*[-–]\s*(\w+)$/);
  if (dashRangeMatch) {
    const start = normalise(dashRangeMatch[1]);
    const end   = normalise(dashRangeMatch[2]);
    if (start !== undefined && end !== undefined) {
      const days: number[] = [];
      if (start <= end) {
        for (let i = start; i <= end; i++) days.push(i);
      } else {
        // wraps around the week, e.g. Fri-Mon
        for (let i = start; i <= 6; i++) days.push(i);
        for (let i = 0; i <= end; i++) days.push(i);
      }
      return days;
    }
  }

  // Range with "to": "Monday to Friday"
  const toRangeMatch = lower.match(/^(\w+)\s+to\s+(\w+)$/);
  if (toRangeMatch) {
    const start = normalise(toRangeMatch[1]);
    const end   = normalise(toRangeMatch[2]);
    if (start !== undefined && end !== undefined) {
      const days: number[] = [];
      if (start <= end) {
        for (let i = start; i <= end; i++) days.push(i);
      } else {
        for (let i = start; i <= 6; i++) days.push(i);
        for (let i = 0; i <= end; i++) days.push(i);
      }
      return days;
    }
  }

  // Comma / space separated individual days: "Mon, Wed, Fri" or "Monday, Wednesday"
  const parts = lower.split(/[\s,&]+/).filter(Boolean);
  if (parts.length > 0) {
    const result = parts
      .map(normalise)
      .filter((d): d is number => d !== undefined);
    if (result.length > 0) return result;
  }

  // Absolute fallback
  return [1, 2, 3, 4, 5, 6];
};

// ─── Time-range parser ────────────────────────────────────────────────────────
// Handles ALL formats:
//   "10 AM To 5 PM"  |  "10:00 AM - 5:00 PM"  |  "09:30 AM – 07:00 PM"
//   "9:00 AM - 5:00 PM"  (new TimeRangePicker output)
const parseTimeRange = (
  rangeStr: string
): { startHour: number; startMin: number; endHour: number; endMin: number } | null => {
  if (!rangeStr) return null;
  const clean = rangeStr.replace(/–/g, "-").trim();
  const match = clean.match(
    /(\d{1,2}):?(\d{2})?\s*(AM|PM)\s*(?:to|-)\s*(\d{1,2}):?(\d{2})?\s*(AM|PM)/i
  );
  if (!match) return null;

  let sH = parseInt(match[1]);
  const sM = match[2] ? parseInt(match[2]) : 0;
  const sPeriod = match[3].toUpperCase();

  let eH = parseInt(match[4]);
  const eM = match[5] ? parseInt(match[5]) : 0;
  const ePeriod = match[6].toUpperCase();

  if (sPeriod === "PM" && sH !== 12) sH += 12;
  if (sPeriod === "AM" && sH === 12) sH = 0;
  if (ePeriod === "PM" && eH !== 12) eH += 12;
  if (ePeriod === "AM" && eH === 12) eH = 0;

  return { startHour: sH, startMin: sM, endHour: eH, endMin: eM };
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function AppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [activeTab, setActiveTab] = useState("find");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [slotConfig, setSlotConfig] = useState<DoctorSlotConfig | null>(null);

  // Auth guard
  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (!storedEmail) router.push("/login");
  }, [router]);

  // Load & refresh doctor data
  useEffect(() => {
    const doctorId = parseInt(params.id as string);
    if (isNaN(doctorId)) { router.push("/home"); return; }

    const loadDoctor = () => {
      const { doctor: mergedDoctor, slotConfig: config } =
        getDoctorWithOverrides(doctorId);
      if (!mergedDoctor) { router.push("/home"); return; }
      setDoctor(mergedDoctor);
      setSlotConfig(config);
    };

    loadDoctor();

    const handleFocus   = () => loadDoctor();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "doctorOverrides") loadDoctor();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
    };
  }, [params.id, router]);

  // Rebuild available dates whenever doctor (or its availability) changes
// ─── Rebuild available dates ───────────────────────────────────────────────
useEffect(() => {
  if (!doctor) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ── Priority 1: doctor set explicit dates via the calendar picker ──────
  if (slotConfig?.selectedDates && slotConfig.selectedDates.length > 0) {
    const futureDates = slotConfig.selectedDates
      .filter((iso) => {
        const d = new Date(iso + "T00:00:00");
        return d >= today; // only show today or future
      })
      .sort(); // already sorted but ensure it

    setAvailableDates(futureDates);
    setSelectedDate(futureDates[0] ?? "");
    setSelectedTime("");
    return;
  }

  // ── Priority 2: fall back to working-days logic ────────────────────────
  const workingDays = getWorkingDays(doctor.availability.days);
  const dates: string[] = [];

  for (let i = 1; i <= 30 && dates.length < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    if (workingDays.includes(date.getDay())) {
      dates.push(date.toISOString().split("T")[0]);
    }
  }

  setAvailableDates(dates);
  setSelectedDate(dates[0] ?? "");
  setSelectedTime("");
}, [doctor, slotConfig]); // 👈 slotConfig must be in deps

  // Load booked slots
  useEffect(() => {
    const load = () => {
      try {
        const stored = localStorage.getItem("bookedSlots");
        setBookedSlots(stored ? JSON.parse(stored) : []);
      } catch { setBookedSlots([]); }
    };
    load();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "bookedSlots") load();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // ── Time slots ──────────────────────────────────────────────────────────────
  const timeSlots = useMemo(() => {
    if (!doctor) return [];
    const slots: string[] = [];

    // Priority 1: explicit dashboard slot config
    if (slotConfig?.defaultStartTime && slotConfig?.defaultEndTime) {
      const duration = slotConfig.slotDurationMinutes ?? 30;
      try {
        const [sh, sm] = slotConfig.defaultStartTime.split(":").map(Number);
        const [eh, em] = slotConfig.defaultEndTime.split(":").map(Number);
        let current = sh * 60 + (isNaN(sm) ? 0 : sm);
        const end   = eh * 60 + (isNaN(em) ? 0 : em);
        while (current < end) {
          const hour24 = Math.floor(current / 60);
          const minute = current % 60;
          const h12    = hour24 % 12 || 12;
          const period = hour24 < 12 ? "AM" : "PM";
          slots.push(`${h12}:${minute.toString().padStart(2, "0")} ${period}`);
          current += duration;
        }
        return slots;
      } catch { /* fall through */ }
    }

    // Priority 2: availability.hours → Priority 3: timing
    const parsed =
      parseTimeRange(doctor.availability.hours) ||
      parseTimeRange(doctor.timing);

    const startTotal = parsed ? parsed.startHour * 60 + parsed.startMin : 9 * 60;
    const endTotal   = parsed ? parsed.endHour   * 60 + parsed.endMin   : 17 * 60;
    const duration   = slotConfig?.slotDurationMinutes ?? 30;

    let current = startTotal;
    while (current < endTotal) {
      const hour24 = Math.floor(current / 60);
      const minute = current % 60;
      const h12    = hour24 % 12 || 12;
      const period = hour24 < 12 ? "AM" : "PM";
      slots.push(`${h12}:${minute.toString().padStart(2, "0")} ${period}`);
      current += duration;
    }
    return slots;
  }, [doctor, slotConfig]);

  // ── Slot helpers ────────────────────────────────────────────────────────────
  const maxPerSlot = useMemo(() => {
    if (!slotConfig) return 1;
    return slotConfig.maxPatientsPerSlot ?? 1;
  }, [slotConfig]);

  const getSlotBookingCount = (date: string, time: string): number => {
    if (!doctor) return 0;
    return bookedSlots.filter(
      (s) => s.doctorId === doctor.id && s.date === date && s.time === time
    ).length;
  };

  const isSlotFullyBooked = (date: string, time: string): boolean =>
    getSlotBookingCount(date, time) >= maxPerSlot;

  const isSlotBookedByMe = (date: string, time: string): boolean => {
    if (!doctor) return false;
    const userEmail = localStorage.getItem("userEmail") || "";
    return bookedSlots.some(
      (s) =>
        s.doctorId === doctor.id &&
        s.date === date &&
        s.time === time &&
        s.bookedBy === userEmail
    );
  };

  const isSlotInPast = (date: string, time: string): boolean => {
    try {
      const now   = new Date();
      const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return false;
      let hour = parseInt(match[1]);
      const min  = parseInt(match[2]);
      const period = match[3].toUpperCase();
      if (period === "PM" && hour !== 12) hour += 12;
      if (period === "AM" && hour === 12) hour = 0;
      const slotDate = new Date(date);
      slotDate.setHours(hour, min, 0, 0);
      return slotDate <= now;
    } catch { return false; }
  };

  const getAvailableSlotsCount = (date: string): number =>
    timeSlots.filter(
      (t) => !isSlotFullyBooked(date, t) && !isSlotInPast(date, t)
    ).length;

  // ── Booking ─────────────────────────────────────────────────────────────────
  const handleBookAppointment = async () => {
    if (!doctor || !selectedDate || !selectedTime) return;

    if (isSlotFullyBooked(selectedDate, selectedTime)) {
      alert("⚠️ This time slot is now fully booked. Please select a different time.");
      const stored = localStorage.getItem("bookedSlots");
      if (stored) setBookedSlots(JSON.parse(stored));
      setSelectedTime("");
      return;
    }

    if (isSlotBookedByMe(selectedDate, selectedTime)) {
      alert("⚠️ You already have a booking at this time slot.");
      setSelectedTime("");
      return;
    }

    setIsBooking(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const appointmentId = Date.now();
    const userEmail = localStorage.getItem("userEmail") || "";

    const newAppointment = {
      id: appointmentId,
      appointmentNumber: Math.floor(Math.random() * 100).toString(),
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      doctorQualification: doctor.qualification,
      consultationFee: doctor.consultationFee,
      status: "active",
      reportingTime: `${formatDateDisplay(selectedDate)} ${selectedTime}`,
      date: selectedDate,
      time: selectedTime,
      tokenNumber: Math.floor(Math.random() * 50).toString(),
      paymentStatus: "not paid",
      type: "upcoming",
    };

    const newBookedSlot: BookedSlot = {
      doctorId: doctor.id,
      date: selectedDate,
      time: selectedTime,
      bookedBy: userEmail,
      appointmentId,
    };

    try {
      const stored = localStorage.getItem("appointments");
      const base   = stored ? JSON.parse(stored) : (mockData.appointments as any[]);
      localStorage.setItem("appointments", JSON.stringify([...base, newAppointment]));

      const existingSlots = localStorage.getItem("bookedSlots");
      const current: BookedSlot[] = existingSlots ? JSON.parse(existingSlots) : [];
      const updated = [...current, newBookedSlot];
      localStorage.setItem("bookedSlots", JSON.stringify(updated));
      setBookedSlots(updated);
    } catch { /* fallback */ }

    localStorage.setItem("lastBooking", JSON.stringify(newAppointment));
    setIsBooking(false);
    router.push("/appointment-scheduled");
  };

  // ── Formatters ──────────────────────────────────────────────────────────────
  const formatDateDisplay = (dateStr: string): string => {
    try {
      const date     = new Date(dateStr);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (dateStr === tomorrow.toISOString().split("T")[0]) return "Tomorrow";
      return date.toLocaleDateString("en-IN", {
        weekday: "short", month: "short", day: "numeric",
      });
    } catch { return dateStr; }
  };

  const formatDayName = (dateStr: string): string => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (dateStr === tomorrow.toISOString().split("T")[0]) return "TMR";
      return new Date(dateStr)
        .toLocaleDateString("en-IN", { weekday: "short" })
        .toUpperCase();
    } catch { return ""; }
  };

  const formatDayNumber = (dateStr: string): string => {
    try { return new Date(dateStr).getDate().toString(); }
    catch { return ""; }
  };

  // ── Misc ────────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("verificationPhone");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("socialLogin");
    localStorage.removeItem("favorites");
    router.push("/login");
  };

  const upcomingCount = (() => {
    try {
      const stored = localStorage.getItem("appointments");
      const list   = stored ? JSON.parse(stored) : mockData.appointments;
      return list.filter((a: any) => a.type === "upcoming").length;
    } catch {
      return mockData.appointments.filter((a) => a.type === "upcoming").length;
    }
  })();

  const navItems = [
    {
      id: "find", label: "Find",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      action: () => { setActiveTab("find"); router.push("/home"); },
    },
    {
      id: "appointments", label: "Appoint.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      action: () => { setActiveTab("appointments"); router.push("/appointments"); },
    },
    {
      id: "records", label: "Records",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M9 14L11 16L15 12M7 3H17C18.1046 3 19 3.89543 19 5V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      action: () => { setActiveTab("records"); alert("📋 Medical Records coming soon!"); },
    },
    {
      id: "profile", label: "Profile",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
          <path d="M5 20C5 16.6863 7.68629 14 11 14H13C16.3137 14 19 16.6863 19 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      action: () => {
        setActiveTab("profile");
        if (confirm("Do you want to logout?")) handleLogout();
      },
    },
  ];

  if (!doctor) {
    return (
      <div className="ap">
        <main className="ap-main">
          <div className="ap-container">
            <p style={{ padding: "40px 20px", textAlign: "center" }}>
              Loading doctor details...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="ap">
      <main className="ap-main">
        {/* Top Bar */}
        <header className="ap-topbar">
          <div className="ap-container ap-topbar__inner">
            <div className="ap-topbar__left">
              <button className="ap-back-btn" onClick={() => router.back()}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <h1 className="ap-topbar__title">Book Appointment</h1>
            </div>
            <div className="ap-topbar__right">
              <button className="ap-topbar__btn" onClick={() => router.push("/home")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Home</span>
              </button>
              <button
                className="ap-topbar__btn ap-topbar__btn--logout"
                onClick={() => { if (confirm("Logout?")) handleLogout(); }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        <div className="ap-scroll">
          {/* Hero */}
          <div className="ap-container">
            <section className="ap-hero">
              <div className="ap-hero__content">
                <div className="ap-hero__img-wrap">
                  {doctor.image ? (
                    <img src={doctor.image} alt={doctor.name} className="ap-hero__img" />
                  ) : (
                    <div className="ap-hero__img-ph">
                      {doctor.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                  )}
                </div>
                <div className="ap-hero__text">
                  <h2 className="ap-hero__name">{doctor.name}</h2>
                  <p className="ap-hero__spec">{doctor.specialty}</p>
                  <p className="ap-hero__qual">{doctor.qualification}</p>
                  <p className="ap-hero__affil">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1C4.067 1 2.5 2.567 2.5 4.5C2.5 6.75 6 11 6 11C6 11 9.5 6.75 9.5 4.5C9.5 2.567 7.933 1 6 1Z" stroke="currentColor" strokeWidth="1.2" />
                      <circle cx="6" cy="4.5" r="1" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                    {doctor.affiliation}
                  </p>
                </div>
              </div>
              <div className="ap-hero__stats">
                <div className="ap-hero__stat"><strong>{doctor.patients}</strong><span>Patients</span></div>
                <div className="ap-hero__stat-divider" />
                <div className="ap-hero__stat"><strong>{doctor.experience}</strong><span>Years Exp.</span></div>
                <div className="ap-hero__stat-divider" />
                <div className="ap-hero__stat"><strong>{doctor.rating}</strong><span>Rating</span></div>
                <div className="ap-hero__stat-divider" />
                <div className="ap-hero__stat"><strong>{doctor.reviews.toLocaleString()}</strong><span>Reviews</span></div>
              </div>
            </section>
          </div>

          {/* Content Grid */}
          <div className="ap-container">
            <div className="ap-grid">
              {/* Left Column */}
              <div className="ap-grid__col">
                {/* Date Selection */}
                <div className="ap-card">
                  <h3 className="ap-card__head">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Select Date
                  </h3>
                  <div className="ap-date-selector">
                    {availableDates.map((date) => {
                      const slotsAvailable = getAvailableSlotsCount(date);
                      const isSelected     = selectedDate === date;
                      return (
                        <button
                          key={date}
                          className={`ap-date-chip ${isSelected ? "ap-date-chip--selected" : ""} ${slotsAvailable === 0 ? "ap-date-chip--full" : ""}`}
                          onClick={() => { setSelectedDate(date); setSelectedTime(""); }}
                          disabled={slotsAvailable === 0}
                        >
                          <span className="ap-date-chip__day">{formatDayName(date)}</span>
                          <span className="ap-date-chip__num">{formatDayNumber(date)}</span>
                          <span className={`ap-date-chip__slots ${slotsAvailable === 0 ? "ap-date-chip__slots--full" : slotsAvailable <= 3 ? "ap-date-chip__slots--few" : ""}`}>
                            {slotsAvailable === 0 ? "Full" : `${slotsAvailable} slots`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slot Selection */}
                <div className="ap-card">
                  <h3 className="ap-card__head">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M12 6V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Select Time Slot
                    {selectedDate && (
                      <span className="ap-card__head-sub"> — {formatDateDisplay(selectedDate)}</span>
                    )}
                  </h3>

                  {/* Legend */}
                  <div className="ap-slot-legend">
                    <div className="ap-slot-legend__item">
                      <span className="ap-slot-legend__dot ap-slot-legend__dot--available" />
                      <span>Available</span>
                    </div>
                    <div className="ap-slot-legend__item">
                      <span className="ap-slot-legend__dot ap-slot-legend__dot--booked" />
                      <span>Full</span>
                    </div>
                    <div className="ap-slot-legend__item">
                      <span className="ap-slot-legend__dot ap-slot-legend__dot--mine" />
                      <span>Your Booking</span>
                    </div>
                    <div className="ap-slot-legend__item">
                      <span className="ap-slot-legend__dot ap-slot-legend__dot--selected" />
                      <span>Selected</span>
                    </div>
                    {maxPerSlot > 1 && (
                      <div className="ap-slot-legend__item">
                        <span className="ap-slot-legend__dot ap-slot-legend__dot--partial" />
                        <span>Filling Up</span>
                      </div>
                    )}
                  </div>

                  {maxPerSlot > 1 && (
                    <div className="ap-group-info">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <span>
                        Group appointments — up to <strong>{maxPerSlot} patients</strong> per slot.
                      </span>
                    </div>
                  )}

                  <div className="ap-time-grid">
                    {timeSlots.map((time) => {
                      const bookingCount = getSlotBookingCount(selectedDate, time);
                      const fullyBooked  = isSlotFullyBooked(selectedDate, time);
                      const bookedByMe   = isSlotBookedByMe(selectedDate, time);
                      const past         = isSlotInPast(selectedDate, time);
                      const isSelected   = selectedTime === time;
                      const isDisabled   = fullyBooked || past || bookedByMe;
                      const spotsLeft    = maxPerSlot - bookingCount;
                      const isFillingUp  = maxPerSlot > 1 && bookingCount > 0 && !fullyBooked;

                      return (
                        <button
                          key={time}
                          className={`ap-time-slot ${isSelected ? "ap-time-slot--selected" : ""} ${fullyBooked ? "ap-time-slot--booked" : ""} ${bookedByMe ? "ap-time-slot--mine" : ""} ${past ? "ap-time-slot--past" : ""} ${isFillingUp ? "ap-time-slot--filling" : ""}`}
                          onClick={() => !isDisabled && setSelectedTime(time)}
                          disabled={isDisabled}
                          title={
                            bookedByMe  ? "You already have a booking at this time"
                            : fullyBooked ? "This slot is fully booked"
                            : past       ? "This time has passed"
                            : maxPerSlot > 1
                              ? `Book at ${time} (${spotsLeft}/${maxPerSlot} spots left)`
                              : `Book at ${time}`
                          }
                        >
                          <span className="ap-time-slot__time">{time}</span>
                          {maxPerSlot > 1 && !past && (
                            <span className={`ap-time-slot__capacity ${fullyBooked ? "ap-time-slot__capacity--full" : spotsLeft <= Math.ceil(maxPerSlot * 0.3) ? "ap-time-slot__capacity--low" : ""}`}>
                              {fullyBooked ? "Full" : `${spotsLeft}/${maxPerSlot}`}
                            </span>
                          )}
                          {maxPerSlot === 1 && fullyBooked && !bookedByMe && (
                            <span className="ap-time-slot__status">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                              Booked
                            </span>
                          )}
                          {bookedByMe && (
                            <span className="ap-time-slot__status ap-time-slot__status--mine">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              Your Slot
                            </span>
                          )}
                          {past && !fullyBooked && (
                            <span className="ap-time-slot__status">Passed</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* About */}
                <div className="ap-card">
                  <h3 className="ap-card__head">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M10 10V14M10 6V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    About Doctor
                  </h3>
                  <p className="ap-card__text">{doctor.about}</p>
                </div>

                {/* Service & Specialization */}
                <div className="ap-card">
                  <h3 className="ap-card__head">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 2L12.5 7L18 8L14 12L15 18L10 15L5 18L6 12L2 8L7.5 7L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                    Service & Specialization
                  </h3>
                  <div className="ap-info-grid">
                    <div className="ap-info-item">
                      <span className="ap-info-label">Service</span>
                      <span className="ap-info-value">{doctor.service}</span>
                    </div>
                    <div className="ap-info-item">
                      <span className="ap-info-label">Specialization</span>
                      <span className="ap-info-value">{doctor.specialization}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="ap-grid__col">
                {/* Booking Summary */}
                {selectedDate && selectedTime && (
                  <div className="ap-card ap-booking-summary">
                    <h3 className="ap-card__head">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4m6 2a10 10 0 11-20 0 10 10 0 0120 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Booking Summary
                    </h3>
                    <div className="ap-booking-summary__details">
                      <div className="ap-booking-summary__row">
                        <span className="ap-booking-summary__label">Doctor</span>
                        <span className="ap-booking-summary__value">{doctor.name}</span>
                      </div>
                      <div className="ap-booking-summary__row">
                        <span className="ap-booking-summary__label">Date</span>
                        <span className="ap-booking-summary__value">{formatDateDisplay(selectedDate)}</span>
                      </div>
                      <div className="ap-booking-summary__row">
                        <span className="ap-booking-summary__label">Time</span>
                        <span className="ap-booking-summary__value">{selectedTime}</span>
                      </div>
                      <div className="ap-booking-summary__row">
                        <span className="ap-booking-summary__label">Fee</span>
                        <span className="ap-booking-summary__value ap-booking-summary__value--fee">
                          ₹{doctor.consultationFee}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Availability Card */}
                <div className="ap-card">
                  <h3 className="ap-card__head">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M10 6V10L13 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Availability
                  </h3>
                  <div className="ap-avail-row">
                    <span className="ap-avail-label">Days</span>
                    <span className="ap-avail-value">{doctor.availability.days}</span>
                  </div>
                  <div className="ap-avail-row" style={{ marginTop: 8 }}>
                    <span className="ap-avail-label">Hours</span>
                    <span className="ap-avail-value">{doctor.availability.hours}</span>
                  </div>
                  {doctor.timing !== doctor.availability.hours && (
                    <div className="ap-avail-row" style={{ marginTop: 8 }}>
                      <span className="ap-avail-label">Clinic Timing</span>
                      <span className="ap-avail-value ap-avail-value--muted">{doctor.timing}</span>
                    </div>
                  )}
                  {slotConfig && (
                    <>
                      <div className="ap-avail-row" style={{ marginTop: 8 }}>
                        <span className="ap-avail-label">Slot Duration</span>
                        <span className="ap-avail-value">{slotConfig.slotDurationMinutes ?? 30} minutes</span>
                      </div>
                      <div className="ap-avail-row" style={{ marginTop: 8 }}>
                        <span className="ap-avail-label">Appointment Type</span>
                        <span className="ap-avail-value">
                          {slotConfig.appointmentType === "group"
                            ? `Group (up to ${maxPerSlot} patients/slot)`
                            : "Individual (1 patient/slot)"}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Consultation Fee */}
                <div className="ap-card">
                  <h3 className="ap-card__head">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 2V18M14 6H8C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10H12C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Consultation Fee
                  </h3>
                  <div className="ap-fee">
                    <span className="ap-fee__amount">₹{doctor.consultationFee}</span>
                    <span className="ap-fee__note">per consultation</span>
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="ap-card ap-tips">
                  <h3 className="ap-card__head">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Before Your Visit
                  </h3>
                  <ul className="ap-tips__list">
                    <li><span className="ap-tips__dot" /><span>Carry previous medical records &amp; prescriptions</span></li>
                    <li><span className="ap-tips__dot" /><span>List your current medications &amp; allergies</span></li>
                    <li><span className="ap-tips__dot" /><span>Arrive 15 minutes before your scheduled time</span></li>
                    <li><span className="ap-tips__dot" /><span>Bring a valid ID for verification</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="ap-footer">
          <div className="ap-container ap-footer__inner">
            <div className="ap-footer__price">
              <span className="ap-footer__price-label">
                {selectedDate && selectedTime
                  ? `${formatDateDisplay(selectedDate)} at ${selectedTime}`
                  : "Select date & time"}
              </span>
              <span className="ap-footer__price-amount">₹{doctor.consultationFee}</span>
            </div>
            <button
              className="ap-footer__btn"
              onClick={handleBookAppointment}
              disabled={isBooking || !doctor.available || !selectedDate || !selectedTime}
            >
              {isBooking         ? "Booking..."
               : !doctor.available ? "Currently Unavailable"
               : !selectedDate || !selectedTime ? "Select Date & Time"
               : "Confirm Booking"}
            </button>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="ap-bottom">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`ap-bottom__item ${activeTab === item.id ? "ap-bottom__item--active" : ""}`}
            onClick={item.action}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.id === "appointments" && upcomingCount > 0 && (
              <span className="ap-bottom__badge">{upcomingCount}</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}