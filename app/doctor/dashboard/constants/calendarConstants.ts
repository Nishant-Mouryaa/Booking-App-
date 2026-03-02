export const WEEK_DAYS = [
  { short: "Mon", long: "Monday" },
  { short: "Tue", long: "Tuesday" },
  { short: "Wed", long: "Wednesday" },
  { short: "Thu", long: "Thursday" },
  { short: "Fri", long: "Friday" },
  { short: "Sat", long: "Saturday" },
  { short: "Sun", long: "Sunday" },
] as const;

export const TIME_PRESETS = [
  { label: "Morning",   start: "06:00", end: "12:00" },
  { label: "Afternoon", start: "12:00", end: "17:00" },
  { label: "Evening",   start: "17:00", end: "21:00" },
  { label: "Full Day",  start: "08:00", end: "20:00" },
] as const;