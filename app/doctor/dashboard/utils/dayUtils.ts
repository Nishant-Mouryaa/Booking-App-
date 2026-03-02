import { WEEK_DAYS } from "../constants/calendarConstants";

export function parseDaysString(raw: string): string[] {
  const normalized = raw.trim();

  // Range: "Mon-Fri" or "Monday to Friday"
  const rangeMatch = normalized.match(/^(\w+)\s*[-–to]+\s*(\w+)$/i);
  if (rangeMatch) {
    const from = WEEK_DAYS.findIndex(
      (d) =>
        d.short.toLowerCase() === rangeMatch[1].toLowerCase().slice(0, 3) ||
        d.long.toLowerCase() === rangeMatch[1].toLowerCase()
    );
    const to = WEEK_DAYS.findIndex(
      (d) =>
        d.short.toLowerCase() === rangeMatch[2].toLowerCase().slice(0, 3) ||
        d.long.toLowerCase() === rangeMatch[2].toLowerCase()
    );
    if (from !== -1 && to !== -1) {
      const result: string[] = [];
      for (let i = from; i <= to; i++) result.push(WEEK_DAYS[i].short);
      return result;
    }
  }

  // Comma / space separated
  return normalized
    .split(/[,\s]+/)
    .map((token) => {
      const found = WEEK_DAYS.find(
        (d) =>
          d.short.toLowerCase() === token.toLowerCase().slice(0, 3) ||
          d.long.toLowerCase() === token.toLowerCase()
      );
      return found?.short ?? null;
    })
    .filter(Boolean) as string[];
}

export function formatDaysString(days: string[]): string {
  if (days.length === 0) return "";
  if (days.length === 1) return days[0];

  const indices = days.map((d) =>
    WEEK_DAYS.findIndex((w) => w.short === d)
  );
  indices.sort((a, b) => a - b);

  const isRange = indices.every(
    (idx, i) => i === 0 || idx === indices[i - 1] + 1
  );

  if (isRange && days.length > 2) {
    return `${WEEK_DAYS[indices[0]].short}-${
      WEEK_DAYS[indices[indices.length - 1]].short
    }`;
  }
  return days.join(", ");
}