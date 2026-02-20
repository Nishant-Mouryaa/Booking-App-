"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import mockData from "@/data/mockData.json";
import "./appointments.css";

interface Appointment {
  id: number;
  appointmentNumber: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string;
  doctorQualification: string;
  status: string;
  reportingTime: string;
  date: string;
  time: string;
  tokenNumber: string;
  paymentStatus: string;
  type: string;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "canceled">("upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeBottomTab, setActiveBottomTab] = useState<"find" | "appointments" | "records" | "profile">("appointments");

  useEffect(() => {
    // Load appointments from localStorage, seeded from mock data
    try {
      const stored = localStorage.getItem("appointments");
      const allAppointments: Appointment[] = stored
        ? JSON.parse(stored)
        : (mockData.appointments as Appointment[]);

      if (!stored) {
        localStorage.setItem("appointments", JSON.stringify(allAppointments));
      }

      const userAppointments = allAppointments.filter(
        (apt) => apt.type === activeTab
      );

      setAppointments(userAppointments);
    } catch {
      const fallback = (mockData.appointments as Appointment[]).filter(
        (apt) => apt.type === activeTab
      );
      setAppointments(fallback);
    }
  }, [activeTab]);

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = (appointmentId: number, action: string) => {
    setOpenMenuId(null);
    
    switch (action) {
      case "view":
        alert(`📋 Viewing appointment details for #${appointmentId}`);
        break;
      case "reschedule":
        alert(`📅 Reschedule appointment #${appointmentId}\n\nSelect new date and time...`);
        break;
      case "query":
        alert(`💬 Quick Query\n\nSend a message to the doctor...`);
        break;
    }
  };

  const handleMakePayment = (appointment: Appointment) => {
    const doctor = mockData.doctors.find((d) => d.id === appointment.doctorId);
    const consultationFee = doctor?.consultationFee ?? 0;

    alert(
      `💳 Payment Details\n\n` +
      `Doctor: ${appointment.doctorName}\n` +
      `Consultation Fee: ₹${consultationFee}\n` +
      `Token: ${appointment.tokenNumber}\n\n` +
      `Proceeding to payment gateway...`
    );
  };

  return (
    <main className="main-container appointments-page">
      <div className="mobile-wrapper appointments-wrapper">
        {/* Header */}
        <div className="appointments-header">
          <button className="header-back-button" onClick={() => router.push("/home")}>
            <svg width="20" height="20" viewBox="0 0 " fill="black">
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1>Appointments</h1>
        </div>

        {/* Tabs */}
        <div className="appointments-tabs">
          <button
            className={`tab-button ${activeTab === "upcoming" ? "active" : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming
          </button>
          <button
            className={`tab-button ${activeTab === "completed" ? "active" : ""}`}
            onClick={() => setActiveTab("completed")}
          >
            Completed
          </button>
          <button
            className={`tab-button ${activeTab === "canceled" ? "active" : ""}`}
            onClick={() => setActiveTab("canceled")}
          >
            Canceled
          </button>
        </div>

        {/* Content */}
        {appointments.length === 0 ? (
          /* Empty State */
          <div className="appointments-empty">
            <div className="empty-illustration">
              <svg width="200" height="160" viewBox="0 0 200 160" fill="none">
                {/* Clipboard 1 */}
                <rect x="40" y="20" width="70" height="100" rx="8" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="2" transform="rotate(-8 75 70)"/>
                <rect x="46" y="10" width="24" height="8" rx="4" fill="#4DD9E8"/>
                <circle cx="58" cy="14" r="2" fill="white"/>
                
                {/* Clipboard 2 */}
                <rect x="90" y="40" width="70" height="100" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="2"/>
                <rect x="96" y="30" width="24" height="8" rx="4" fill="#5DE0EF"/>
                <circle cx="108" cy="34" r="2" fill="white"/>
                
                {/* Lines on clipboard */}
                <line x1="100" y1="60" x2="140" y2="60" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round"/>
                <line x1="100" y1="70" x2="145" y2="70" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round"/>
                <line x1="100" y1="80" x2="135" y2="80" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h2>You don't have an appointment yet</h2>
            <p>Please click the button below to book an appointment.</p>
            <button
              className="book-appointment-empty-button"
              onClick={() => router.push("/home")}
            >
              Book appointment
            </button>
          </div>
        ) : (
          /* Appointments List */
          <div className="appointments-list">
            {appointments.map((appointment) => {
              const doctor = (mockData.doctors as any[]).find(
                (d) => d.id === appointment.doctorId
              );

              const initials = appointment.doctorName
                .split(" ")
                .map((n) => n[0])
                .join("");

              return (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-card-header">
                    <div className="appointment-doctor-image">
                      {doctor?.image ? (
                        <img
                          src={doctor.image}
                          alt={appointment.doctorName}
                          className="appointment-doctor-photo"
                        />
                      ) : (
                        <div className="appointment-doctor-placeholder">
                          {initials}
                        </div>
                      )}
                    </div>
                    <div className="appointment-doctor-info">
                      <h3>{appointment.doctorName}</h3>
                      <div className="appointment-info-row">
                        <span className="appointment-info-item">
                          Token no - {appointment.tokenNumber}
                        </span>
                      </div>
                      <div className="appointment-info-row">
                        <span className="appointment-info-item time">
                          {appointment.reportingTime}
                        </span>
                      </div>
                      <div className="appointment-info-row">
                        <span className="appointment-info-item payment">
                          Payment | {appointment.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                {/* Menu Button */}
                <button
                  className="appointment-menu-button"
                  onClick={() => setOpenMenuId(openMenuId === appointment.id ? null : appointment.id)}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="4" r="1.5" fill="currentColor"/>
                    <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
                    <circle cx="10" cy="16" r="1.5" fill="currentColor"/>
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {openMenuId === appointment.id && (
                  <div className="appointment-menu" ref={menuRef}>
                    <button
                      className="menu-item"
                      onClick={() => handleMenuClick(appointment.id, "view")}
                    >
                      View
                    </button>
                    <button
                      className="menu-item"
                      onClick={() => handleMenuClick(appointment.id, "reschedule")}
                    >
                      Reschedule
                    </button>
                    <button
                      className="menu-item"
                      onClick={() => handleMenuClick(appointment.id, "query")}
                    >
                      Quick Query
                    </button>
                  </div>
                )}

                {/* Payment CTA */}
                {appointment.paymentStatus === "not paid" && (
                  <div className="payment-cta">
                    <span className="payment-cta-text">
                      Reduce your waiting time and visiting time by paying the consulting fee upfront
                    </span>
                    <button
                      className="make-payment-button"
                      onClick={() => handleMakePayment(appointment)}
                    >
                      Make Payment
                    </button>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}

        {/* Bottom Navigation */}
        <nav className="bottom-nav">
          <button
            className={`nav-item ${activeBottomTab === 'find' ? 'active' : ''}`}
            onClick={() => {
              setActiveBottomTab('find');
              router.push("/home");
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Find a Doctor</span>
          </button>

          <button
            className={`nav-item ${activeBottomTab === 'appointments' ? 'active' : ''}`}
            onClick={() => {
              setActiveBottomTab('appointments');
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Appoint.</span>
          </button>

          <button
            className={`nav-item ${activeBottomTab === 'records' ? 'active' : ''}`}
            onClick={() => {
              setActiveBottomTab('records');
              alert('📋 Medical Records:\n\n• Lab Reports: 3\n• Prescriptions: 7\n• Visit History: 12\n• Vaccination Records: 4');
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 14L11 16L15 12M7 3H17C18.1046 3 19 3.89543 19 5V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Records</span>
          </button>

          <button
            className={`nav-item ${activeBottomTab === 'profile' ? 'active' : ''}`}
            onClick={() => {
              setActiveBottomTab('profile');
              if (confirm('🚪 Do you want to logout?')) {
                localStorage.removeItem("verificationPhone");
                localStorage.removeItem("userEmail");
                localStorage.removeItem("socialLogin");
                localStorage.removeItem("favorites");
                router.push("/");
              }
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M5 20C5 16.6863 7.68629 14 11 14H13C16.3137 14 19 16.6863 19 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Profile</span>
          </button>
        </nav>
      </div>
    </main>
  );
}