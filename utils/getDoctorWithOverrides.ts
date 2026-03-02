import mockData from "@/data/mockData.json";

export interface DoctorSlotConfig {
  defaultStartTime?: string;
  defaultEndTime?: string;
  slotDurationMinutes?: number;
  maxPatientsPerSlot?: number;
  appointmentType?: "individual" | "group";
   selectedDates?: string[];
}

function format24to12(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const h12 = h % 12 || 12;
  const period = h < 12 ? "AM" : "PM";
  if (m === 0) return `${h12} ${period}`;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

export function getDoctorWithOverrides(doctorId: number): {
  doctor: any | null;
  slotConfig: DoctorSlotConfig | null;
} {
  const baseDoctor = (mockData.doctors as any[]).find(
    (d) => d.id === doctorId
  );
  if (!baseDoctor) return { doctor: null, slotConfig: null };

  if (typeof window === "undefined") {
    return { doctor: baseDoctor, slotConfig: null };
  }

  try {
    const raw = localStorage.getItem("doctorOverrides");
    if (!raw) return { doctor: baseDoctor, slotConfig: null };

    const allOverrides = JSON.parse(raw) as Record<number, any>;
    const ov = allOverrides[doctorId];
    if (!ov) return { doctor: baseDoctor, slotConfig: null };

    const {
      availabilityDays,
      availabilityHours,
      defaultStartTime,
      defaultEndTime,
      slotDurationMinutes,
      maxPatientsPerSlot,
      appointmentType,
      available,              // ✅ NEW: extract available toggle
      selectedDates,
      ...rest
    } = ov;

    let derivedTiming = rest.timing ?? baseDoctor.timing;
    let derivedHours =
      availabilityHours ?? baseDoctor.availability?.hours;

    if (defaultStartTime && defaultEndTime) {
      const formattedRange = `${format24to12(defaultStartTime)} - ${format24to12(defaultEndTime)}`;
      derivedTiming = formattedRange;
      if (!availabilityHours) {
        derivedHours = formattedRange;
      }
    }

    const mergedDoctor = {
      ...baseDoctor,
      ...rest,
      timing: derivedTiming,
      // ✅ If available is explicitly set (true/false), use it; otherwise keep base
      available: available !== undefined ? available : baseDoctor.available,
      availability: {
        ...baseDoctor.availability,
        ...(availabilityDays !== undefined && { days: availabilityDays }),
        hours: derivedHours,
      },
    };

    const hasSlotConfig =
      defaultStartTime ||
      defaultEndTime ||
      slotDurationMinutes ||
      maxPatientsPerSlot ||
      appointmentType;

    const slotConfig: DoctorSlotConfig | null = hasSlotConfig
      ? {
          defaultStartTime,
          defaultEndTime,
          slotDurationMinutes,
          maxPatientsPerSlot: maxPatientsPerSlot ?? 1,
          appointmentType: appointmentType ?? "individual",
          selectedDates,
        }
      : null;

    return { doctor: mergedDoctor, slotConfig };
  } catch {
    return { doctor: baseDoctor, slotConfig: null };
  }
}

export function getAllDoctorsWithOverrides(): any[] {
  return (mockData.doctors as any[]).map((doc) => {
    const { doctor } = getDoctorWithOverrides(doc.id);
    return doctor || doc;
  });
}