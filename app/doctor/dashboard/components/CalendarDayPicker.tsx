"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ISO = (d: Date) => d.toISOString().slice(0, 10);   // "YYYY-MM-DD"

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth()    === b.getMonth()    &&
  a.getDate()     === b.getDate();

const isBeforeToday = (d: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
};

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_LABELS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

// Build the grid of Date | null for a given month
function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ChevronProps { direction: "left" | "right" }

function Chevron({ direction }: ChevronProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      {direction === "left"
        ? <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
        : <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export interface CalendarDayPickerProps {
  /** ISO date strings that are already selected */
  value: string[];
  onChange: (dates: string[]) => void;
}

export function CalendarDayPicker({ value, onChange }: CalendarDayPickerProps) {
  const today = useMemo(() => new Date(), []);
  const [open, setOpen]       = useState(false);
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [hovered, setHovered]     = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const cells = useMemo(
    () => buildMonthGrid(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const selectedSet = useMemo(() => new Set(value), [value]);

  const toggleDate = useCallback(
    (date: Date) => {
      if (isBeforeToday(date)) return;
      const key = ISO(date);
      const next = new Set(selectedSet);
      next.has(key) ? next.delete(key) : next.add(key);
      onChange(
        Array.from(next).sort()           // keep chronological order
      );
    },
    [selectedSet, onChange]
  );

  const clearAll = () => onChange([]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  // ── Trigger label ──────────────────────────────────────────────────────────
  const triggerLabel = useMemo(() => {
    if (value.length === 0) return "Select availability dates…";
    if (value.length === 1) {
      const d = new Date(value[0] + "T00:00:00");
      return d.toLocaleDateString("en-IN", {
        weekday: "short", day: "numeric", month: "short", year: "numeric",
      });
    }
    // Show first + last + count
    const first = new Date(value[0] + "T00:00:00").toLocaleDateString(
      "en-IN", { day: "numeric", month: "short" }
    );
    const last = new Date(value[value.length - 1] + "T00:00:00").toLocaleDateString(
      "en-IN", { day: "numeric", month: "short" }
    );
    return `${first} – ${last}  (${value.length} days)`;
  }, [value]);

  // ── Friendly list for the summary pill ────────────────────────────────────
  const summaryLines = useMemo(() => {
    return value.map((iso) =>
      new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
        weekday: "short", day: "numeric", month: "short", year: "numeric",
      })
    );
  }, [value]);

  return (
    <div className="cdp" ref={wrapperRef}>

      {/* ── Trigger button ── */}
      <button
        type="button"
        className={`cdp-trigger ${open ? "cdp-trigger--open" : ""}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="cdp-trigger__icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2"
              stroke="currentColor" strokeWidth="1.8" />
            <path d="M16 2v4M8 2v4M3 10h18"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
        <span className="cdp-trigger__label">{triggerLabel}</span>
        <span className={`cdp-trigger__caret ${open ? "cdp-trigger__caret--up" : ""}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {/* ── Popover ── */}
      {open && (
        <div className="cdp-popover" role="dialog" aria-label="Pick availability dates">

          {/* Header */}
          <div className="cdp-pop__header">
            <div className="cdp-pop__header-left">
              <span className="cdp-pop__title">Availability Calendar</span>
              <span className="cdp-pop__subtitle">
                Click dates to toggle · past dates are disabled
              </span>
            </div>
            {value.length > 0 && (
              <button type="button" className="cdp-pop__clear" onClick={clearAll}>
                Clear all
              </button>
            )}
          </div>

          {/* Month navigation */}
          <div className="cdp-nav">
            <button type="button" className="cdp-nav__btn" onClick={prevMonth}>
              <Chevron direction="left" />
            </button>
            <span className="cdp-nav__label">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button type="button" className="cdp-nav__btn" onClick={nextMonth}>
              <Chevron direction="right" />
            </button>
          </div>

          {/* Day-of-week header */}
          <div className="cdp-grid cdp-grid--head">
            {DAY_LABELS.map((l) => (
              <span key={l} className="cdp-cell cdp-cell--head">{l}</span>
            ))}
          </div>

          {/* Date grid */}
          <div className="cdp-grid">
            {cells.map((date, idx) => {
              if (!date) {
                return <span key={`empty-${idx}`} className="cdp-cell" />;
              }
              const key        = ISO(date);
              const isPast     = isBeforeToday(date);
              const isToday    = isSameDay(date, today);
              const isSelected = selectedSet.has(key);
              const isHovered  = hovered === key && !isPast;

              return (
                <button
                  key={key}
                  type="button"
                  disabled={isPast}
                  className={[
                    "cdp-cell",
                    "cdp-cell--day",
                    isPast     ? "cdp-cell--past"     : "",
                    isToday    ? "cdp-cell--today"    : "",
                    isSelected ? "cdp-cell--selected" : "",
                    isHovered && !isSelected ? "cdp-cell--hover" : "",
                  ].join(" ")}
                  onClick={() => toggleDate(date)}
                  onMouseEnter={() => setHovered(key)}
                  onMouseLeave={() => setHovered(null)}
                  aria-label={`${isSelected ? "Deselect" : "Select"} ${date.toDateString()}`}
                  aria-pressed={isSelected}
                >
                  <span className="cdp-cell__num">{date.getDate()}</span>
                  {isSelected && (
                    <span className="cdp-cell__dot" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="cdp-pop__footer">
            <span className="cdp-pop__count">
              {value.length === 0
                ? "No dates selected"
                : `${value.length} day${value.length > 1 ? "s" : ""} selected`}
            </span>
            <button
              type="button"
              className="cdp-pop__done"
              onClick={() => setOpen(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ── Selected dates summary chips ── */}
      {value.length > 0 && (
        <div className="cdp-chips" aria-label="Selected dates">
          {summaryLines.map((label, i) => (
            <span key={value[i]} className="cdp-chip">
              {label}
              <button
                type="button"
                className="cdp-chip__remove"
                aria-label={`Remove ${label}`}
                onClick={() => {
                  const next = value.filter((_, j) => j !== i);
                  onChange(next);
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}