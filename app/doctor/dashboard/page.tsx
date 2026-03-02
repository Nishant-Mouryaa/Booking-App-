"use client";

import "../dashboard.css";
import { useDoctorDashboard } from "./hooks/useDoctorDashboard";
import { Sidebar }              from "./components/Sidebar";
import { Topbar }               from "./components/Topbar";
import { UnavailableBanner }    from "./components/UnavailableBanner";
import { ProfessionalInfoCard } from "./components/ProfessionalInfoCard";
import { ReviewsContactCard }   from "./components/ReviewsContactCard";
import { AppointmentSlotsCard } from "./components/AppointmentSlotsCard";
import { FeeSummaryCard }        from "./components/FeeSummaryCard";

export default function DoctorDashboardPage() {
  const {
    doctor,
    mergedDoctor,
    overrides,
    saving,
    saveSuccess, 
    isAvailable,
    handleFieldChange,
    handleAvailabilityToggle,
    handleSave,
    handleReset,
    handleLogout,
  } = useDoctorDashboard();

  if (!mergedDoctor || !doctor) {
    return (
      <div className="dd">
        <div className="dd-main">
          <div style={{ padding: "40px 24px", fontSize: 14, color: "#6b7280" }}>
            Loading doctor dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dd">
      <Sidebar
        mergedDoctor={mergedDoctor}
        overrides={overrides}
        onLogout={handleLogout}
      />

      <main className="dd-main">
        <Topbar
          isAvailable={isAvailable}
          onToggle={handleAvailabilityToggle}
        />

        <div className="dd-main-scroll">
          {!isAvailable && (
            <UnavailableBanner onGoAvailable={handleAvailabilityToggle} />
          )}

           {/* ── Save success toast ── */}
  {saveSuccess && (
    <div className="dd-toast dd-toast--success">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M20 6L9 17l-5-5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Profile and appointment settings saved successfully.
    </div>
  )}

  {!isAvailable && (
    <UnavailableBanner onGoAvailable={handleAvailabilityToggle} />
  )}

          {/* Row 1 */}
          <div className="dd-grid">
            <ProfessionalInfoCard
              mergedDoctor={mergedDoctor}
              overrides={overrides}
              doctor={doctor}
              isAvailable={isAvailable}
              onChange={handleFieldChange}
            />
            <ReviewsContactCard
              mergedDoctor={mergedDoctor}
              overrides={overrides}
              onChange={handleFieldChange}
            />
          </div>

          {/* Row 2 */}
          <div className="dd-grid" style={{ marginTop: 14 }}>
            <AppointmentSlotsCard
              mergedDoctor={mergedDoctor}
              overrides={overrides}
              saving={saving}
              onChange={handleFieldChange}
              onSave={handleSave}
              onReset={handleReset}
            />
            <FeeSummaryCard
              mergedDoctor={mergedDoctor}
              overrides={overrides}
              doctor={doctor}
              isAvailable={isAvailable}
              onChange={handleFieldChange}
            />
          </div>
        </div>
      </main>
    </div>
  );
}