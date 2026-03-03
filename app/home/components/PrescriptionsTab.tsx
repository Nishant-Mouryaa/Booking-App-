// components/profile/PrescriptionsTab.tsx  ← only ONE file
"use client";

import { useState, useEffect } from "react";
import { prescriptionStore } from "../../../utils/prescriptionStore";
import type { Prescription } from "../../../utils/prescriptionStore";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

export function PrescriptionsTab({ patientEmail }: { patientEmail: string }) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    const load = () =>
      setPrescriptions(prescriptionStore.getForPatient(patientEmail));

    load();

    const handler = (e: StorageEvent) => {
      if (e.key === "prescriptions") load();
    };

    window.addEventListener("storage", handler);
    window.addEventListener("focus", load);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("focus", load);
    };
  }, [patientEmail]);

  return (
    <div className="pp-feed">
      <div className="pp-feed__header">
        <span className="pp-feed__title">Prescription History</span>
        <span className="pp-feed__count">
          {prescriptions.length} record{prescriptions.length !== 1 ? "s" : ""}
        </span>
      </div>

      {prescriptions.length === 0 ? (
        <div className="prx-empty pp-empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0
                 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2
                 2 0 012 2m-6 9l2 2 4-4"
              stroke="#d1d5db"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>No prescriptions yet</span>
          <small>Prescriptions written by your doctor will appear here</small>
        </div>
      ) : (
        prescriptions.map((rx) => (
          <PrescriptionCard key={rx.id} rx={rx} />
        ))
      )}
    </div>
  );
}

// ── Single prescription card ───────────────────────────────
function PrescriptionCard({ rx }: { rx: Prescription }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="pp-rx">
      {/* Header row */}
      <div
        className="pp-rx__head pp-rx__head--clickable"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="pp-rx__doc-avatar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4"
              stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M5 20c0-3.314 2.686-6 6-6h2c3.314 0 6 2.686 6 6"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="pp-rx__meta">
          <span className="pp-rx__doc-name">{rx.doctorName}</span>
          <span className="pp-rx__specialty">{rx.specialty}</span>
          <span className="pp-rx__date">📅 {fmtDate(rx.date)}</span>
        </div>

        <div className="pp-rx__head-right">
          <span className="pp-status pp-status--green">Prescribed</span>
          {/* Chevron */}
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            style={{
              transform: expanded ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
              color: "#9ca3af",
              flexShrink: 0,
            }}
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Expandable body */}
      {expanded && (
        <div className="pp-rx__body">
          {/* Diagnosis */}
          <div className="pp-rx__diagnosis">
            <span className="pp-rx__diagnosis-label">Diagnosis:</span>
            <span className="pp-rx__diagnosis-value">{rx.diagnosis}</span>
          </div>

          {/* Medications table */}
          <div className="pp-rx__meds">
            <div className="pp-rx__meds-header">💊 Prescribed Medications</div>
            <div className="pp-med-table">
              <div className="pp-med-table__head">
                <span>Medicine</span>
                <span>Dosage</span>
                <span>Frequency</span>
                <span>Duration</span>
              </div>
              {rx.medications.map((med, i) => (
                <div key={i} className="pp-med-table__row">
                  <span className="pp-med-table__name">{med.name}</span>
                  <span>{med.dosage || "—"}</span>
                  <span>{med.frequency || "—"}</span>
                  <span>{med.duration || "—"}</span>
                </div>
              ))}
            </div>
          </div>

          {rx.notes && (
            <div className="pp-rx__notes">ℹ️ {rx.notes}</div>
          )}

          {rx.followUpDate && (
            <div className="pp-rx__followup">
              🗓 Follow-up: <strong>{fmtDate(rx.followUpDate)}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}