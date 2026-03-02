import type { OverridesStore } from "../types/doctor.types";

export const loadOverrides = (): OverridesStore => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("doctorOverrides");
    return raw ? (JSON.parse(raw) as OverridesStore) : {};
  } catch {
    return {};
  }
};

export const saveOverrides = (data: OverridesStore): void => {
  try {
    localStorage.setItem("doctorOverrides", JSON.stringify(data));
  } catch {
    // ignore write errors
  }
};