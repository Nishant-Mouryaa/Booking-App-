"use client";

import { useState, useEffect, useRef, useCallback, type JSX } from "react";
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

interface BookedSlot {
  doctorId: number;
  date: string;
  time: string;
  bookedBy: string;
  appointmentId: number;
}

type TabType = "upcoming" | "completed" | "canceled";

/* ---- Confirm Modal ---- */
function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  confirmVariant = "danger",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="ap-modal-overlay" onClick={onCancel}>
      <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
        <div className={`ap-modal__icon ${confirmVariant}`}>
          {confirmVariant === "danger" ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M12 8v4m0 4h.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>
        <h3 className="ap-modal__title">{title}</h3>
        <p className="ap-modal__msg">{message}</p>
        <div className="ap-modal__actions">
          <button
            className="ap-modal__btn ap-modal__btn--cancel"
            onClick={onCancel}
          >
            Go Back
          </button>
          <button
            className={`ap-modal__btn ap-modal__btn--confirm ${confirmVariant}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- Toast ---- */
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  const icons: Record<string, JSX.Element> = {
    success: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
        <path
          d="M7 10l2 2 4-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    error: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 8l-4 4m0-4l4 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    info: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
        <path
          d="M10 9v4m0-6h.01"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  };
  return (
    <div className={`ap-toast ap-toast--${type}`}>
      <span className="ap-toast__icon">{icons[type]}</span>
      <span className="ap-toast__msg">{message}</span>
      <button className="ap-toast__close" onClick={onClose}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path
            d="M12 4L4 12M4 4l8 8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const menuRef = useRef<HTMLDivElement>(null);

  const [modal, setModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    confirmVariant: "danger" | "primary";
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    message: "",
    confirmLabel: "",
    confirmVariant: "danger",
    onConfirm: () => {},
  });

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ show: false, message: "", type: "info" });

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      setToast({ show: true, message, type });
    },
    []
  );

  // Helper: free a booked slot when canceling/rescheduling
  const freeBookedSlot = (appointmentId: number) => {
    try {
      const stored = localStorage.getItem("bookedSlots");
      if (stored) {
        const slots: BookedSlot[] = JSON.parse(stored);
        const updatedSlots = slots.filter(
          (s) => s.appointmentId !== appointmentId
        );
        localStorage.setItem("bookedSlots", JSON.stringify(updatedSlots));
      }
    } catch {
      // fallback silently
    }
  };

  // Helper: free slot by doctor + date + time (for legacy appointments without appointmentId)
  const freeBookedSlotByDetails = (
    doctorId: number,
    date: string,
    time: string
  ) => {
    try {
      const stored = localStorage.getItem("bookedSlots");
      if (stored) {
        const slots: BookedSlot[] = JSON.parse(stored);
        const updatedSlots = slots.filter(
          (s) =>
            !(s.doctorId === doctorId && s.date === date && s.time === time)
        );
        localStorage.setItem("bookedSlots", JSON.stringify(updatedSlots));
      }
    } catch {
      // fallback silently
    }
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (!storedEmail) {
      router.push("/login");
      return;
    }
    try {
      const stored = localStorage.getItem("appointments");
      const data: Appointment[] = stored
        ? JSON.parse(stored)
        : (mockData.appointments as Appointment[]);
      if (!stored) localStorage.setItem("appointments", JSON.stringify(data));
      setAllAppointments(data);
    } catch {
      setAllAppointments(mockData.appointments as Appointment[]);
    }
  }, [router]);

  useEffect(() => {
    let filtered = allAppointments.filter((a) => a.type === activeTab);
    filtered.sort(
      sortBy === "date"
        ? (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        : (a, b) => a.doctorName.localeCompare(b.doctorName)
    );
    setAppointments(filtered);
  }, [activeTab, allAppointments, sortBy]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const persist = (updated: Appointment[]) => {
    setAllAppointments(updated);
    localStorage.setItem("appointments", JSON.stringify(updated));
  };

  const handleCancel = (apt: Appointment) => {
    setOpenMenuId(null);
    setModal({
      open: true,
      title: "Cancel Appointment",
      message: `Cancel your appointment with ${apt.doctorName} on ${apt.date} at ${apt.time}?\n\nThis action cannot be undone. The time slot will be freed for others to book.`,
      confirmLabel: "Yes, Cancel",
      confirmVariant: "danger",
      onConfirm: () => {
        // Free the booked slot
        freeBookedSlot(apt.id);
        freeBookedSlotByDetails(apt.doctorId, apt.date, apt.time);

        persist(
          allAppointments.map((a) =>
            a.id === apt.id
              ? { ...a, type: "canceled", status: "Canceled" }
              : a
          )
        );
        setModal((p) => ({ ...p, open: false }));
        showToast(
          `Appointment with ${apt.doctorName} canceled. Time slot is now available.`,
          "success"
        );
      },
    });
  };

  const handleReschedule = (apt: Appointment) => {
    setOpenMenuId(null);
    setModal({
      open: true,
      title: "Reschedule",
      message: `Reschedule your appointment with ${apt.doctorName}?\n\nYour current slot (${apt.time} on ${apt.date}) will be freed and made available for others.`,
      confirmLabel: "Reschedule",
      confirmVariant: "primary",
      onConfirm: () => {
        // Free the current slot
        freeBookedSlot(apt.id);
        freeBookedSlotByDetails(apt.doctorId, apt.date, apt.time);

        // Cancel the current appointment
        persist(
          allAppointments.map((a) =>
            a.id === apt.id
              ? { ...a, type: "canceled", status: "Rescheduled" }
              : a
          )
        );

        setModal((p) => ({ ...p, open: false }));
        showToast("Redirecting to book a new slot...", "info");
        setTimeout(() => router.push(`/appointment/${apt.doctorId}`), 600);
      },
    });
  };

  const handleMarkComplete = (apt: Appointment) => {
    setOpenMenuId(null);
    // When marked complete, free the slot since the appointment is done
    freeBookedSlot(apt.id);
    freeBookedSlotByDetails(apt.doctorId, apt.date, apt.time);

    persist(
      allAppointments.map((a) =>
        a.id === apt.id
          ? { ...a, type: "completed", status: "Completed" }
          : a
      )
    );
    showToast(`Marked as completed`, "success");
  };

  const handlePay = (apt: Appointment) => {
    const fee =
      mockData.doctors.find((d) => d.id === apt.doctorId)?.consultationFee ?? 0;
    setModal({
      open: true,
      title: "Confirm Payment",
      message: `Pay ₹${fee} for ${apt.doctorName}?\nToken: ${apt.tokenNumber}`,
      confirmLabel: `Pay ₹${fee}`,
      confirmVariant: "primary",
      onConfirm: () => {
        persist(
          allAppointments.map((a) =>
            a.id === apt.id ? { ...a, paymentStatus: "paid" } : a
          )
        );
        setModal((p) => ({ ...p, open: false }));
        showToast(`₹${fee} payment successful!`, "success");
      },
    });
  };

  const handleReBook = (apt: Appointment) =>
    router.push(`/appointment/${apt.doctorId}`);

  const handleLogout = () => {
    ["verificationPhone", "userEmail", "socialLogin", "favorites"].forEach(
      (k) => localStorage.removeItem(k)
    );
    router.push("/login");
  };

  const tabCounts = {
    upcoming: allAppointments.filter((a) => a.type === "upcoming").length,
    completed: allAppointments.filter((a) => a.type === "completed").length,
    canceled: allAppointments.filter((a) => a.type === "canceled").length,
  };

  const navItems = [
    {
      id: "find",
      label: "Find a Doctor",
      short: "Find",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
          <path
            d="M21 21l-4.35-4.35"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
      action: () => router.push("/home"),
    },
    {
      id: "appointments",
      label: "Appointments",
      short: "Appoint.",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect
            x="3"
            y="4"
            width="18"
            height="18"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M16 2v4M8 2v4M3 10h18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
      action: () => {},
    },
    {
      id: "records",
      label: "Records",
      short: "Records",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 14l2 2 4-4M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      action: () => showToast("Coming soon!", "info"),
    },
    {
      id: "profile",
      label: "Profile",
      short: "Profile",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
          <path
            d="M5 20c0-3.31 2.69-6 6-6h2c3.31 0 6 2.69 6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
      action: () => {
        setModal({
          open: true,
          title: "Logout",
          message: "Are you sure?",
          confirmLabel: "Logout",
          confirmVariant: "danger",
          onConfirm: () => {
            setModal((p) => ({ ...p, open: false }));
            handleLogout();
          },
        });
      },
    },
  ];

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="ap">
      {/* ========== SIDEBAR ========== */}
      <aside
        className={`ap-sidebar ${
          sidebarCollapsed ? "ap-sidebar--collapsed" : ""
        }`}
      >
        <div className="ap-sidebar__head">
          <div className="ap-sidebar__logo">
            <div className="ap-sidebar__logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 4v16M4 12h16"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            {!sidebarCollapsed && (
              <span className="ap-sidebar__logo-text">Shedula</span>
            )}
          </div>
          <button
            className="ap-sidebar__toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              {sidebarCollapsed ? (
                <path
                  d="M9 18l6-6-6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </button>
        </div>

        <nav className="ap-sidebar__nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`ap-sidebar__link ${
                item.id === "appointments" ? "ap-sidebar__link--active" : ""
              }`}
              onClick={item.action}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="ap-sidebar__link-icon">{item.icon}</span>
              {!sidebarCollapsed && (
                <span className="ap-sidebar__link-label">{item.label}</span>
              )}
              {item.id === "appointments" &&
                tabCounts.upcoming > 0 &&
                !sidebarCollapsed && (
                  <span className="ap-sidebar__badge">
                    {tabCounts.upcoming}
                  </span>
                )}
            </button>
          ))}
        </nav>

        {!sidebarCollapsed && (
          <div className="ap-sidebar__user">
            <div className="ap-sidebar__avatar">
              {mockData.testUser.avatar ? (
                <img
                  src={mockData.testUser.avatar}
                  alt={mockData.testUser.name}
                />
              ) : (
                <span>{mockData.testUser.name.charAt(0)}</span>
              )}
            </div>
            <div className="ap-sidebar__user-info">
              <span className="ap-sidebar__user-name">
                {mockData.testUser.name}
              </span>
              <span className="ap-sidebar__user-email">
                {mockData.testUser.email}
              </span>
            </div>
            <button
              className="ap-sidebar__logout-btn"
              onClick={() => {
                if (confirm("Logout?")) handleLogout();
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="ap-sidebar__foot-collapsed">
            <button
              className="ap-sidebar__link ap-sidebar__link--logout"
              onClick={() => {
                if (confirm("Logout?")) handleLogout();
              }}
              title="Logout"
            >
              <span className="ap-sidebar__link-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          </div>
        )}
      </aside>

      {/* ========== MAIN ========== */}
      <main className="ap-main">
        {/* Header */}
        <header className="ap-topbar">
          <div className="ap-topbar__left">
            <button
              className="ap-topbar__back"
              onClick={() => router.push("/home")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 12H5M12 19l-7-7 7-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div>
              <h1 className="ap-topbar__title">Appointments</h1>
              <p className="ap-topbar__subtitle">Manage your bookings</p>
            </div>
          </div>
          <div className="ap-topbar__right">
            <div className="ap-topbar__sort">
              <label>Sort:</label>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "date" | "name")
                }
              >
                <option value="date">Date</option>
                <option value="name">Doctor</option>
              </select>
            </div>
            <button
              className="ap-topbar__new-btn"
              onClick={() => router.push("/home")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              <span>New Booking</span>
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="ap-tabs">
          {(["upcoming", "completed", "canceled"] as TabType[]).map((tab) => (
            <button
              key={tab}
              className={`ap-tabs__btn ${
                activeTab === tab ? "ap-tabs__btn--active" : ""
              }`}
              onClick={() => setActiveTab(tab)}
            >
              <span>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </span>
              {tabCounts[tab] > 0 && (
                <span
                  className={`ap-tabs__count ${
                    activeTab === tab ? "ap-tabs__count--active" : ""
                  }`}
                >
                  {tabCounts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="ap-content">
          {/* Summary Strip */}
          {activeTab === "upcoming" && appointments.length > 0 && (
            <div className="ap-summary">
              <div className="ap-summary__item">
                <div className="ap-summary__icon ap-summary__icon--blue">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M16 2v4M8 2v4M3 10h18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <strong>{tabCounts.upcoming}</strong>
                  <span>Upcoming</span>
                </div>
              </div>
              <div className="ap-summary__item">
                <div className="ap-summary__icon ap-summary__icon--amber">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <rect
                      x="2"
                      y="5"
                      width="20"
                      height="14"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M2 10h20"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div>
                  <strong>
                    {
                      appointments.filter((a) => a.paymentStatus !== "paid")
                        .length
                    }
                  </strong>
                  <span>Unpaid</span>
                </div>
              </div>
              <div className="ap-summary__item">
                <div className="ap-summary__icon ap-summary__icon--green">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M9 12l2 2 4-4m6 2a10 10 0 11-20 0 10 10 0 0120 0z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <strong>{tabCounts.completed}</strong>
                  <span>Completed</span>
                </div>
              </div>
            </div>
          )}

          {appointments.length === 0 ? (
            <div className="ap-empty">
              <div className="ap-empty__visual">
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 80 80"
                  fill="none"
                >
                  <rect
                    x="20"
                    y="12"
                    width="40"
                    height="56"
                    rx="6"
                    stroke="#CBD5E1"
                    strokeWidth="2.5"
                  />
                  <rect
                    x="28"
                    y="6"
                    width="16"
                    height="6"
                    rx="3"
                    fill="#94A3B8"
                  />
                  <line
                    x1="28"
                    y1="28"
                    x2="52"
                    y2="28"
                    stroke="#E2E8F0"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="28"
                    y1="36"
                    x2="48"
                    y2="36"
                    stroke="#E2E8F0"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="28"
                    y1="44"
                    x2="44"
                    y2="44"
                    stroke="#E2E8F0"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="58"
                    cy="58"
                    r="14"
                    fill="#EFF6FF"
                    stroke="#3B82F6"
                    strokeWidth="2"
                  />
                  <path
                    d="M58 52v12M52 58h12"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h2>
                {activeTab === "upcoming" && "No upcoming appointments"}
                {activeTab === "completed" && "No completed appointments"}
                {activeTab === "canceled" && "No canceled appointments"}
              </h2>
              <p>
                {activeTab === "upcoming" &&
                  "Book a doctor to get started"}
                {activeTab === "completed" &&
                  "Completed visits appear here"}
                {activeTab === "canceled" &&
                  "Canceled bookings appear here"}
              </p>
              {activeTab === "upcoming" && (
                <button
                  className="ap-empty__cta"
                  onClick={() => router.push("/home")}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  Book Now
                </button>
              )}
            </div>
          ) : (
            <div className="ap-grid">
              {appointments.map((apt, idx) => {
                const doc = mockData.doctors.find(
                  (d) => d.id === apt.doctorId
                );
                const initials = apt.doctorName
                  .split(" ")
                  .map((n) => n[0])
                  .join("");
                const fee = doc?.consultationFee ?? 0;

                return (
                  <article
                    key={apt.id}
                    className="ap-card"
                    style={{ animationDelay: `${idx * 0.06}s` }}
                  >
                    {/* Status Ribbon */}
                    <div
                      className={`ap-card__ribbon ap-card__ribbon--${apt.type}`}
                    >
                      {apt.status === "Rescheduled"
                        ? "Rescheduled"
                        : apt.type}
                    </div>

                    {/* Top: Doctor Info + Menu */}
                    <div className="ap-card__top">
                      <div className="ap-card__doctor">
                        <div className="ap-card__avatar">
                          {doc?.image ? (
                            <img src={doc.image} alt={apt.doctorName} />
                          ) : (
                            <span>{initials}</span>
                          )}
                          <i
                            className={`ap-card__dot ${
                              doc?.available ? "on" : ""
                            }`}
                          />
                        </div>
                        <div className="ap-card__doctor-text">
                          <h3>{apt.doctorName}</h3>
                          <p>{apt.doctorSpecialty}</p>
                        </div>
                      </div>

                      <div
                        className="ap-card__menu-wrap"
                        ref={openMenuId === apt.id ? menuRef : null}
                      >
                        <button
                          className="ap-card__menu-btn"
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === apt.id ? null : apt.id
                            )
                          }
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <circle
                              cx="10"
                              cy="4"
                              r="1.5"
                              fill="currentColor"
                            />
                            <circle
                              cx="10"
                              cy="10"
                              r="1.5"
                              fill="currentColor"
                            />
                            <circle
                              cx="10"
                              cy="16"
                              r="1.5"
                              fill="currentColor"
                            />
                          </svg>
                        </button>
                        {openMenuId === apt.id && (
                          <div className="ap-card__dropdown">
                            {activeTab === "upcoming" && (
                              <>
                                <button
                                  onClick={() => handleReschedule(apt)}
                                >
                                  <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                  >
                                    <rect
                                      x="3"
                                      y="4"
                                      width="18"
                                      height="18"
                                      rx="2"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    />
                                    <path
                                      d="M16 2v4M8 2v4M3 10h18"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                  Reschedule
                                </button>
                                <button
                                  onClick={() => handleMarkComplete(apt)}
                                >
                                  <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                  >
                                    <path
                                      d="M9 12l2 2 4-4m6 2a10 10 0 11-20 0 10 10 0 0120 0z"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  Mark Complete
                                </button>
                                <hr />
                                <button
                                  className="danger"
                                  onClick={() => handleCancel(apt)}
                                >
                                  <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                  >
                                    <circle
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    />
                                    <path
                                      d="M15 9l-6 6M9 9l6 6"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                  Cancel
                                </button>
                              </>
                            )}
                            {(activeTab === "completed" ||
                              activeTab === "canceled") && (
                              <button onClick={() => handleReBook(apt)}>
                                <svg
                                  width="15"
                                  height="15"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M1 4v6h6M23 20v-6h-6"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                {activeTab === "completed"
                                  ? "Book Again"
                                  : "Re-book"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="ap-card__details">
                      <div className="ap-card__detail">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <rect
                            x="3"
                            y="4"
                            width="18"
                            height="18"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M16 2v4M8 2v4M3 10h18"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div>
                          <label>Date</label>
                          <span>{formatDate(apt.date)}</span>
                        </div>
                      </div>
                      <div className="ap-card__detail">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M12 6v6l4 2"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div>
                          <label>Time</label>
                          <span>{apt.time || apt.reportingTime}</span>
                        </div>
                      </div>
                      <div className="ap-card__detail">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <rect
                            x="2"
                            y="3"
                            width="20"
                            height="18"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M12 8v3l2 1"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div>
                          <label>Token</label>
                          <span>{apt.tokenNumber}</span>
                        </div>
                      </div>
                      <div className="ap-card__detail">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <rect
                            x="2"
                            y="5"
                            width="20"
                            height="14"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M2 10h20"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                        </svg>
                        <div>
                          <label>Fee</label>
                          <span>₹{fee}</span>
                        </div>
                      </div>
                    </div>

                    {/* Slot indicator for upcoming */}
                    {activeTab === "upcoming" && (
                      <div className="ap-card__slot-indicator">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22Z"
                            fill="#DCFCE7"
                            stroke="#16A34A"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M8 12L11 15L16 9"
                            stroke="#16A34A"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>
                          Slot reserved: {apt.time || "—"} on{" "}
                          {formatDate(apt.date)}
                        </span>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="ap-card__footer">
                      <span
                        className={`ap-card__payment-badge ${
                          apt.paymentStatus === "paid" ? "paid" : "unpaid"
                        }`}
                      >
                        {apt.paymentStatus === "paid" ? "✓ Paid" : "Unpaid"}
                      </span>
                      <div className="ap-card__actions">
                        {activeTab === "upcoming" &&
                          apt.paymentStatus !== "paid" && (
                            <button
                              className="ap-card__btn ap-card__btn--primary"
                              onClick={() => handlePay(apt)}
                            >
                              Pay ₹{fee}
                            </button>
                          )}
                        {activeTab === "upcoming" && (
                          <button
                            className="ap-card__btn ap-card__btn--danger"
                            onClick={() => handleCancel(apt)}
                          >
                            Cancel
                          </button>
                        )}
                        {(activeTab === "completed" ||
                          activeTab === "canceled") && (
                          <button
                            className="ap-card__btn ap-card__btn--primary"
                            onClick={() => handleReBook(apt)}
                          >
                            {activeTab === "completed"
                              ? "Book Again"
                              : "Re-book"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Payment hint */}
                    {activeTab === "upcoming" &&
                      apt.paymentStatus !== "paid" && (
                        <div className="ap-card__hint">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M12 8v4m0 4h.01"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                          Pay upfront to skip the queue
                        </div>
                      )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ========== BOTTOM NAV ========== */}
      <nav className="ap-bottom">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`ap-bottom__item ${
              item.id === "appointments" ? "ap-bottom__item--active" : ""
            }`}
            onClick={item.action}
          >
            {item.icon}
            <span>{item.short}</span>
          </button>
        ))}
      </nav>

      <ConfirmModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        confirmLabel={modal.confirmLabel}
        confirmVariant={modal.confirmVariant}
        onConfirm={modal.onConfirm}
        onCancel={() => setModal((p) => ({ ...p, open: false }))}
      />
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((p) => ({ ...p, show: false }))}
        />
      )}
    </div>
  );
}