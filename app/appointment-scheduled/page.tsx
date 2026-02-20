"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import mockData from "@/data/mockData.json";
import "./scheduled.css";

export default function AppointmentScheduledPage() {
  const router = useRouter();
  const [appointment, setAppointment] = useState<any>(null);

  useEffect(() => {
    // Get the last booked appointment from localStorage
    const lastBooking = localStorage.getItem("lastBooking");
    if (lastBooking) {
      setAppointment(JSON.parse(lastBooking));
    } else {
      // Fallback to first appointment in mock data
      if (mockData.appointments.length > 0) {
        setAppointment(mockData.appointments[0]);
      }
    }
  }, []);

  const handleAddToCalendar = () => {
    alert("📅 Adding to calendar...\n\nThis would integrate with device calendar API");
  };

  const handleAddPatientDetails = () => {
    alert("👤 Add Patient Details\n\nPatient information form would open here:\n- Name\n- Age\n- Gender\n- Medical History\n- Allergies\n- Current Medications");
  };

  const handleViewAppointment = () => {
    router.push("/appointments");
  };

  if (!appointment) {
    return (
      <div className="main-container">
        <div className="mobile-wrapper">
          <p style={{ padding: "40px 20px", textAlign: "center" }}>Loading...</p>
        </div>
      </div>
    );
  }

  const doctor = (mockData.doctors as any[]).find(
    (d) => d.id === appointment.doctorId
  );

  return (
    <main className="main-container scheduled-page">
      <div className="mobile-wrapper scheduled-wrapper">
        {/* Header */}
        <div className="scheduled-header">
          <button className="header-back-button" onClick={() => router.push("/home")}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1>Appointment Scheduled</h1>
        </div>

        {/* Doctor Card */}
        <div className="scheduled-doctor-card">
          <div className="scheduled-doctor-image">
            {doctor?.image ? (
              <img
                src={doctor.image}
                alt={appointment.doctorName}
                className="scheduled-doctor-photo"
              />
            ) : (
              <div className="scheduled-doctor-placeholder">
                {appointment.doctorName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </div>
            )}
          </div>
          <div className="scheduled-doctor-info">
            <h2>{appointment.doctorName}</h2>
            <p>{appointment.doctorSpecialty}</p>
            <p className="qualification">{appointment.doctorQualification}</p>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="appointment-details-card">
          <div className="appointment-number">
            <label>Appointment Number:</label>
            <div className="number">#{appointment.appointmentNumber}</div>
          </div>

          <div className="appointment-status-row">
            <div className="status-item">
              <label>Status</label>
              <div className={`value ${appointment.status}`}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </div>
            </div>
            <div className="status-item">
              <label>Reporting Time</label>
              <div className="value">{appointment.reportingTime}</div>
            </div>
          </div>

          <button className="add-calendar-button" onClick={handleAddToCalendar}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M13 2V6M7 2V6M3 8H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Add to calendar
          </button>
        </div>

        {/* Patient Details */}
        <div className="patient-details-section">
          <h3>Add Patient Details</h3>
          <button className="add-patient-button" onClick={handleAddPatientDetails}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add Patient Details
          </button>
        </div>

        {/* Bottom Button */}
        <div className="scheduled-footer">
          <button className="view-appointment-button" onClick={handleViewAppointment}>
            View My Appointment
          </button>
        </div>
      </div>
    </main>
  );
}