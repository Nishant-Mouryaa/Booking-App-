"use client";

import { useMemo } from "react";
import { TIME_PRESETS } from "../constants/calendarConstants";
import {
  parseHoursString,
  formatHoursString,
  formatTimeLabel,
} from "../utils/timeUtils";

interface TimeRangePickerProps {
  value: string;
  onChange: (newVal: string) => void;
}

export function TimeRangePicker({ value, onChange }: TimeRangePickerProps) {
  const { start, end } = useMemo(() => parseHoursString(value), [value]);

  const setStart = (v: string) => onChange(formatHoursString(v, end));
  const setEnd   = (v: string) => onChange(formatHoursString(start, v));
  const applyPreset = (p: (typeof TIME_PRESETS)[number]) =>
    onChange(formatHoursString(p.start, p.end));
  const isActivePreset = (p: (typeof TIME_PRESETS)[number]) =>
    p.start === start && p.end === end;

  return (
    <div className="trp-wrapper">
      <div className="trp-presets">
        {TIME_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className={`trp-preset ${isActivePreset(p) ? "trp-preset--active" : ""}`}
            onClick={() => applyPreset(p)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="trp-range">
        <div className="trp-range-field">
          <span className="trp-range-label">From</span>
          <input
            type="time"
            className="dd-input trp-time-input"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
          <span className="trp-range-display">{formatTimeLabel(start)}</span>
        </div>

        <div className="trp-divider">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="trp-range-field">
          <span className="trp-range-label">To</span>
          <input
            type="time"
            className="dd-input trp-time-input"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
          <span className="trp-range-display">{formatTimeLabel(end)}</span>
        </div>
      </div>

      <div className="trp-summary">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M12 6v6l4 2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <span>
          Patients will see:{" "}
          <strong>{formatHoursString(start, end)}</strong>
        </span>
      </div>
    </div>
  );
}