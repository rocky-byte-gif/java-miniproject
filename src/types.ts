export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email?: string;
  bloodGroup: BloodGroup;
  allergies: string;
  address?: string;
  emergencyContact?: string;
  registeredAt: string;
}

export type DoctorStatus = 'Available' | 'In Consultation' | 'On Leave';

export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  room: string;
  phone: string;
  status: DoctorStatus;
}

export type ApptStatus = 'Booked' | 'Completed' | 'Cancelled';
export type ApptType = 'General Consultation' | 'Follow-up' | 'Emergency' | 'Routine Checkup';

export interface Appointment {
  id: number;
  patientId: string;
  doctorId: number;
  date: string; // YYYY-MM-DD
  slot: string; // HH:mm
  status: ApptStatus;
  type: ApptType;
  notes?: string;
  bookedAt: string;
}

export interface WaitEntry {
  id: number;
  patientId: string;
  doctorId: number;
  date: string;
  slot: string;
  type: ApptType;
  queuedAt: string;
  notes?: string;
}

export interface Vitals {
  bpSystolic?: number;
  bpDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  spO2?: number;
  weightKg?: number;
}

export interface PrescriptionItem {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string; // e.g. "1-0-1", "Once daily"
  duration: string;  // e.g. "5 days"
  instructions: string; // e.g. "After meals"
}

export interface MedRecord {
  id: number;
  patientId: string;
  doctorId: number;
  doctorName: string;
  date: string;
  diagnosis: string;
  symptoms?: string;
  vitals: Vitals;
  prescriptions: PrescriptionItem[];
  clinicalNotes?: string;
  followUpDate?: string;
}

export type BillCategory = 'Consultation' | 'Pharmacy' | 'Lab Test' | 'Procedure' | 'Other';

export interface BillItem {
  id: string;
  description: string;
  category: BillCategory;
  qty: number;
  unitPrice: number;
  amount: number;
}

export type PaymentMethod = 'Cash' | 'UPI / QR' | 'Credit/Debit Card' | 'Medical Insurance';

export interface Bill {
  id: number;
  invoiceNumber: string;
  patientId: string;
  date: string;
  items: BillItem[];
  subtotal: number;
  discountPercent: number;
  taxPercent: number;
  total: number;
  status: 'Pending' | 'Paid';
  paymentMethod?: PaymentMethod;
  paidAt?: string;
  transactionRef?: string;
  notes?: string;
}

export type LogLevel = 'info' | 'success' | 'warn' | 'error';
export type LogCategory = 'Appointment' | 'Billing' | 'Patient' | 'Doctor' | 'Concurrency' | 'System';

export interface LogEntry {
  id: number;
  time: string;
  level: LogLevel;
  category: LogCategory;
  msg: string;
}

export interface SequenceTracker {
  appt: number;
  wait: number;
  record: number;
  bill: number;
  log: number;
  patientNum: number;
}

export interface State {
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  waitlist: WaitEntry[];
  records: MedRecord[];
  bills: Bill[];
  log: LogEntry[];
  seq: SequenceTracker;
}

export interface BookResult {
  ok: boolean;
  waitlisted?: boolean;
  message: string;
  patientName?: string;
  threadId?: number;
  executionMs?: number;
}
