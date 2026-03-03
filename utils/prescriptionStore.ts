// utils/prescriptionStore.ts

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Prescription {
  id: string;
  appointmentId: number;
  doctorId: number;
  doctorName: string;
  specialty: string;
  patientEmail: string;
  date: string;
  medications: Medication[];
  notes: string;
  diagnosis: string;
  followUpDate?: string;
  createdAt: string;
}

const KEY = "prescriptions";

export const prescriptionStore = {
  getAll(): Prescription[] {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  },

  // Get prescriptions for a specific patient email
  getForPatient(email: string): Prescription[] {
    return this.getAll().filter((p) => p.patientEmail === email);
  },

  // Get prescriptions written by a specific doctor
  getForDoctor(doctorId: number): Prescription[] {
    return this.getAll().filter((p) => p.doctorId === doctorId);
  },

  save(prescription: Prescription): void {
    const all = this.getAll();
    const idx = all.findIndex((p) => p.id === prescription.id);
    if (idx >= 0) {
      all[idx] = prescription;
    } else {
      all.unshift(prescription); // newest first
    }
    localStorage.setItem(KEY, JSON.stringify(all));
  },

  delete(id: string): void {
    const filtered = this.getAll().filter((p) => p.id !== id);
    localStorage.setItem(KEY, JSON.stringify(filtered));
  },
};