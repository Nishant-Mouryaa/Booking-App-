"use client";

import { useRouter } from "next/navigation";
import type { Doctor, DoctorOverrides } from "../types/doctor.types";

interface SidebarProps {
  mergedDoctor: Doctor & { availability: { days: string; hours: string } };
  overrides: DoctorOverrides;
  onLogout: () => void;
}

export function Sidebar({ mergedDoctor, overrides, onLogout }: SidebarProps) {
  const router = useRouter();

  return (
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

        <button
          className="dd-sidebar__link"
          onClick={() => router.push("/appointments")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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

        <button className="dd-sidebar__logout" onClick={onLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </aside>
  );
}