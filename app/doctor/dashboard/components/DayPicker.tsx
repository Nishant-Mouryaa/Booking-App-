"use client";

import { useMemo } from "react";
import { WEEK_DAYS } from "../constants/calendarConstants";
import { parseDaysString, formatDaysString } from "../utils/dayUtils";

interface DayPickerProps {
  value: string;
  onChange: (newVal: string) => void;
}

export function DayPicker({ value, onChange }: DayPickerProps) {
  const selected = useMemo(() => parseDaysString(value), [value]);

  const toggle = (short: string) => {
    const next = selected.includes(short)
      ? selected.filter((d) => d !== short)
      : [...selected, short];
    const ordered = WEEK_DAYS.map((d) => d.short).filter((s) =>
      next.includes(s)
    );
    onChange(formatDaysString(ordered));
  };

  return (
    <div className="dp-wrapper">
      {WEEK_DAYS.map((day) => {
        const active = selected.includes(day.short);
        return (
          <button
            key={day.short}
            type="button"
            title={day.long}
            className={`dp-day ${active ? "dp-day--active" : ""}`}
            onClick={() => toggle(day.short)}
          >
            {day.short}
          </button>
        );
      })}
    </div>
  );
}