"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import mockData from "@/data/mockData.json";
import "../appointment.css";

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

export default function AppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [activeTab, setActiveTab] = useState("find");

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (!storedEmail) {
      router.push("/login");
      return;
    }
  }, [router]);

  useEffect(() => {
    const doctorId = parseInt(params.id as string);
    const foundDoctor = mockData.doctors.find((d) => d.id === doctorId);
    if (foundDoctor) {
      setDoctor(foundDoctor as Doctor);
    } else {
      router.push("/home");
    }
  }, [params.id, router]);

  const handleBookAppointment = async () => {
    if (!doctor) return;
    setIsBooking(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newAppointment = {
      id: Date.now(),
      appointmentNumber: Math.floor(Math.random() * 100).toString(),
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      doctorQualification: doctor.qualification,
      status: "active",
      reportingTime: "Tomorrow 10:00 AM",
      date: new Date().toISOString(),
      time: doctor.timing.split("-")[0].trim(),
      tokenNumber: Math.floor(Math.random() * 50).toString(),
      paymentStatus: "not paid",
      type: "upcoming",
    };

    try {
      const stored = localStorage.getItem("appointments");
      const baseAppointments = stored
        ? JSON.parse(stored)
        : (mockData.appointments as any[]);
      const updatedAppointments = [...baseAppointments, newAppointment];
      localStorage.setItem("appointments", JSON.stringify(updatedAppointments));
    } catch {
      // fallback
    }

    localStorage.setItem("lastBooking", JSON.stringify(newAppointment));
    setIsBooking(false);
    router.push("/appointment-scheduled");
  };

  const handleLogout = () => {
    localStorage.removeItem("verificationPhone");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("socialLogin");
    localStorage.removeItem("favorites");
    router.push("/login");
  };

  const upcomingCount = mockData.appointments.filter(
    (a) => a.type === "upcoming"
  ).length;

  const navItems = [
    {
      id: "find",
      label: "Find",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      action: () => { setActiveTab("find"); router.push("/home"); },
    },
    {
      id: "appointments",
      label: "Appoint.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      action: () => { setActiveTab("appointments"); router.push("/appointments"); },
    },
    {
      id: "records",
      label: "Records",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M9 14L11 16L15 12M7 3H17C18.1046 3 19 3.89543 19 5V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      action: () => { setActiveTab("records"); alert("📋 Medical Records coming soon!"); },
    },
    {
      id: "profile",
      label: "Profile",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
          <path d="M5 20C5 16.6863 7.68629 14 11 14H13C16.3137 14 19 16.6863 19 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      action: () => { setActiveTab("profile"); if (confirm("Do you want to logout?")) handleLogout(); },
    },
  ];

  if (!doctor) {
    return (
      <div className="ap">
        <main className="ap-main">
          <div className="ap-container">
            <p style={{ padding: "40px 20px", textAlign: "center" }}>Loading doctor details...</p>
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
              <button className="ap-topbar__btn ap-topbar__btn--logout" onClick={() => { if (confirm("Logout?")) handleLogout(); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="ap-scroll">
          {/* Hero Banner */}
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
                <div className="ap-hero__stat">
                  <strong>{doctor.patients}</strong>
                  <span>Patients</span>
                </div>
                <div className="ap-hero__stat-divider" />
                <div className="ap-hero__stat">
                  <strong>{doctor.experience}</strong>
                  <span>Years Exp.</span>
                </div>
                <div className="ap-hero__stat-divider" />
                <div className="ap-hero__stat">
                  <strong>{doctor.rating}</strong>
                  <span>Rating</span>
                </div>
                <div className="ap-hero__stat-divider" />
                <div className="ap-hero__stat">
                  <strong>{doctor.reviews.toLocaleString()}</strong>
                  <span>Reviews</span>
                </div>
              </div>
            </section>
          </div>

          {/* Content Grid */}
          <div className="ap-container">
            <div className="ap-grid">
              {/* Left Column */}
              <div className="ap-grid__col">
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
                {/* Availability */}
                <div className="ap-card">
                  <h3 className="ap-card__head">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M10 6V10L13 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Availability
                  </h3>
                  <div className="ap-avail-row">
                    <span className="ap-avail-label">{doctor.availability.days}</span>
                    <span className="ap-avail-value">{doctor.availability.hours}</span>
                  </div>
                  <div className="ap-avail-row" style={{ marginTop: 8 }}>
                    <span className="ap-avail-label">Timing</span>
                    <span className="ap-avail-value">{doctor.timing}</span>
                  </div>
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
                    <li>
                      <span className="ap-tips__dot" />
                      <span>Carry previous medical records & prescriptions</span>
                    </li>
                    <li>
                      <span className="ap-tips__dot" />
                      <span>List your current medications & allergies</span>
                    </li>
                    <li>
                      <span className="ap-tips__dot" />
                      <span>Arrive 15 minutes before your scheduled time</span>
                    </li>
                    <li>
                      <span className="ap-tips__dot" />
                      <span>Bring a valid ID for verification</span>
                    </li>
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
              <span className="ap-footer__price-label">Consultation Fee</span>
              <span className="ap-footer__price-amount">₹{doctor.consultationFee}</span>
            </div>
            <button
              className="ap-footer__btn"
              onClick={handleBookAppointment}
              disabled={isBooking || !doctor.available}
            >
              {isBooking
                ? "Booking..."
                : doctor.available
                  ? "Book Appointment"
                  : "Currently Unavailable"}
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