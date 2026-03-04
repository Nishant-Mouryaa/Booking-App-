// components/profile/PrescriptionsTab.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { prescriptionStore } from "../../../utils/prescriptionStore";
import type { Prescription } from "../../../utils/prescriptionStore";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
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
          <PrescriptionCard key={rx.id} rx={rx} patientEmail={patientEmail} />
        ))
      )}
    </div>
  );
}

// ── Single prescription card ───────────────────────────────
function PrescriptionCard({
  rx,
  patientEmail,
}: {
  rx: Prescription;
  patientEmail: string;
}) {
  const [expanded, setExpanded] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const printWindow = window.open("", "_blank", "width=850,height=1100");
    if (!printWindow || !printRef.current) return;

    const content = printRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Prescription – ${rx.doctorName} – ${fmtDate(rx.date)}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap');

            * { box-sizing: border-box; margin: 0; padding: 0; }

            body {
              font-family: 'Inter', sans-serif;
              background: #f0f4f8;
              display: flex;
              justify-content: center;
              padding: 32px 16px;
              min-height: 100vh;
            }

            .rx-paper {
              width: 794px;
              min-height: 1123px;
              background: #fff;
              border-radius: 4px;
              box-shadow: 0 4px 32px rgba(0,0,0,0.12);
              display: flex;
              flex-direction: column;
              position: relative;
              overflow: hidden;
            }

            /* ── Top colour bar ── */
            .rx-paper::before {
              content: '';
              display: block;
              height: 8px;
              background: linear-gradient(90deg, #1e40af 0%, #2563eb 50%, #0ea5e9 100%);
            }

            /* ── Watermark ── */
            .rx-watermark {
              position: absolute;
              inset: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              pointer-events: none;
              z-index: 0;
            }
            .rx-watermark span {
              font-family: 'EB Garamond', serif;
              font-size: 108px;
              font-weight: 600;
              color: rgba(37,99,235,0.045);
              letter-spacing: 12px;
              transform: rotate(-35deg);
              user-select: none;
              white-space: nowrap;
            }

            /* ── Inner layout ── */
            .rx-inner {
              position: relative;
              z-index: 1;
              padding: 36px 48px 40px;
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 0;
            }

            /* ── Header ── */
            .rx-header {
              display: flex;
              align-items: flex-start;
              justify-content: space-between;
              padding-bottom: 20px;
              border-bottom: 2px solid #e2e8f0;
            }
            .rx-clinic-name {
              font-family: 'EB Garamond', serif;
              font-size: 26px;
              font-weight: 600;
              color: #1e3a8a;
              letter-spacing: 0.3px;
              line-height: 1.2;
            }
            .rx-doctor-name {
              font-size: 15px;
              font-weight: 600;
              color: #1e40af;
              margin-top: 4px;
            }
            .rx-doctor-creds {
              font-size: 12px;
              color: #64748b;
              margin-top: 2px;
              line-height: 1.5;
            }
            .rx-reg-badge {
              text-align: right;
            }
            .rx-reg-badge .label {
              font-size: 10px;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 0.8px;
            }
            .rx-reg-badge .value {
              font-size: 13px;
              font-weight: 600;
              color: #374151;
              margin-top: 2px;
            }
            .rx-reg-badge .specialty-pill {
              display: inline-block;
              margin-top: 6px;
              padding: 3px 10px;
              background: #dbeafe;
              color: #1e40af;
              border-radius: 99px;
              font-size: 11px;
              font-weight: 600;
            }

            /* ── Patient info strip ── */
            .rx-patient-strip {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 0;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              margin-top: 20px;
              overflow: hidden;
            }
            .rx-patient-field {
              padding: 10px 16px;
              border-right: 1px solid #e2e8f0;
            }
            .rx-patient-field:last-child { border-right: none; }
            .rx-patient-field .pf-label {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.7px;
              color: #94a3b8;
              font-weight: 500;
            }
            .rx-patient-field .pf-value {
              font-size: 13px;
              font-weight: 600;
              color: #1e293b;
              margin-top: 3px;
            }

            /* ── Rx symbol row ── */
            .rx-symbol-row {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-top: 24px;
              margin-bottom: 4px;
            }
            .rx-symbol {
              font-family: 'EB Garamond', serif;
              font-size: 52px;
              font-weight: 600;
              color: #1e40af;
              line-height: 1;
            }
            .rx-diagnosis-inline {
              background: #eff6ff;
              border-left: 3px solid #2563eb;
              padding: 8px 14px;
              border-radius: 0 8px 8px 0;
              flex: 1;
            }
            .rx-diagnosis-inline .d-label {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.7px;
              color: #2563eb;
              font-weight: 600;
            }
            .rx-diagnosis-inline .d-value {
              font-size: 13.5px;
              font-weight: 600;
              color: #1e3a8a;
              margin-top: 2px;
            }

            /* ── Medications ── */
            .rx-meds-title {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              color: #64748b;
              font-weight: 600;
              margin-top: 22px;
              margin-bottom: 10px;
            }
            .rx-med-list { display: flex; flex-direction: column; gap: 10px; }

            .rx-med-item {
              display: grid;
              grid-template-columns: 28px 1fr;
              gap: 0 14px;
              align-items: start;
              padding-bottom: 10px;
              border-bottom: 1px dashed #e2e8f0;
            }
            .rx-med-item:last-child { border-bottom: none; padding-bottom: 0; }

            .rx-med-num {
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: #1e40af;
              color: #fff;
              font-size: 12px;
              font-weight: 700;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-top: 2px;
              flex-shrink: 0;
            }
            .rx-med-name {
              font-size: 14px;
              font-weight: 700;
              color: #0f172a;
            }
            .rx-med-pills {
              display: flex;
              flex-wrap: wrap;
              gap: 6px;
              margin-top: 5px;
            }
            .rx-med-pill {
              display: inline-flex;
              align-items: center;
              gap: 4px;
              padding: 2px 9px;
              border-radius: 99px;
              font-size: 11.5px;
              font-weight: 500;
            }
            .rx-med-pill.dosage   { background:#fef3c7; color:#92400e; }
            .rx-med-pill.freq     { background:#dcfce7; color:#166534; }
            .rx-med-pill.duration { background:#ede9fe; color:#5b21b6; }

            /* ── Notes ── */
            .rx-notes {
              margin-top: 20px;
              background: #fffbeb;
              border: 1px solid #fde68a;
              border-radius: 8px;
              padding: 12px 16px;
              font-size: 12.5px;
              color: #78350f;
              line-height: 1.6;
            }
            .rx-notes-label {
              font-weight: 700;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.6px;
              margin-bottom: 4px;
              color: #92400e;
            }

            /* ── Follow-up ── */
            .rx-followup {
              margin-top: 14px;
              display: inline-flex;
              align-items: center;
              gap: 8px;
              padding: 8px 14px;
              background: #eff6ff;
              border-radius: 8px;
              font-size: 12.5px;
              color: #1e40af;
              font-weight: 500;
            }

            /* ── Spacer ── */
            .rx-spacer { flex: 1; }

            /* ── Footer / Stamp row ── */
            .rx-footer {
              margin-top: 40px;
              display: flex;
              align-items: flex-end;
              justify-content: space-between;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
            }

            .rx-stamp-wrap {
              position: relative;
              width: 110px;
              height: 110px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .rx-stamp-ring {
              position: absolute;
              inset: 0;
              border-radius: 50%;
              border: 3px solid #1e40af;
              opacity: 0.7;
            }
            .rx-stamp-ring-inner {
              position: absolute;
              inset: 8px;
              border-radius: 50%;
              border: 1.5px dashed #1e40af;
              opacity: 0.5;
            }
            .rx-stamp-body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              gap: 2px;
              z-index: 1;
              padding: 12px;
            }
            .rx-stamp-body .s-name {
              font-size: 9.5px;
              font-weight: 700;
              color: #1e40af;
              text-transform: uppercase;
              letter-spacing: 0.4px;
              line-height: 1.2;
            }
            .rx-stamp-body .s-sep {
              width: 40px;
              height: 1px;
              background: #1e40af;
              opacity: 0.5;
              margin: 2px 0;
            }
            .rx-stamp-body .s-spec {
              font-size: 8px;
              color: #2563eb;
              font-weight: 600;
            }
            .rx-stamp-body .s-reg {
              font-size: 7.5px;
              color: #64748b;
              margin-top: 1px;
            }

            .rx-sig-block { text-align: right; }
            .rx-sig-line {
              width: 180px;
              border-bottom: 1.5px solid #334155;
              margin-bottom: 6px;
              margin-left: auto;
              height: 32px;
            }
            .rx-sig-label {
              font-size: 11px;
              color: #64748b;
            }
            .rx-sig-name {
              font-size: 13px;
              font-weight: 700;
              color: #1e293b;
            }

            /* ── Footer bottom bar ── */
            .rx-bottom-bar {
              background: linear-gradient(90deg, #1e40af 0%, #2563eb 50%, #0ea5e9 100%);
              height: 6px;
            }

            /* ── Confidential ribbon ── */
            .rx-confidential {
              text-align: center;
              padding: 10px;
              font-size: 10px;
              color: #94a3b8;
              letter-spacing: 1px;
              text-transform: uppercase;
            }

            @media print {
              body { background: white; padding: 0; }
              .rx-paper { box-shadow: none; width: 100%; min-height: unset; }
            }
          </style>
        </head>
        <body>
          ${content}
          <script>
            window.onload = () => {
              window.print();
            };
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Build patient name from email (fallback)
  const patientName = patientEmail.split("@")[0].replace(/[._]/g, " ");

  return (
    <div className="pp-rx-wrapper">
      {/* ── Compact list card ── */}
      <div className="pp-rx">
        <div
          className="pp-rx__head pp-rx__head--clickable"
          onClick={() => setExpanded((e) => !e)}
        >
          <div className="pp-rx__doc-avatar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="M5 20c0-3.314 2.686-6 6-6h2c3.314 0 6 2.686 6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="pp-rx__meta">
            <span className="pp-rx__doc-name">{rx.doctorName}</span>
            <span className="pp-rx__specialty">{rx.specialty}</span>
            <span className="pp-rx__date">📅 {fmtDate(rx.date)}</span>
          </div>
          <div className="pp-rx__head-right">
            <button
              className="pp-rx__download-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              title="Download prescription"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3v13m0 0l-4-4m4 4l4-4M4 20h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Download
            </button>
            <span className="pp-status pp-status--green">Prescribed</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              style={{
                transform: expanded ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
                color: "#9ca3af",
                flexShrink: 0,
              }}
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* ── Expanded: realistic Rx paper preview ── */}
        {expanded && (
          <div className="pp-rx__paper-wrap">
            {/* Hidden printable node */}
            <div style={{ display: "none" }}>
              <div ref={printRef}>
                <RxPaperContent rx={rx} patientName={patientName} patientEmail={patientEmail} />
              </div>
            </div>

            {/* Visible preview */}
            <RxPaperContent rx={rx} patientName={patientName} patientEmail={patientEmail} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── The actual prescription paper layout ──────────────────────
function RxPaperContent({
  rx,
  patientName,
  patientEmail,
}: {
  rx: Prescription;
  patientName: string;
  patientEmail: string;
}) {
  return (
    <div className="rx-paper">
      {/* Top colour accent */}
      <div className="rx-top-bar" />

      {/* Watermark */}
      <div className="rx-watermark" aria-hidden="true">
        <span>Rx</span>
      </div>

      <div className="rx-inner">
        {/* ── Header ── */}
        <div className="rx-header">
          <div>
            <div className="rx-clinic-name">MediCare Clinic</div>
            <div className="rx-doctor-name">{rx.doctorName}</div>
            <div className="rx-doctor-creds">
              {rx.specialty} Specialist
              <br />
              MBBS, MD · Reg. No. MCI-{rx.id.slice(-6).toUpperCase()}
            </div>
          </div>
          <div className="rx-reg-badge">
            <div className="label">Specialty</div>
            <div className="value">{rx.specialty}</div>
            <span className="specialty-pill">{rx.specialty}</span>
            <div style={{ marginTop: 8, fontSize: 11, color: "#64748b" }}>
              📅 {fmtDate(rx.date)}
            </div>
          </div>
        </div>

        {/* ── Patient strip ── */}
        <div className="rx-patient-strip">
          <div className="rx-patient-field">
            <div className="pf-label">Patient Name</div>
            <div className="pf-value" style={{ textTransform: "capitalize" }}>
              {patientName}
            </div>
          </div>
          <div className="rx-patient-field">
            <div className="pf-label">Contact</div>
            <div className="pf-value">{patientEmail}</div>
          </div>
          <div className="rx-patient-field">
            <div className="pf-label">Prescription ID</div>
            <div className="pf-value" style={{ fontFamily: "monospace" }}>
              #{rx.id.slice(-8).toUpperCase()}
            </div>
          </div>
        </div>

        {/* ── Rx symbol + Diagnosis ── */}
        <div className="rx-symbol-row">
          <span className="rx-symbol">℞</span>
          <div className="rx-diagnosis-inline">
            <div className="d-label">Diagnosis</div>
            <div className="d-value">{rx.diagnosis}</div>
          </div>
        </div>

        {/* ── Medications ── */}
        <div className="rx-meds-title">Prescribed Medications</div>
        <div className="rx-med-list">
          {rx.medications.map((med, i) => (
            <div key={i} className="rx-med-item">
              <div className="rx-med-num">{i + 1}</div>
              <div>
                <div className="rx-med-name">{med.name}</div>
                <div className="rx-med-pills">
                  {med.dosage && (
                    <span className="rx-med-pill dosage">💊 {med.dosage}</span>
                  )}
                  {med.frequency && (
                    <span className="rx-med-pill freq">🕐 {med.frequency}</span>
                  )}
                  {med.duration && (
                    <span className="rx-med-pill duration">
                      📆 {med.duration}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Notes ── */}
        {rx.notes && (
          <div className="rx-notes">
            <div className="rx-notes-label">⚠ Special Instructions</div>
            {rx.notes}
          </div>
        )}

        {/* ── Follow-up ── */}
        {rx.followUpDate && (
          <div className="rx-followup">
            🗓&nbsp; Next Follow-up:&nbsp;
            <strong>{fmtDate(rx.followUpDate)}</strong>
          </div>
        )}

        <div className="rx-spacer" />

        {/* ── Footer: stamp + signature ── */}
        <div className="rx-footer">
          {/* Doctor stamp */}
          <div className="rx-stamp-wrap">
            <div className="rx-stamp-ring" />
            <div className="rx-stamp-ring-inner" />
            <div className="rx-stamp-body">
              <span className="s-name">{rx.doctorName}</span>
              <div className="s-sep" />
              <span className="s-spec">{rx.specialty}</span>
              <span className="s-reg">
                MCI-{rx.id.slice(-6).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Signature block */}
          <div className="rx-sig-block">
            <div className="rx-sig-line" />
            <div className="rx-sig-label">Signature &amp; Date</div>
            <div className="rx-sig-name">{rx.doctorName}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
              {fmtDate(rx.date)}
            </div>
          </div>
        </div>
      </div>

      {/* Confidential */}
      <div className="rx-confidential">
        Confidential Medical Document · For Patient Use Only
      </div>

      {/* Bottom bar */}
      <div className="rx-bottom-bar" />
    </div>
  );
}