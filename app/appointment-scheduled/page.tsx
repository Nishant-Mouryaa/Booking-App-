"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import mockData from "@/data/mockData.json";
import "./scheduled.css";

export default function AppointmentScheduledPage() {
  const router = useRouter();
  const [appointment, setAppointment] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("appointments");

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (!storedEmail) {
      router.push("/login");
      return;
    }

    const lastBooking = localStorage.getItem("lastBooking");
    if (lastBooking) {
      setAppointment(JSON.parse(lastBooking));
    } else if (mockData.appointments.length > 0) {
      setAppointment(mockData.appointments[0]);
    }
  }, [router]);

  const handleAddToCalendar = () => {
    alert("📅 Adding to calendar...\n\nThis would integrate with device calendar API");
  };

  const handleAddPatientDetails = () => {
    alert("👤 Add Patient Details\n\nPatient information form would open here:\n- Name\n- Age\n- Gender\n- Medical History\n- Allergies\n- Current Medications");
  };

  const handleViewAppointment = () => {
    router.push("/appointments");
  };

  const handleLogout = () => {
    localStorage.removeItem("verificationPhone");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("socialLogin");
    localStorage.removeItem("favorites");
    router.push("/login");
  };

  const upcomingCount = mockData.appointments.filter((a) => a.type === "upcoming").length;

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

  if (!appointment) {
    return (
      <div className="sc">
        <main className="sc-main">
          <div className="sc-container">
            <p style={{ padding: "40px 20px", textAlign: "center" }}>Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  const doctor = (mockData.doctors as any[]).find((d) => d.id === appointment.doctorId);

  return (
    <div className="sc">
      <main className="sc-main">
        {/* Top Bar */}
        <header className="sc-topbar">
          <div className="sc-container sc-topbar__inner">
            <div className="sc-topbar__left">
              <button className="sc-back-btn" onClick={() => router.push("/home")}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <h1 className="sc-topbar__title">Appointment Scheduled</h1>
            </div>
            <div className="sc-topbar__right">
              <button className="sc-topbar__btn" onClick={() => router.push("/home")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Home</span>
              </button>
              <button className="sc-topbar__btn sc-topbar__btn--logout" onClick={() => { if (confirm("Logout?")) handleLogout(); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="sc-scroll">
          {/* Hero */}
          <div className="sc-container">
            <section className="sc-hero">
              <div className="sc-hero__check">
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                  <circle cx="26" cy="26" r="22" fill="rgba(255,255,255,0.18)" />
                  <path d="M17 26L23 32L37 20" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="sc-hero__title">Booking Confirmed!</h2>
              <p className="sc-hero__desc">Your appointment has been successfully scheduled. We&apos;ve sent a confirmation to your email.</p>
              <div className="sc-hero__stats">
                <div className="sc-hero__stat">
                  <strong>#{appointment.appointmentNumber}</strong>
                  <span>Appt. No.</span>
                </div>
                <div className="sc-hero__stat-divider" />
                <div className="sc-hero__stat">
                  <strong>{appointment.reportingTime?.split(" ")[0] || "Tomorrow"}</strong>
                  <span>Date</span>
                </div>
                <div className="sc-hero__stat-divider" />
                <div className="sc-hero__stat">
                  <strong>{appointment.reportingTime?.split(" ")[1] || "10:00"} {appointment.reportingTime?.split(" ")[2] || "AM"}</strong>
                  <span>Time</span>
                </div>
              </div>
            </section>
          </div>

          {/* Content Grid */}
          <div className="sc-container">
            <div className="sc-grid">
              {/* ---- Left Column ---- */}
              <div className="sc-grid__col">
                {/* Doctor Card */}
                <article className="sc-card sc-doctor">
                  <div className="sc-doctor__img-wrap">
                    {doctor?.image ? (
                      <img src={doctor.image} alt={appointment.doctorName} className="sc-doctor__img" />
                    ) : (
                      <div className="sc-doctor__img-ph">
                        {appointment.doctorName.split(" ").map((n: string) => n[0]).join("")}
                      </div>
                    )}
                    <span className="sc-doctor__dot" />
                  </div>
                  <div className="sc-doctor__body">
                    <h3 className="sc-doctor__name">{appointment.doctorName}</h3>
                    <p className="sc-doctor__spec">{appointment.doctorSpecialty}</p>
                    <p className="sc-doctor__qual">{appointment.doctorQualification}</p>
                    {doctor && (
                      <div className="sc-doctor__meta">
                        <span className="sc-doctor__rating">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="#FBBF24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          {doctor.rating}
                        </span>
                        <span className="sc-doctor__exp">{doctor.experience} yrs exp</span>
                        <span className="sc-doctor__fee">₹{doctor.consultationFee}</span>
                      </div>
                    )}
                  </div>
                </article>

                {/* Details Card */}
                <div className="sc-card">
                  <h3 className="sc-card__head">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Appointment Details
                  </h3>

                  <div className="sc-info-grid">
                    <div className="sc-info-item">
                      <span className="sc-info-label">Status</span>
                      <span className={`sc-badge ${appointment.status === "active" ? "sc-badge--green" : ""}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                    <div className="sc-info-item">
                      <span className="sc-info-label">Reporting Time</span>
                      <span className="sc-info-value">{appointment.reportingTime}</span>
                    </div>
                    <div className="sc-info-item">
                      <span className="sc-info-label">Token Number</span>
                      <span className="sc-info-value">#{appointment.tokenNumber || "—"}</span>
                    </div>
                    <div className="sc-info-item">
                      <span className="sc-info-label">Payment</span>
                      <span className={`sc-badge ${appointment.paymentStatus === "paid" ? "sc-badge--green" : "sc-badge--amber"}`}>
                        {appointment.paymentStatus === "paid" ? "Paid" : "Not Paid"}
                      </span>
                    </div>
                  </div>

                  <button className="sc-outline-btn" onClick={handleAddToCalendar}>
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M13 2V6M7 2V6M3 8H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Add to Calendar
                  </button>
                </div>
              </div>

              {/* ---- Right Column ---- */}
              <div className="sc-grid__col">
                {/* Patient Details */}
                <div className="sc-card">
                  <h3 className="sc-card__head">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M5 20C5 16.6863 7.68629 14 11 14H13C16.3137 14 19 16.6863 19 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Patient Details
                  </h3>
                  <p className="sc-card__desc">Add patient information for a smoother check-in experience at the clinic.</p>
                  <button className="sc-dashed-btn" onClick={handleAddPatientDetails}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Add Patient Details
                  </button>
                </div>

                {/* What's Next */}
                <div className="sc-card sc-next">
                  <h3 className="sc-card__head">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M12 8v4l3 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    What&apos;s Next?
                  </h3>
                  <ul className="sc-next__list">
                    <li>
                      <span className="sc-next__num">1</span>
                      <div>
                        <strong>Confirmation Sent</strong>
                        <p>Check your email for appointment details</p>
                      </div>
                    </li>
                    <li>
                      <span className="sc-next__num">2</span>
                      <div>
                        <strong>Prepare Documents</strong>
                        <p>Keep your medical records and ID ready</p>
                      </div>
                    </li>
                    <li>
                      <span className="sc-next__num">3</span>
                      <div>
                        <strong>Arrive On Time</strong>
                        <p>Reach 15 minutes before your appointment</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sc-footer">
          <div className="sc-container sc-footer__inner">
            <button className="sc-footer__btn sc-footer__btn--secondary" onClick={() => router.push("/home")}>
              Back to Home
            </button>
            <button className="sc-footer__btn sc-footer__btn--primary" onClick={handleViewAppointment}>
              View My Appointments
            </button>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="sc-bottom">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`sc-bottom__item ${activeTab === item.id ? "sc-bottom__item--active" : ""}`}
            onClick={item.action}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.id === "appointments" && upcomingCount > 0 && (
              <span className="sc-bottom__badge">{upcomingCount}</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}