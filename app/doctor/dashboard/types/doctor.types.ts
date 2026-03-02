export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  qualification: string;
  experience: string;
  location?: string;
  image: string;
  rating: number;
  reviews: number;
  consultationFee: number;
  timing: string;
  available: boolean;
  availability: {
    days: string;
    hours: string;
  };
}

export interface DoctorOverrides {
  name?: string;
  specialty?: string;
  qualification?: string;
  experience?: string;
  location?: string;
  image?: string;
  about?: string;
  consultationFee?: number;
  timing?: string;
  available?: boolean;
  availabilityDays?: string;
  availabilityHours?: string;
  // ── NEW: stores ISO date strings the doctor picked on the calendar ──
  selectedDates?: string[];
  contactEmail?: string;
  contactPhone?: string;
  appointmentType?: "individual" | "group";
  slotDurationMinutes?: number;
  maxPatientsPerSlot?: number;
  defaultStartTime?: string;
  defaultEndTime?: string;
  recurringDay?: string;
}

export type OverridesStore = Record<number, DoctorOverrides>;