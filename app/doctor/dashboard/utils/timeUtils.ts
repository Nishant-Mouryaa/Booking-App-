export function formatTimeLabel(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function parseHoursString(raw: string): { start: string; end: string } {
  const clean = raw.replace(/–/g, "-").trim();
  const parts = clean.split(/\s*-\s*/);

  const parseTime = (s: string): string => {
    s = s.trim();
    const hhmm = s.match(/^(\d{1,2}):(\d{2})$/);
    if (hhmm) return `${hhmm[1].padStart(2, "0")}:${hhmm[2]}`;

    const ampm = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
    if (ampm) {
      let h = parseInt(ampm[1]);
      const m = ampm[2] ? parseInt(ampm[2]) : 0;
      const meridiem = ampm[3].toUpperCase();
      if (meridiem === "PM" && h !== 12) h += 12;
      if (meridiem === "AM" && h === 12) h = 0;
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }

    const bare = s.match(/^(\d{1,2})$/);
    if (bare) return `${bare[1].padStart(2, "0")}:00`;
    return "09:00";
  };

  if (parts.length === 2) {
    return { start: parseTime(parts[0]), end: parseTime(parts[1]) };
  }
  return { start: "09:00", end: "17:00" };
}

export function formatHoursString(start: string, end: string): string {
  return `${formatTimeLabel(start)} - ${formatTimeLabel(end)}`;
}

export function generatePreviewSlots(
  startTime: string,
  endTime: string,
  slotDuration: number
): string[] {
  const result: string[] = [];
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  let current = sh * 60 + sm;
  const end = eh * 60 + em;
  let count = 0;
  while (current < end && count < 8) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    result.push(
      `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
    );
    current += slotDuration;
    count += 1;
  }
  return result;
}