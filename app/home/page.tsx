"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import mockData from "@/data/mockData.json";
import "./home.css";

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  available: boolean;
  timing: string;
  description: string;
  image: string;
  rating: number;
  consultationFee: number;
}

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("find");
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>(mockData.doctors);
  const [notifications, setNotifications] = useState(3);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (!storedEmail) {
      router.push("/");
      return;
    }
    setUserName(mockData.testUser.name);

    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, [router]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredDoctors(mockData.doctors);
    } else {
      const filtered = mockData.doctors.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDoctors(filtered);
    }
  }, [searchQuery]);

  const toggleFavorite = (doctorId: number) => {
    const newFavorites = favorites.includes(doctorId)
      ? favorites.filter((id) => id !== doctorId)
      : [...favorites, doctorId];
    
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
  };

const handleDoctorClick = (doctor: Doctor) => {
  router.push(`/appointment/${doctor.id}`);
};

  const handleLogout = () => {
    localStorage.removeItem("verificationPhone");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("socialLogin");
    localStorage.removeItem("favorites");
    router.push("/");
  };

  const handleNotificationClick = () => {
    setNotifications(0);
    alert("📬 Notifications:\n\n✓ Your appointment with Dr. Prakash Das is confirmed for tomorrow at 10:00 AM\n✓ Dr. Sarah Johnson sent you a message\n✓ 2 new doctors available in your area");
  };

  return (
    <main className="main-container home-main">
      <div className="mobile-wrapper home-wrapper">
        {/* Header */}
        <div className="home-header">
          <div className="user-info">
            <div className="user-avatar">
              {mockData.testUser.avatar ? (
                <img
                  src={mockData.testUser.avatar}
                  alt={userName || "User avatar"}
                  className="user-avatar-image"
                />
              ) : (
                <div className="avatar-placeholder">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="user-details">
              <h2 className="user-greeting">Hello, {userName}</h2>
              <p className="user-location">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1C4.79 1 3 2.79 3 5C3 7.5 7 13 7 13C7 13 11 7.5 11 5C11 2.79 9.21 1 7 1Z" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="7" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                {mockData.testUser.location}
              </p>
            </div>
          </div>
          <div className="home-header-actions">
            <button className="notification-button" onClick={handleNotificationClick}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 6.44V9.77M12.02 2C8.34 2 5.36 4.98 5.36 8.66V10.76C5.36 11.44 5.08 12.46 4.73 13.04L3.46 15.16C2.68 16.47 3.22 17.93 4.66 18.41C9.44 20 14.61 20 19.39 18.41C20.74 17.96 21.32 16.38 20.59 15.16L19.32 13.04C18.97 12.46 18.69 11.43 18.69 10.76V8.66C18.68 5 15.68 2 12.02 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M15.33 18.82C15.33 20.65 13.83 22.15 12 22.15C11.09 22.15 10.25 21.77 9.65 21.17C9.05 20.57 8.67 19.73 8.67 18.82" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              {notifications > 0 && <span className="notification-badge">{notifications}</span>}
            </button>
            <button
              className="logout-button"
              onClick={() => {
                if (confirm("🚪 Do you want to logout?")) {
                  handleLogout();
                }
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-wrapper">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="search-icon">
              <path d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 19L14.65 14.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search Doctors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery("")}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Doctors List - Compact Cards */}
        <div className="doctors-list">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="doctor-card-compact">
                <div className="compact-left">
                  <div className="doctor-image-compact">
                    {doctor.image ? (
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="doctor-photo-compact"
                      />
                    ) : (
                      <div className="doctor-placeholder-compact">
                        {doctor.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                    <div className={`status-indicator ${doctor.available ? 'online' : 'offline'}`}></div>
                  </div>
                </div>
                
                <div className="compact-center">
                  <div className="compact-header">
                    <h3 className="doctor-name-compact">{doctor.name}</h3>
                    <span className="experience-badge">{doctor.experience} exp</span>
                  </div>
                  <p className="doctor-specialty-compact">{doctor.specialty}</p>
                  <div className="compact-info">
                    <span className="info-item">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M7 4V7L9 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      {doctor.timing.split('-')[0].trim()}
                    </span>
                    <span className="info-item">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 1L8.5 4.5L12.5 5.2L9.75 7.9L10.5 12L7 10L3.5 12L4.25 7.9L1.5 5.2L5.5 4.5L7 1Z" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                      {doctor.rating}
                    </span>
                    <span className="info-item">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13Z" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M7 4V7H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      ₹{doctor.consultationFee}
                    </span>
                  </div>
                </div>
                
                <div className="compact-right">
                  <button
                    className={`favorite-icon ${favorites.includes(doctor.id) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(doctor.id);
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M10 17L8.55 15.7C4.4 12.1 1.5 9.5 1.5 6.5C1.5 4.4 3.05 2.85 5.15 2.85C6.32 2.85 7.45 3.35 8.19 4.14C8.52 4.5 8.79 4.89 9 5.32C9.21 4.89 9.48 4.5 9.81 4.14C10.55 3.35 11.68 2.85 12.85 2.85C14.95 2.85 16.5 4.4 16.5 6.5C16.5 9.5 13.6 12.1 9.45 15.7L10 17Z"
                        fill={favorites.includes(doctor.id) ? "#EF4444" : "none"}
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </button>
                  <button
                    className="book-compact"
                    onClick={() => handleDoctorClick(doctor)}
                    disabled={!doctor.available}
                  >
                    Book
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="#E5E7EB" strokeWidth="2"/>
                <path d="M32 20V32M32 40V42" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              <p>No doctors found matching "{searchQuery}"</p>
              <button onClick={() => setSearchQuery("")} className="reset-search">
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <nav className="bottom-nav">
          <button
            className={`nav-item ${activeTab === 'find' ? 'active' : ''}`}
            onClick={() => setActiveTab('find')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Find a Doctor</span>
          </button>
          
<button
  className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`}
  onClick={() => {
    setActiveTab('appointments');
    router.push('/appointments');
  }}
>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
  <span>Appoint.</span>
</button>
          
          <button
            className={`nav-item ${activeTab === 'records' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('records');
              alert('📋 Medical Records:\n\n• Lab Reports: 3\n• Prescriptions: 7\n• Visit History: 12\n• Vaccination Records: 4');
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 14L11 16L15 12M7 3H17C18.1046 3 19 3.89543 19 5V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Records</span>
          </button>
          
          <button
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('profile');
              if (confirm('🚪 Do you want to logout?')) {
                handleLogout();
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