"use client";

import { useState, useEffect, useMemo } from "react";
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
  const [notifications, setNotifications] = useState(3);
  const [userName, setUserName] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSpecialty, setActiveSpecialty] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>(mockData.doctors as Doctor[]);

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (!storedEmail) {
      router.push("/login");
      return;
    }
    setUserName(mockData.testUser.name);

    
    




    // Merge any doctor-side overrides from localStorage so that
    // edits made in the doctor dashboard are reflected here.
    try {
      const raw = localStorage.getItem("doctorOverrides");
      if (raw) {
        const overrides = JSON.parse(raw) as Record<
          number,
          Partial<Doctor> & {
            availabilityDays?: string;
            availabilityHours?: string;
          }
        >;
        const merged = (mockData.doctors as Doctor[]).map((doc) => {
          const ov = overrides[doc.id];
          if (!ov) return doc;
          const availability =
            "availabilityDays" in ov || "availabilityHours" in ov
              ? {
                  ...(doc as any).availability,
                  days: ov.availabilityDays ?? (doc as any).availability?.days,
                  hours:
                    ov.availabilityHours ?? (doc as any).availability?.hours,
                }
              : (doc as any).availability;
          const { availabilityDays, availabilityHours, ...rest } = ov as any;
          return {
            ...doc,
            ...rest,
            availability,
          } as Doctor;
        });
        setDoctors(merged);
      }
    } catch {
      setDoctors(mockData.doctors as Doctor[]);
    }
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
  }, [router]);

  useEffect(() => {
    const loadDoctorsWithOverrides = () => {
      try {
        const raw = localStorage.getItem("doctorOverrides");
        if (raw) {
          const overrides = JSON.parse(raw) as Record<
            number,
            Partial<Doctor> & {
              availabilityDays?: string;
              availabilityHours?: string;
            }
          >;
          const merged = (mockData.doctors as Doctor[]).map((doc) => {
            const ov = overrides[doc.id];
            if (!ov) return doc;
            const availability =
              "availabilityDays" in ov || "availabilityHours" in ov
                ? {
                    ...(doc as any).availability,
                    days: ov.availabilityDays ?? (doc as any).availability?.days,
                    hours: ov.availabilityHours ?? (doc as any).availability?.hours,
                  }
                : (doc as any).availability;
            const { availabilityDays, availabilityHours, ...rest } = ov as any;
            return { ...doc, ...rest, availability } as Doctor;
          });
          setDoctors(merged);
        } else {
          setDoctors(mockData.doctors as Doctor[]);
        }
      } catch {
        setDoctors(mockData.doctors as Doctor[]);
      }
    };
  
    // Initial load
    const storedEmail = localStorage.getItem("userEmail");
    if (!storedEmail) {
      router.push("/login");
      return;
    }
    setUserName(mockData.testUser.name);
    loadDoctorsWithOverrides();
  
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
  
    // Re-read overrides when tab regains focus
    const handleFocus = () => {
      loadDoctorsWithOverrides();
    };
  
    // Re-read overrides when localStorage changes in another tab
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "doctorOverrides") {
        loadDoctorsWithOverrides();
      }
    };
  
    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);
  
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
    };
  }, [router]);

  // Specialties derived from doctors
  const specialties = useMemo(() => {
    const specs = Array.from(new Set(doctors.map((d) => d.specialty)));
    return ["All", ...specs];
  }, [doctors]);

  // Filtered doctors
  const filteredDoctors = useMemo(() => {
    let docs = doctors as Doctor[];
    if (activeSpecialty !== "All") {
      docs = docs.filter((d) => d.specialty === activeSpecialty);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q)
      );
    }
    return docs;
  }, [searchQuery, activeSpecialty, doctors]);

  const toggleFavorite = (doctorId: number) => {
    const updated = favorites.includes(doctorId)
      ? favorites.filter((id) => id !== doctorId)
      : [...favorites, doctorId];
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const handleDoctorClick = (doctor: Doctor) => {
    router.push(`/appointment/${doctor.id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("verificationPhone");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("socialLogin");
    localStorage.removeItem("favorites");
    router.push("/login");
  };

  const handleNotificationClick = () => {
    setNotifications(0);
    alert(
      "📬 Notifications:\n\n✓ Appointment with Dr. Prakash Das confirmed for tomorrow 10:00 AM\n✓ Dr. Sarah Johnson sent you a message\n✓ 2 new doctors available in your area"
    );
  };

  const navItems = [
    {
      id: "find",
      label: "Find a Doctor",
      shortLabel: "Find",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      action: () => setActiveTab("find"),
    },
    {
      id: "appointments",
      label: "Appointments",
      shortLabel: "Appoint.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      action: () => {
        setActiveTab("appointments");
        router.push("/appointments");
      },
    },
    {
      id: "records",
      label: "Medical Records",
      shortLabel: "Records",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M9 14L11 16L15 12M7 3H17C18.1046 3 19 3.89543 19 5V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      action: () => {
        setActiveTab("records");
        alert("📋 Medical Records coming soon!");
      },
    },
    {
      id: "profile",
      label: "Profile",
      shortLabel: "Profile",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M5 20C5 16.6863 7.68629 14 11 14H13C16.3137 14 19 16.6863 19 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      action: () => {
        setActiveTab("profile");
        if (confirm("Do you want to logout?")) handleLogout();
      },
    },
  ];

  const upcomingCount = mockData.appointments.filter(
    (a) => a.type === "upcoming"
  ).length;

  return (
    <div className="hp">
      {/* ========== SIDEBAR (Desktop) ========== */}
      <aside className={`hp-sidebar ${sidebarCollapsed ? "hp-sidebar--collapsed" : ""}`}>
        <div className="hp-sidebar__head">
          <div className="hp-sidebar__logo">
            <div className="hp-sidebar__logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            {!sidebarCollapsed && <span className="hp-sidebar__logo-text">Shedula</span>}
          </div>
          <button className="hp-sidebar__toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              {sidebarCollapsed ? (
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              ) : (
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              )}
            </svg>
          </button>
        </div>

        <nav className="hp-sidebar__nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`hp-sidebar__link ${activeTab === item.id ? "hp-sidebar__link--active" : ""}`}
              onClick={item.action}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="hp-sidebar__link-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="hp-sidebar__link-label">{item.label}</span>}
              {item.id === "appointments" && upcomingCount > 0 && !sidebarCollapsed && (
                <span className="hp-sidebar__badge">{upcomingCount}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar User Card */}
        {!sidebarCollapsed && (
          <div className="hp-sidebar__user">
            <div className="hp-sidebar__user-avatar">
              {mockData.testUser.avatar ? (
                <img src={mockData.testUser.avatar} alt={userName} />
              ) : (
                <span>{userName.charAt(0)}</span>
              )}
            </div>
            <div className="hp-sidebar__user-info">
              <span className="hp-sidebar__user-name">{userName}</span>
              <span className="hp-sidebar__user-email">{mockData.testUser.email}</span>
            </div>
            <button className="hp-sidebar__logout" onClick={() => { if (confirm("Logout?")) handleLogout(); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="hp-sidebar__foot-collapsed">
            <button className="hp-sidebar__link hp-sidebar__link--logout" onClick={() => { if (confirm("Logout?")) handleLogout(); }} title="Logout">
              <span className="hp-sidebar__link-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
          </div>
        )}
      </aside>

      {/* ========== MAIN ========== */}
      <main className="hp-main">
        {/* ---- Top Bar ---- */}
        <header className="hp-topbar">
          <div className="hp-topbar__left">
            <div className="hp-topbar__avatar">
              {mockData.testUser.avatar ? (
                <img src={mockData.testUser.avatar} alt={userName} />
              ) : (
                <span>{userName.charAt(0)}</span>
              )}
            </div>
            <div className="hp-topbar__greeting">
              <span className="hp-topbar__hello">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},</span>
              <h1 className="hp-topbar__name">{userName} 👋</h1>
            </div>
          </div>

          <div className="hp-topbar__right">
            {/* Desktop Search */}
            <div className="hp-topbar__search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="hp-topbar__search-icon">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search doctors, specialties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hp-topbar__search-input"
              />
              {searchQuery && (
                <button className="hp-topbar__search-clear" onClick={() => setSearchQuery("")}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Mobile Search Toggle */}
            <button className="hp-topbar__icon-btn hp-topbar__search-toggle" onClick={() => setShowMobileSearch(!showMobileSearch)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            <button className="hp-topbar__icon-btn" onClick={handleNotificationClick}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {notifications > 0 && <span className="hp-topbar__notif-dot">{notifications}</span>}
            </button>

            <button className="hp-topbar__icon-btn hp-topbar__logout-btn" onClick={() => { if (confirm("Logout?")) handleLogout(); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </header>

        {/* Mobile Search Bar (expandable) */}
        {showMobileSearch && (
          <div className="hp-mobile-search">
            <div className="hp-mobile-search__inner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hp-mobile-search__input"
                autoFocus
              />
              <button onClick={() => { setShowMobileSearch(false); setSearchQuery(""); }}>
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ---- Scrollable Content ---- */}
        <div className="hp-scroll">
          {/* Hero Banner */}
          <section className="hp-hero">
            <div className="hp-hero__content">
              <div className="hp-hero__text">
                <h2 className="hp-hero__title">Find &amp; Book <br/><span>Top Doctors</span></h2>
                <p className="hp-hero__desc">
                  Get expert medical care from verified professionals. Book your appointment in minutes.
                </p>
                <div className="hp-hero__stats">
                  <div className="hp-hero__stat">
                    <strong>{doctors.filter(d => d.available).length}</strong>
                    <span>Available Now</span>
                  </div>
                  <div className="hp-hero__stat-divider" />
                  <div className="hp-hero__stat">
                    <strong>{upcomingCount}</strong>
                    <span>Upcoming</span>
                  </div>
                  <div className="hp-hero__stat-divider" />
                  <div className="hp-hero__stat">
                    <strong>{favorites.length}</strong>
                    <span>Favorites</span>
                  </div>
                </div>
              </div>
              <div className="hp-hero__illustration">
                <svg width="200" height="160" viewBox="0 0 200 160" fill="none">
                  <circle cx="100" cy="80" r="70" fill="rgba(255,255,255,0.15)"/>
                  <circle cx="100" cy="80" r="50" fill="rgba(255,255,255,0.1)"/>
                  <path d="M100 50v60M70 80h60" stroke="rgba(255,255,255,0.6)" strokeWidth="6" strokeLinecap="round"/>
                  <circle cx="60" cy="45" r="8" fill="rgba(255,255,255,0.2)"/>
                  <circle cx="150" cy="110" r="12" fill="rgba(255,255,255,0.12)"/>
                  <circle cx="45" cy="115" r="6" fill="rgba(255,255,255,0.15)"/>
                </svg>
              </div>
            </div>
          </section>

          {/* Specialty Chips */}
          <section className="hp-specialties">
            <div className="hp-specialties__scroll">
              {specialties.map((spec) => (
                <button
                  key={spec}
                  className={`hp-chip ${activeSpecialty === spec ? "hp-chip--active" : ""}`}
                  onClick={() => setActiveSpecialty(spec)}
                >
                  {spec}
                </button>
              ))}
            </div>
          </section>

          {/* Doctors Section */}
          <section className="hp-doctors">
            <div className="hp-doctors__head">
              <div>
                <h2 className="hp-doctors__title">
                  {searchQuery
                    ? `Results for "${searchQuery}"`
                    : activeSpecialty !== "All"
                    ? activeSpecialty
                    : "Recommended Doctors"}
                </h2>
                <p className="hp-doctors__subtitle">{filteredDoctors.length} doctors found</p>
              </div>
              {/* View Toggle — Desktop */}
              <div className="hp-doctors__view-toggle">
                <button
                  className={`hp-view-btn ${viewMode === "grid" ? "hp-view-btn--active" : ""}`}
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
                    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
                    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
                    <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
                <button
                  className={`hp-view-btn ${viewMode === "list" ? "hp-view-btn--active" : ""}`}
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {filteredDoctors.length > 0 ? (
              <div className={`hp-doctors__grid ${viewMode === "list" ? "hp-doctors__grid--list" : ""}`}>
                {filteredDoctors.map((doctor, idx) => (
                  <article
                    key={doctor.id}
                    className={`hp-doc ${viewMode === "list" ? "hp-doc--list" : ""}`}
                    onClick={() => handleDoctorClick(doctor)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleDoctorClick(doctor)}
                    style={{ animationDelay: `${idx * 0.06}s` }}
                  >
                    {/* Favorite Button */}
                    <button
                      className={`hp-doc__fav ${favorites.includes(doctor.id) ? "hp-doc__fav--active" : ""}`}
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(doctor.id); }}
                      aria-label="Toggle favorite"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                          fill={favorites.includes(doctor.id) ? "#ef4444" : "none"}
                          stroke={favorites.includes(doctor.id) ? "#ef4444" : "currentColor"}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    {/* Image */}
                    <div className="hp-doc__img-wrap">
                      {doctor.image ? (
                        <img src={doctor.image} alt={doctor.name} className="hp-doc__img" />
                      ) : (
                        <div className="hp-doc__img-placeholder">
                          {doctor.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                      )}
                      <span className={`hp-doc__status ${doctor.available ? "hp-doc__status--on" : ""}`} />
                    </div>

                    {/* Info */}
                    <div className="hp-doc__info">
                      <h3 className="hp-doc__name">{doctor.name}</h3>
                      <p className="hp-doc__spec">{doctor.specialty}</p>

                      <div className="hp-doc__meta">
                        <span className="hp-doc__rating">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="#FBBF24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          {doctor.rating}
                        </span>
                        <span className="hp-doc__exp">{doctor.experience} yrs exp</span>
                      </div>

                      <div className="hp-doc__bottom">
                        <span className="hp-doc__fee">₹{doctor.consultationFee}</span>
                        <button
                          className={`hp-doc__book ${!doctor.available ? "hp-doc__book--disabled" : ""}`}
                          onClick={(e) => { e.stopPropagation(); handleDoctorClick(doctor); }}
                          disabled={!doctor.available}
                        >
                          {doctor.available ? "Book Now" : "Unavailable"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="hp-empty">
                <div className="hp-empty__icon">
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="#D1D5DB" strokeWidth="2"/>
                    <path d="M21 21l-4.35-4.35" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3>No doctors found</h3>
                <p>Try a different specialty or search term</p>
                <button className="hp-empty__btn" onClick={() => { setSearchQuery(""); setActiveSpecialty("All"); }}>
                  Clear Filters
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ========== MOBILE BOTTOM NAV ========== */}
      <nav className="hp-bottom">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`hp-bottom__item ${activeTab === item.id ? "hp-bottom__item--active" : ""}`}
            onClick={item.action}
          >
            {item.icon}
            <span>{item.shortLabel}</span>
            {item.id === "appointments" && upcomingCount > 0 && (
              <span className="hp-bottom__badge">{upcomingCount}</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}