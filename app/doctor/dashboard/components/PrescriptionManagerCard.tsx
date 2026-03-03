// components/dashboard/components/PrescriptionManagerCard.tsx
"use client";

import { useState, useEffect } from "react";
import { prescriptionStore } from "../../../../utils/prescriptionStore";
import type { Prescription, Medication } from "../../../../utils/prescriptionStore";

interface Props {
  doctorId: number;
  doctorName: string;
  specialty: string;
}

const EMPTY_MED: Medication = {
  name: "", dosage: "", frequency: "", duration: "",
};

const FREQ_OPTIONS = [
  "Once daily", "Twice daily", "Thrice daily",
  "Every 4 hours", "Every 6 hours", "Every 8 hours",
  "Once weekly", "As needed (SOS)",
];

function MedRow({
  med, index, onChange, onRemove, isOnly,
}: {
  med: Medication;
  index: number;
  onChange: (i: number, field: keyof Medication, val: string) => void;
  onRemove: (i: number) => void;
  isOnly: boolean;
}) {
  return (
    <div className="prx-med-row">
      <div className="prx-med-row__fields">
        <input
          className="dd-input prx-med-input"
          placeholder="Medicine name *"
          value={med.name}
          onChange={(e) => onChange(index, "name", e.target.value)}
        />
        <input
          className="dd-input prx-med-input"
          placeholder="Dosage (e.g. 500mg)"
          value={med.dosage}
          onChange={(e) => onChange(index, "dosage", e.target.value)}
        />
        <select
          className="dd-select prx-med-input"
          value={med.frequency}
          onChange={(e) => onChange(index, "frequency", e.target.value)}
        >
          <option value="">Frequency…</option>
          {FREQ_OPTIONS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <input
          className="dd-input prx-med-input"
          placeholder="Duration (e.g. 7 days)"
          value={med.duration}
          onChange={(e) => onChange(index, "duration", e.target.value)}
        />
      </div>
      {!isOnly && (
        <button
          type="button"
          className="prx-med-remove"
          onClick={() => onRemove(index)}
          title="Remove medication"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

export function PrescriptionManagerCard({ doctorId, doctorName, specialty }: Props) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [showForm, setShowForm]           = useState(false);
  const [patientEmail, setPatientEmail]   = useState("");
  const [diagnosis, setDiagnosis]         = useState("");
  const [notes, setNotes]                 = useState("");
  const [followUpDate, setFollowUpDate]   = useState("");
  const [medications, setMedications]     = useState<Medication[]>([{ ...EMPTY_MED }]);
  const [saving, setSaving]               = useState(false);
  const [flash, setFlash]                 = useState<string | null>(null);
  const [expandedId, setExpandedId]       = useState<string | null>(null);

  // Load appointments to get patient list
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    const load = () => {
      setPrescriptions(prescriptionStore.getForDoctor(doctorId));
      try {
        const raw = localStorage.getItem("appointments");
        const all = raw ? JSON.parse(raw) : [];
        // Only show appointments for this doctor
        setAppointments(
          all.filter((a: any) => a.doctorId === doctorId && a.type === "upcoming")
        );
      } catch { setAppointments([]); }
    };
    load();
    window.addEventListener("focus", load);
    return () => window.removeEventListener("focus", load);
  }, [doctorId]);

  // ── Medication helpers ───────────────────────────────────
  const updateMed = (i: number, field: keyof Medication, val: string) => {
    setMedications((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: val };
      return next;
    });
  };

  const addMed = () =>
    setMedications((prev) => [...prev, { ...EMPTY_MED }]);

  const removeMed = (i: number) =>
    setMedications((prev) => prev.filter((_, idx) => idx !== i));

  // ── Form reset ───────────────────────────────────────────
  const resetForm = () => {
    setPatientEmail("");
    setDiagnosis("");
    setNotes("");
    setFollowUpDate("");
    setMedications([{ ...EMPTY_MED }]);
    setShowForm(false);
  };

  // ── Save ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!patientEmail.trim()) {
      setFlash("❌ Please enter patient email");
      return;
    }
    if (!diagnosis.trim()) {
      setFlash("❌ Please enter a diagnosis");
      return;
    }
    if (medications.some((m) => !m.name.trim())) {
      setFlash("❌ All medications need a name");
      return;
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));

    const rx: Prescription = {
      id: `rx-${Date.now()}`,
      appointmentId: Date.now(),
      doctorId,
      doctorName,
      specialty,
      patientEmail: patientEmail.trim().toLowerCase(),
      date: new Date().toISOString().split("T")[0],
      diagnosis,
      medications,
      notes,
      followUpDate: followUpDate || undefined,
      createdAt: new Date().toISOString(),
    };

    prescriptionStore.save(rx);
    setPrescriptions(prescriptionStore.getForDoctor(doctorId));
    setSaving(false);
    setFlash("✅ Prescription saved — patient can view it in their profile");
    resetForm();
    setTimeout(() => setFlash(null), 4000);
  };

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = (id: string) => {
    if (!confirm("Delete this prescription?")) return;
    prescriptionStore.delete(id);
    setPrescriptions(prescriptionStore.getForDoctor(doctorId));
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });

  return (
    <section className="dd-card prx-card">
      {/* Header */}
      <div className="dd-card__header">
        <div>
          <div className="dd-card__title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0
                002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9
                5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Prescriptions</span>
          </div>
          <p className="dd-card__subtitle">
            Write prescriptions — patients see them instantly in their profile
          </p>
        </div>
        {!showForm && (
          <button
            className="dd-btn dd-btn--primary"
            onClick={() => setShowForm(true)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            New Prescription
          </button>
        )}
      </div>

      {/* Flash message */}
      {flash && (
        <div className={`prx-flash ${flash.startsWith("✅") ? "prx-flash--success" : "prx-flash--error"}`}>
          {flash}
        </div>
      )}

      {/* ── Write Prescription Form ── */}
      {showForm && (
        <div className="prx-form">
          <div className="prx-form__header">
            <span className="prx-form__title">New Prescription</span>
            <button className="prx-form__close" onClick={resetForm}>✕</button>
          </div>

          {/* Patient email — with autocomplete from appointments */}
          <div className="dd-form-row">
            <label className="dd-label"><span>Patient Email *</span></label>
            <input
              className="dd-input"
              type="email"
              placeholder="patient@email.com"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
              list="prx-patient-list"
            />
            {/* Datalist from booked appointments */}
            <datalist id="prx-patient-list">
              {appointments.map((a: any) => (
                <option key={a.id} value={a.bookedBy ?? a.patientEmail ?? ""} />
              ))}
            </datalist>
          </div>

          {/* Diagnosis */}
          <div className="dd-form-row">
            <label className="dd-label"><span>Diagnosis / Reason *</span></label>
            <input
              className="dd-input"
              placeholder="e.g. Viral fever, Hypertension management…"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
          </div>

          {/* Medications */}
          <div className="prx-meds-section">
            <div className="prx-meds-section__header">
              <span>Medications *</span>
              <button
                type="button"
                className="dd-btn dd-btn--ghost prx-add-med-btn"
                onClick={addMed}
              >
                + Add Medicine
              </button>
            </div>

            {/* Column headers */}
            <div className="prx-med-cols-head">
              <span>Medicine Name</span>
              <span>Dosage</span>
              <span>Frequency</span>
              <span>Duration</span>
            </div>

            {medications.map((med, i) => (
              <MedRow
                key={i}
                med={med}
                index={i}
                onChange={updateMed}
                onRemove={removeMed}
                isOnly={medications.length === 1}
              />
            ))}
          </div>

          {/* Notes */}
          <div className="dd-form-row">
            <label className="dd-label"><span>Doctor's Notes</span></label>
            <textarea
              className="dd-textarea"
              rows={2}
              placeholder="Additional instructions, diet, lifestyle advice…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Follow-up */}
          <div className="dd-form-row">
            <label className="dd-label"><span>Follow-up Date (optional)</span></label>
            <input
              className="dd-input"
              type="date"
              value={followUpDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setFollowUpDate(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="dd-footer-actions" style={{ marginTop: 12 }}>
            <button className="dd-btn dd-btn--ghost" onClick={resetForm}>
              Cancel
            </button>
            <button
              className="dd-btn dd-btn--primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Prescription"}
            </button>
          </div>
        </div>
      )}

      {/* ── Prescription List ── */}
      <div className="prx-list">
        {prescriptions.length === 0 && !showForm && (
          <div className="prx-empty">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0
                002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9
                5a2 2 0 012-2h2a2 2 0 012 2"
                stroke="#d1d5db" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>No prescriptions written yet</span>
            <small>Click "New Prescription" to get started</small>
          </div>
        )}

        {prescriptions.map((rx) => (
          <div key={rx.id} className="prx-item">
            <div
              className="prx-item__header"
              onClick={() =>
                setExpandedId(expandedId === rx.id ? null : rx.id)
              }
            >
              <div className="prx-item__meta">
                <span className="prx-item__patient">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4"
                      stroke="currentColor" strokeWidth="1.8" />
                    <path d="M5 20c0-3.314 2.686-6 6-6h2c3.314 0 6 2.686 6 6"
                      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  {rx.patientEmail}
                </span>
                <span className="prx-item__diagnosis">{rx.diagnosis}</span>
                <span className="prx-item__date">📅 {fmtDate(rx.date)}</span>
              </div>
              <div className="prx-item__right">
                <span className="prx-item__med-count">
                  💊 {rx.medications.length} med{rx.medications.length > 1 ? "s" : ""}
                </span>
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  style={{
                    transform: expandedId === rx.id ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                    color: "#9ca3af",
                  }}
                >
                  <path d="M6 9l6 6 6-6"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {expandedId === rx.id && (
              <div className="prx-item__body">
                {/* Med table */}
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
                      <span>{med.dosage}</span>
                      <span>{med.frequency}</span>
                      <span>{med.duration}</span>
                    </div>
                  ))}
                </div>

                {rx.notes && (
                  <div className="prx-item__notes">ℹ️ {rx.notes}</div>
                )}
                {rx.followUpDate && (
                  <div className="prx-item__followup">
                    🗓 Follow-up: <strong>{fmtDate(rx.followUpDate)}</strong>
                  </div>
                )}

                <div className="prx-item__actions">
                  <button
                    className="dd-btn dd-btn--ghost"
                    style={{ color: "#ef4444", fontSize: 11 }}
                    onClick={() => handleDelete(rx.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}