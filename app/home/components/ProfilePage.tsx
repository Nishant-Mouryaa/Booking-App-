"use client";

import { useState, useRef } from "react";
import mockData from "@/data/mockData.json";
import ReportViewerModal   from "./ReportViewerModal";
import DocumentViewerModal from "./DocumentViewerModal";
import { PrescriptionsTab } from "./PrescriptionsTab";

import "../home.css";

type ProfileTab =
  | "profile" | "prescriptions" | "reports"
  | "documents" | "vitals" | "emergency";

// ── Types ──────────────────────────────────────────────────────────────────
interface UserProfile {
  name: string;
  email: string;
  mobile: string;
  bloodGroup: string;
  dob: string;
  gender: string;
  address: string;
  allergies: string[];
  chronicConditions: string[];
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
}

// ── Storage helpers ────────────────────────────────────────────────────────
const STORAGE_KEY = "patientProfileOverrides";

const loadProfile = (): Partial<UserProfile> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const saveProfile = (data: Partial<UserProfile>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
};

// ── Helpers ────────────────────────────────────────────────────────────────
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

const calcAge = (dob: string) => {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
};

const VITAL_COLORS: Record<string, string> = {
  bp: "#3b82f6", heart: "#ef4444", sugar: "#f59e0b",
  spo2: "#06b6d4", temp: "#f97316", weight: "#8b5cf6",
};

const STATUS_CLASS: Record<string, string> = {
  Normal: "pp-status--green",
  Review: "pp-status--amber",
  High:   "pp-status--red",
};

const DOC_TYPE_COLORS: Record<string, string> = {
  Discharge: "#3b82f6", Insurance: "#10b981", Vaccination: "#8b5cf6",
};

const TABS = [
  { id: "profile",       label: "Profile",       icon: "👤" },
  { id: "prescriptions", label: "Prescriptions", icon: "💊" },
  { id: "reports",       label: "Test Reports",  icon: "🧪" },
  { id: "documents",     label: "Documents",     icon: "📄" },
  { id: "vitals",        label: "Vital Signs",   icon: "📊" },
  { id: "emergency",     label: "Emergency",     icon: "🚨" },
] as const;

// ── Vital icon SVG ─────────────────────────────────────────────────────────
function VitalIcon({ icon }: { icon: string }) {
  const map: Record<string, React.ReactNode> = {
    bp: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 21C12 21 4 13.5 4 8.5a8 8 0 0116 0C20 13.5 12 21 12 21z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
    heart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
    sugar: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
    spo2: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    temp: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    weight: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 4h12l2 16H4L6 4zM9 4a3 3 0 006 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  };
  return <>{map[icon] ?? map.heart}</>;
}

// ═══════════════════════════════════════════════════════════
//  EDITABLE FIELD COMPONENT
// ═══════════════════════════════════════════════════════════
interface EditableFieldProps {
  label: string;
  value: string;
  type?: "text" | "email" | "tel" | "date" | "textarea" | "select";
  options?: string[];
  editing: boolean;
  onChange: (v: string) => void;
}

function EditableField({
  label, value, type = "text", options, editing, onChange,
}: EditableFieldProps) {
  return (
    <div className="pp-details__row">
      <dt className="pp-details__label">{label}</dt>
      {editing ? (
        <dd className="pp-details__value pp-details__value--edit">
          {type === "textarea" ? (
            <textarea
              className="pp-edit-input pp-edit-textarea"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={2}
            />
          ) : type === "select" && options ? (
            <select
              className="pp-edit-input pp-edit-select"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            >
              {options.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          ) : (
            <input
              className="pp-edit-input"
              type={type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          )}
        </dd>
      ) : (
        <dd className="pp-details__value">{value || <span className="pp-details__empty">Not set</span>}</dd>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  MAIN PROFILE PAGE
// ═══════════════════════════════════════════════════════════
export default function ProfilePage() {
  const base = mockData.testUser as any;

  // ── Merge saved overrides with base data ──
  const [profile, setProfile] = useState<UserProfile>(() => {
    const overrides = loadProfile();
    return {
      name:              overrides.name              ?? base.name,
      email:             overrides.email             ?? base.email,
      mobile:            overrides.mobile            ?? base.mobile,
      bloodGroup:        overrides.bloodGroup        ?? base.bloodGroup,
      dob:               overrides.dob               ?? base.dob,
      gender:            overrides.gender            ?? base.gender,
      address:           overrides.address           ?? base.address,
      allergies:         overrides.allergies         ?? base.allergies,
      chronicConditions: overrides.chronicConditions ?? base.chronicConditions,
      emergencyContact:  overrides.emergencyContact  ?? base.emergencyContact,
    };
  });

  const [activeTab,    setActiveTab]    = useState<ProfileTab>("profile");
  const [editing,      setEditing]      = useState(false);
  const [draft,        setDraft]        = useState<UserProfile>(profile);
  const [savedFlash,   setSavedFlash]   = useState(false);

  // modals
  const [reportModal,  setReportModal]  = useState<any | null>(null);
  const [docModal,     setDocModal]     = useState<any | null>(null);

  // tag editing
  const [allergyInput,   setAllergyInput]   = useState("");
  const [conditionInput, setConditionInput] = useState("");

  const allergyRef   = useRef<HTMLInputElement>(null);
  const conditionRef = useRef<HTMLInputElement>(null);

  // ── Editing helpers ────────────────────────────────────────
  const startEdit = () => { setDraft({ ...profile }); setEditing(true); };

  const cancelEdit = () => setEditing(false);

  const saveEdit = () => {
    setProfile(draft);
    saveProfile(draft);
    setEditing(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2500);
  };

  const setField = <K extends keyof UserProfile>(key: K, val: UserProfile[K]) =>
    setDraft((p) => ({ ...p, [key]: val }));

  const setEmergencyField = (
    key: keyof UserProfile["emergencyContact"],
    val: string
  ) => setDraft((p) => ({
    ...p,
    emergencyContact: { ...p.emergencyContact, [key]: val },
  }));

  const removeTag = (
    listKey: "allergies" | "chronicConditions",
    item: string
  ) => setDraft((p) => ({
    ...p,
    [listKey]: (p[listKey] as string[]).filter((x) => x !== item),
  }));

  const addTag = (listKey: "allergies" | "chronicConditions", value: string) => {
    const v = value.trim();
    if (!v) return;
    setDraft((p) => ({
      ...p,
      [listKey]: [...(p[listKey] as string[]), v],
    }));
    if (listKey === "allergies")   setAllergyInput("");
    if (listKey === "chronicConditions") setConditionInput("");
  };

  // ── Derived ────────────────────────────────────────────────
  const displayProfile = editing ? draft : profile;

  return (
    <div className="pp">

      {/* ── User Hero ─────────────────────────────────────── */}
      <div className="pp-hero">
        <div className="pp-hero__avatar">
          {base.avatar
            ? <img src={base.avatar} alt={profile.name} />
            : <span>{profile.name.charAt(0)}</span>}
          <span className="pp-hero__avatar-badge">Patient</span>
        </div>
        <div className="pp-hero__info">
          <h2 className="pp-hero__name">{profile.name}</h2>
          <p className="pp-hero__email">{profile.email}</p>
          <div className="pp-hero__tags">
            <span className="pp-hero__tag">
              📍 {profile.address.split(",")[2]?.trim() ?? "—"}
            </span>
            <span className="pp-hero__tag">
              👤 {profile.gender}, {calcAge(profile.dob)} yrs
            </span>
            <span className="pp-hero__tag pp-hero__tag--blood">
              🩸 {profile.bloodGroup}
            </span>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ───────────────────────────────────────── */}
      <div className="pp-tabs">
        <div className="pp-tabs__scroll">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`pp-tab ${activeTab === tab.id ? "pp-tab--active" : ""}`}
              onClick={() => { setActiveTab(tab.id); setEditing(false); }}
            >
              <span className="pp-tab__icon">{tab.icon}</span>
              <span className="pp-tab__label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────── */}
      <div className="pp-body">

        {/* saved flash */}
        {savedFlash && (
          <div className="pp-saved-flash">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Profile saved successfully
          </div>
        )}

        {/* ══ PROFILE TAB ══════════════════════════════════ */}
        {activeTab === "profile" && (
          <div className="pp-section-grid">

            {/* Personal Details card */}
            <section className="pp-card">
              <div className="pp-card__header">
                <div className="pp-card__title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M5 20c0-3.314 2.686-6 6-6h2c3.314 0 6 2.686 6 6"
                      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  Personal Details
                </div>
                {!editing ? (
                  <button className="pp-edit-btn" onClick={startEdit}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7
                        M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                        stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Edit
                  </button>
                ) : (
                  <div className="pp-edit-actions">
                    <button className="pp-edit-btn pp-edit-btn--ghost" onClick={cancelEdit}>
                      Cancel
                    </button>
                    <button className="pp-edit-btn pp-edit-btn--save" onClick={saveEdit}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
                          stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M17 21v-8H7v8M7 3v5h8"
                          stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Save
                    </button>
                  </div>
                )}
              </div>

              <div className="pp-card__body">
                <dl className="pp-details">
                  <EditableField label="Full Name"     value={displayProfile.name}
                    editing={editing} onChange={(v) => setField("name", v)} />
                  <EditableField label="Date of Birth" value={displayProfile.dob}
                    type="date" editing={editing} onChange={(v) => setField("dob", v)} />
                  <EditableField label="Gender"        value={displayProfile.gender}
                    type="select" options={["Male","Female","Non-binary","Prefer not to say"]}
                    editing={editing} onChange={(v) => setField("gender", v)} />
                  <EditableField label="Blood Group"   value={displayProfile.bloodGroup}
                    type="select"
                    options={["A+","A−","B+","B−","AB+","AB−","O+","O−"]}
                    editing={editing} onChange={(v) => setField("bloodGroup", v)} />
                  <EditableField label="Mobile"        value={displayProfile.mobile}
                    type="tel" editing={editing} onChange={(v) => setField("mobile", v)} />
                  <EditableField label="Email"         value={displayProfile.email}
                    type="email" editing={editing} onChange={(v) => setField("email", v)} />
                  <EditableField label="Address"       value={displayProfile.address}
                    type="textarea" editing={editing} onChange={(v) => setField("address", v)} />
                </dl>
              </div>
            </section>

            {/* Medical Overview card */}
            <section className="pp-card">
              <div className="pp-card__header">
                <div className="pp-card__title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 8V4m0 0a4 4 0 100 8m0-8a4 4 0 000 8m0 0v8"
                      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  Medical Overview
                </div>
                {!editing && (
                  <button className="pp-edit-btn" onClick={startEdit}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7
                        M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                        stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Edit
                  </button>
                )}
              </div>

              <div className="pp-card__body">
                {/* Allergies */}
                <div className="pp-overview-block">
                  <span className="pp-overview-block__label">Allergies</span>
                  <div className="pp-tag-row">
                    {(displayProfile.allergies as string[]).map((a) => (
                      <span key={a} className="pp-tag pp-tag--red">
                        {a}
                        {editing && (
                          <button
                            className="pp-tag__remove"
                            onClick={() => removeTag("allergies", a)}
                          >×</button>
                        )}
                      </span>
                    ))}
                    {editing && (
                      <div className="pp-tag-add">
                        <input
                          ref={allergyRef}
                          className="pp-tag-add__input"
                          placeholder="Add allergy…"
                          value={allergyInput}
                          onChange={(e) => setAllergyInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              addTag("allergies", allergyInput);
                            }
                          }}
                        />
                        <button
                          className="pp-tag-add__btn"
                          onClick={() => addTag("allergies", allergyInput)}
                        >+</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chronic Conditions */}
                <div className="pp-overview-block">
                  <span className="pp-overview-block__label">Chronic Conditions</span>
                  <div className="pp-tag-row">
                    {(displayProfile.chronicConditions as string[]).map((c) => (
                      <span key={c} className="pp-tag pp-tag--amber">
                        {c}
                        {editing && (
                          <button
                            className="pp-tag__remove"
                            onClick={() => removeTag("chronicConditions", c)}
                          >×</button>
                        )}
                      </span>
                    ))}
                    {editing && (
                      <div className="pp-tag-add">
                        <input
                          ref={conditionRef}
                          className="pp-tag-add__input"
                          placeholder="Add condition…"
                          value={conditionInput}
                          onChange={(e) => setConditionInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              addTag("chronicConditions", conditionInput);
                            }
                          }}
                        />
                        <button
                          className="pp-tag-add__btn"
                          onClick={() => addTag("chronicConditions", conditionInput)}
                        >+</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mini vitals summary */}
                <div className="pp-overview-block">
                  <span className="pp-overview-block__label">Latest Vitals</span>
                  <div className="pp-mini-vitals">
                    {(base.vitalSigns as any[]).slice(0, 4).map((v: any) => (
                      <div key={v.label} className="pp-mini-vital">
                        <span className="pp-mini-vital__label">{v.label}</span>
                        <span className="pp-mini-vital__value">
                          {v.value} <small>{v.unit}</small>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

      
       
{/* ══ PRESCRIPTIONS TAB ═══════════════════════════ */}
{activeTab === "prescriptions" && (
  <PrescriptionsTab patientEmail={profile.email} />
)}

        {/* ══ TEST REPORTS TAB ════════════════════════════ */}
       {activeTab === "reports" && (
  <div className="pp-feed">
          
            <div className="pp-feed__header">
              <span className="pp-feed__title">Test Reports</span>
              <span className="pp-feed__count">
                {(base.testReports as any[]).length} reports
              </span>
            </div>

            {(base.testReports as any[]).map((rep: any) => (
              <div key={rep.id} className="pp-report">
                <div className="pp-report__icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M9 14l2 2 4-4M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"
                      stroke="currentColor" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="pp-report__info">
                  <span className="pp-report__name">{rep.name}</span>
                  <span className="pp-report__lab">{rep.lab}</span>
                  <span className="pp-report__date">{fmtDate(rep.date)}</span>
                </div>
                <div className="pp-report__right">
                  <span className={`pp-status ${STATUS_CLASS[rep.status] ?? "pp-status--green"}`}>
                    {rep.status}
                  </span>
                  <div className="pp-report__btns">
                                        <button
                      className="pp-report__btn"
                      onClick={() => setReportModal(rep)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                          stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="3"
                          stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      View
                    </button>
                    <button
                      className="pp-report__btn pp-report__btn--dl"
                      onClick={() => setReportModal({ ...rep, _autoDownload: true })}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4
                          M7 10l5 5 5-5M12 15V3"
                          stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ DOCUMENTS TAB ═══════════════════════════════ */}
        {activeTab === "documents" && (
          <div className="pp-feed">
            <div className="pp-feed__header">
              <span className="pp-feed__title">Documents</span>
              <span className="pp-feed__count">
                {(base.documents as any[]).length} files
              </span>
            </div>

            <div className="pp-doc-grid">
              {(base.documents as any[]).map((doc: any) => (
                <div key={doc.id} className="pp-doc-card">
                  <div
                    className="pp-doc-card__icon"
                    style={{
                      background: `${DOC_TYPE_COLORS[doc.type] ?? "#6366f1"}18`,
                      color: DOC_TYPE_COLORS[doc.type] ?? "#6366f1",
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                        stroke="currentColor" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 2v6h6"
                        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </div>

                  <div className="pp-doc-card__info">
                    <span className="pp-doc-card__name">{doc.name}</span>
                    <div className="pp-doc-card__meta">
                      <span
                        className="pp-doc-card__type"
                        style={{ color: DOC_TYPE_COLORS[doc.type] ?? "#6366f1" }}
                      >
                        {doc.type}
                      </span>
                      <span className="pp-doc-card__date">{fmtDate(doc.date)}</span>
                      <span className="pp-doc-card__pages">
                        {doc.pages} page{doc.pages > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="pp-doc-card__actions">
                    <button
                      className="pp-doc-card__btn pp-doc-card__btn--view"
                      aria-label="View document"
                      onClick={() => setDocModal(doc)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                          stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="3"
                          stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      View
                    </button>
                    <button
                      className="pp-doc-card__btn"
                      aria-label="Download document"
                      onClick={() => setDocModal({ ...doc, _autoDownload: true })}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4
                          M7 10l5 5 5-5M12 15V3"
                          stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload placeholder */}
            <div className="pp-upload-zone">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4
                  M17 8l-5-5-5 5M12 3v12"
                  stroke="#94a3b8" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Drag &amp; drop or click to upload a document</span>
              <small>PDF, JPG, PNG up to 10 MB — Demo only, not stored</small>
            </div>
          </div>
        )}

        {/* ══ VITAL SIGNS TAB ═════════════════════════════ */}
        {activeTab === "vitals" && (
          <div className="pp-feed">
            <div className="pp-feed__header">
              <span className="pp-feed__title">Vital Signs</span>
              <span className="pp-feed__count">Last updated today</span>
            </div>

            <div className="pp-vitals-grid">
              {(base.vitalSigns as any[]).map((vital: any) => (
                <div key={vital.label} className="pp-vital-card">
                  <div
                    className="pp-vital-card__icon"
                    style={{
                      background: `${VITAL_COLORS[vital.icon]}18`,
                      color: VITAL_COLORS[vital.icon],
                    }}
                  >
                    <VitalIcon icon={vital.icon} />
                  </div>
                  <div className="pp-vital-card__body">
                    <span className="pp-vital-card__label">{vital.label}</span>
                    <div className="pp-vital-card__value-row">
                      <span
                        className="pp-vital-card__value"
                        style={{ color: VITAL_COLORS[vital.icon] }}
                      >
                        {vital.value}
                      </span>
                      <span className="pp-vital-card__unit">{vital.unit}</span>
                    </div>
                    <div className="pp-vital-card__footer">
                      <span className="pp-status pp-status--green">{vital.status}</span>
                      <span className="pp-vital-card__date">{fmtDate(vital.recordedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pp-vitals-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M12 8v4m0 4h.01" stroke="currentColor"
                  strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Vitals are recorded during appointments and updated by your doctor.
              This is a demo — values are from mock data.
            </div>
          </div>
        )}

        {/* ══ EMERGENCY TAB ═══════════════════════════════ */}
        {activeTab === "emergency" && (
          <div className="pp-feed">
            <div className="pp-feed__header">
              <span className="pp-feed__title">Emergency Information</span>
            </div>

            {/* Emergency Contact card */}
            <section className="pp-card pp-card--emergency">
              <div className="pp-card__header">
                <div className="pp-card__title pp-card__title--red">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.09
                      4.18 2 2 0 015.09 2h3a2 2 0 012 1.72c.12.96.36 1.9.7
                      2.81a2 2 0 01-.45 2.11L9.09 9.91a16 16 0 006 6l1.27-1.27a2
                      2 0 012.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0122 16.92z"
                      stroke="currentColor" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Emergency Contact
                </div>
                {!editing ? (
                  <button className="pp-edit-btn" onClick={startEdit}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0
                        002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1
                        1-4 9.5-9.5z"
                        stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Edit
                  </button>
                ) : (
                  <div className="pp-edit-actions">
                    <button className="pp-edit-btn pp-edit-btn--ghost" onClick={cancelEdit}>
                      Cancel
                    </button>
                    <button className="pp-edit-btn pp-edit-btn--save" onClick={saveEdit}>
                      Save
                    </button>
                  </div>
                )}
              </div>

              <div className="pp-card__body">
                {!editing ? (
                  <div className="pp-emergency-contact">
                    <div className="pp-emergency-contact__avatar">
                      {profile.emergencyContact.name.charAt(0)}
                    </div>
                    <div className="pp-emergency-contact__info">
                      <span className="pp-emergency-contact__name">
                        {profile.emergencyContact.name}
                      </span>
                      <span className="pp-emergency-contact__relation">
                        {profile.emergencyContact.relation}
                      </span>
                      <a
                        href={`tel:${profile.emergencyContact.phone}`}
                        className="pp-emergency-contact__phone"
                      >
                        📞 {profile.emergencyContact.phone}
                      </a>
                    </div>
                    <a
                      href={`tel:${profile.emergencyContact.phone}`}
                      className="pp-emergency-contact__call-btn"
                    >
                      Call
                    </a>
                  </div>
                ) : (
                  <dl className="pp-details">
                    <EditableField
                      label="Contact Name"
                      value={draft.emergencyContact.name}
                      editing={true}
                      onChange={(v) => setEmergencyField("name", v)}
                    />
                    <EditableField
                      label="Relation"
                      value={draft.emergencyContact.relation}
                      type="select"
                      options={["Mother","Father","Spouse","Sibling","Child","Friend","Guardian","Other"]}
                      editing={true}
                      onChange={(v) => setEmergencyField("relation", v)}
                    />
                    <EditableField
                      label="Phone Number"
                      value={draft.emergencyContact.phone}
                      type="tel"
                      editing={true}
                      onChange={(v) => setEmergencyField("phone", v)}
                    />
                  </dl>
                )}
              </div>
            </section>

            {/* Critical Medical Info card */}
            <section className="pp-card">
              <div className="pp-card__header">
                <div className="pp-card__title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 8V4m0 0a4 4 0 100 8m0-8a4 4 0 000 8m0 0v8"
                      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  Critical Medical Information
                </div>
              </div>
              <div className="pp-card__body">
                <div className="pp-crit-grid">
                  <div className="pp-crit-item pp-crit-item--blood">
                    <span className="pp-crit-item__label">Blood Group</span>
                    <span className="pp-crit-item__value">{profile.bloodGroup}</span>
                  </div>

                  <div className="pp-crit-item">
                    <span className="pp-crit-item__label">Allergies</span>
                    <div className="pp-tag-row" style={{ marginTop: 6 }}>
                      {(profile.allergies as string[]).map((a) => (
                        <span key={a} className="pp-tag pp-tag--red">{a}</span>
                      ))}
                    </div>
                  </div>

                  <div className="pp-crit-item">
                    <span className="pp-crit-item__label">Chronic Conditions</span>
                    <div className="pp-tag-row" style={{ marginTop: 6 }}>
                      {(profile.chronicConditions as string[]).map((c) => (
                        <span key={c} className="pp-tag pp-tag--amber">{c}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pp-emergency-note">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0
                      001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4h.01"
                      stroke="currentColor" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Show this screen to emergency medical personnel.
                  This information is stored locally in your browser only.
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* ── Modals ────────────────────────────────────────── */}
      {reportModal && (
        <ReportViewerModal
          report={reportModal}
          patientName={profile.name}
          onClose={() => setReportModal(null)}
        />
      )}

      {docModal && (
        <DocumentViewerModal
          doc={docModal}
          patientName={profile.name}
          onClose={() => setDocModal(null)}
        />
      )}
    </div>
  );
}