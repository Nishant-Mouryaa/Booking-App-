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

    // Persist appointments list in localStorage, seeded from mock data
    try {
      const stored = localStorage.getItem("appointments");
      const baseAppointments = stored
        ? JSON.parse(stored)
        : (mockData.appointments as any[]);

      const updatedAppointments = [...baseAppointments, newAppointment];
      localStorage.setItem("appointments", JSON.stringify(updatedAppointments));
    } catch {
      // If anything goes wrong, at least keep the last booking
    }

    // Save last booked appointment for scheduled page
    localStorage.setItem("lastBooking", JSON.stringify(newAppointment));

    setIsBooking(false);

    router.push("/appointment-scheduled");
  };

  if (!doctor) {
    return (
      <div className="main-container">
        <div className="mobile-wrapper">
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <p>Loading doctor details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="main-container appointment-page">
      <div className="mobile-wrapper appointment-wrapper">
        {/* Header */}
        <div className="appointment-header">
          <button className="header-back-button" onClick={() => router.back()}>
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
          <h1>Book Appointment</h1>
        </div>

        {/* Doctor Profile Card */}
        <div className="doctor-profile-card">
          <div className="doctor-profile-header">
            <div className="doctor-profile-info">
              <h2 className="doctor-profile-name">{doctor.name}</h2>
              <p className="doctor-profile-specialty">{doctor.specialty}</p>
              <p className="doctor-profile-qualification">{doctor.qualification}</p>
              <p className="doctor-profile-affiliation">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M6 1C4.067 1 2.5 2.567 2.5 4.5C2.5 6.75 6 11 6 11C6 11 9.5 6.75 9.5 4.5C9.5 2.567 7.933 1 6 1Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <circle cx="6" cy="4.5" r="1" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
                {doctor.affiliation}
              </p>
            </div>
            <div className="doctor-profile-image">
              {doctor.image ? (
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="doctor-profile-photo"
                />
              ) : (
                <div className="doctor-profile-placeholder">
                  {doctor.name.split(" ").map((n) => n[0]).join("")}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="doctor-stats">
            <div className="stat-item">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="stat-value">{doctor.patients}</span>
              <span className="stat-label">patients</span>
            </div>

            <div className="stat-item">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="stat-value">{doctor.experience}</span>
              <span className="stat-label">years exper.</span>
            </div>

            <div className="stat-item">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span className="stat-value">{doctor.rating}</span>
              <span className="stat-label">rating</span>
            </div>

            <div className="stat-item">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="stat-value">{doctor.reviews.toLocaleString()}</span>
              <span className="stat-label">reviews</span>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="appointment-content">
          {/* About Doctor */}
          <div className="info-section">
            <h3 className="section-title">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path d="M10 10V14M10 6V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              About Doctor
            </h3>
            <p className="section-text">{doctor.about}</p>
          </div>

          {/* Service & Specialization */}
          <div className="info-section">
            <h3 className="section-title">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 2L12.5 7L18 8L14 12L15 18L10 15L5 18L6 12L2 8L7.5 7L10 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              Service & Specialization
            </h3>
            <div className="service-grid">
              <div className="service-item">
                <span className="service-label">Service</span>
                <span className="service-value">{doctor.service}</span>
              </div>
              <div className="service-item">
                <span className="service-label">Specialization</span>
                <span className="service-value">{doctor.specialization}</span>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="info-section">
            <h3 className="section-title">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 6V10L13 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Availability For Consulting
            </h3>
            <div className="availability-row">
              <span className="availability-label">{doctor.availability.days}</span>
              <span className="availability-value">{doctor.availability.hours}</span>
            </div>
          </div>
        </div>

        {/* Book Button */}
        <div className="book-appointment-footer">
          <button
            className="book-appointment-button"
            onClick={handleBookAppointment}
            disabled={isBooking || !doctor.available}
          >
            {isBooking ? "Booking..." : doctor.available ? "Book appointment" : "Currently Unavailable"}
          </button>
        </div>
      </div>
    </main>
  );
}