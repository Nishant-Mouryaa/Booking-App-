import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import mockData from "@/data/mockData.json";
import { loadOverrides, saveOverrides } from "../utils/overrides";
import type { Doctor, DoctorOverrides } from "../types/doctor.types";

export function useDoctorDashboard() {
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [overrides, setOverrides] = useState<DoctorOverrides>({});
  const [saving, setSaving] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const doctorId = useMemo(() => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("doctorId");
    return raw ? Number(raw) : null;
  }, []);

  useEffect(() => {
    setAuthChecked(true);
  }, [router]);

  useEffect(() => {
    if (!authChecked || !doctorId) return;
    const base = (mockData.doctors as Doctor[]).find((d) => d.id === doctorId);
    if (!base) {
      router.replace("/doctor/login");
      return;
    }
    setDoctor(base);
    const store = loadOverrides();
    setOverrides(store[doctorId] || {});
  }, [doctorId, authChecked, router]);

  const mergedDoctor = useMemo(() => {
    if (!doctor) return null;
    return {
      ...doctor,
      name: overrides.name ?? doctor.name,
      specialty: overrides.specialty ?? doctor.specialty,
      qualification: overrides.qualification ?? doctor.qualification,
      experience: overrides.experience ?? doctor.experience,
      consultationFee: overrides.consultationFee ?? doctor.consultationFee,
      timing: overrides.timing ?? doctor.timing,
      available: overrides.available ?? doctor.available,
      availability: {
        days: overrides.availabilityDays ?? doctor.availability.days,
        hours: overrides.availabilityHours ?? doctor.availability.hours,
      },
    };
  }, [doctor, overrides]);

  const isAvailable = mergedDoctor?.available ?? true;

  const handleFieldChange = <K extends keyof DoctorOverrides>(
    key: K,
    value: DoctorOverrides[K]
  ) => {
    setOverrides((prev) => ({ ...prev, [key]: value }));
  };

  const handleAvailabilityToggle = () => {
    if (!doctor || !doctorId) return;
    const newValue = !isAvailable;
    const updatedOverrides = { ...overrides, available: newValue };
    setOverrides(updatedOverrides);
    const store = loadOverrides();
    saveOverrides({ ...store, [doctorId]: updatedOverrides });
  };

  const handleSave = async () => {
    if (!doctor || !doctorId) return;
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    const store = loadOverrides();
    saveOverrides({ ...store, [doctorId]: overrides });
    setSaving(false);
    alert("Profile and appointment settings saved for this doctor.");
  };

  const handleReset = () => {
    if (!doctorId) return;
    const store = loadOverrides();
    setOverrides(store[doctorId] || {});
  };

  const handleLogout = () => {
    localStorage.removeItem("doctorId");
    router.push("/doctor/login");
  };

  return {
    doctor,
    mergedDoctor,
    overrides,
    saving,
    isAvailable,
    handleFieldChange,
    handleAvailabilityToggle,
    handleSave,
    handleReset,
    handleLogout,
  };
}