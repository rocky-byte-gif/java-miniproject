import { useSyncExternalStore } from 'react';
import type {
  Appointment,
  ApptStatus,
  ApptType,
  Bill,
  BloodGroup,
  BookResult,
  Doctor,
  DoctorStatus,
  LogCategory,
  LogLevel,
  MedRecord,
  Patient,
  PaymentMethod,
  State,
} from '../types';

const KEY = 'medisync-lite-v2';

export const SLOTS = [
  '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const todayDate = () => new Date().toISOString().slice(0, 10);
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function formatDate(dStr: string): string {
  if (!dStr) return '';
  try {
    const parts = dStr.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return dStr;
  } catch {
    return dStr;
  }
}

function seed(): State {
  const today = todayDate();
  const s: State = {
    patients: [
      {
        id: 'MS-2026-0001',
        name: 'Aarav Sharma',
        age: 32,
        gender: 'Male',
        phone: '9876543210',
        email: 'aarav.sharma@example.com',
        bloodGroup: 'B+',
        allergies: 'None',
        address: 'Flat 402, Green Acres, Pune',
        emergencyContact: '9876543219 (Spouse)',
        registeredAt: '2026-01-10',
      },
      {
        id: 'MS-2026-0002',
        name: 'Sunita Deshmukh',
        age: 45,
        gender: 'Female',
        phone: '9822334455',
        email: 'sunita.d@example.com',
        bloodGroup: 'O+',
        allergies: 'Penicillin, NSAIDs',
        address: 'B-12, Sunshine Colony, Pune',
        emergencyContact: '9822334499 (Brother)',
        registeredAt: '2026-02-14',
      },
      {
        id: 'MS-2026-0003',
        name: 'Vikram Joshi',
        age: 28,
        gender: 'Male',
        phone: '9123456789',
        email: 'vikram.j@example.com',
        bloodGroup: 'A+',
        allergies: 'Dust, Pollen',
        address: 'Rowhouse 4, Model Colony, Pune',
        emergencyContact: '9123456780 (Father)',
        registeredAt: '2026-03-01',
      },
      {
        id: 'MS-2026-0004',
        name: 'Neha Kulkarni',
        age: 36,
        gender: 'Female',
        phone: '9988776655',
        email: 'neha.k@example.com',
        bloodGroup: 'AB+',
        allergies: 'None',
        address: '15 Shivaji Nagar, Pune',
        emergencyContact: '9988776600 (Husband)',
        registeredAt: '2026-03-12',
      },
      {
        id: 'MS-2026-0005',
        name: 'Rahul Patil',
        age: 52,
        gender: 'Male',
        phone: '9765432109',
        email: 'rahul.patil@example.com',
        bloodGroup: 'O-',
        allergies: 'Sulfa drugs',
        address: 'Plot 88, Kothrud, Pune',
        emergencyContact: '9765432100 (Son)',
        registeredAt: '2026-03-20',
      },
      {
        id: 'MS-2026-0006',
        name: 'Ananya Iyer',
        age: 8,
        gender: 'Female',
        phone: '9812345670',
        email: 'parent.iyer@example.com',
        bloodGroup: 'B-',
        allergies: 'Peanuts',
        address: 'Flat 101, Aundh, Pune',
        emergencyContact: '9812345671 (Mother)',
        registeredAt: '2026-04-02',
      },
    ],
    doctors: [
      {
        id: 1,
        name: 'Dr. Rajesh Mehta',
        specialization: 'General Medicine',
        qualification: 'MBBS, MD (Medicine)',
        experienceYears: 18,
        consultationFee: 500,
        room: 'Cabin 101',
        phone: '9822001122',
        status: 'Available',
      },
      {
        id: 2,
        name: 'Dr. Aditi Rao',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD, DM (Cardiology)',
        experienceYears: 14,
        consultationFee: 800,
        room: 'Cabin 102',
        phone: '9822003344',
        status: 'Available',
      },
      {
        id: 3,
        name: 'Dr. Farhan Khan',
        specialization: 'Pediatrics',
        qualification: 'MBBS, MD (Pediatrics), DCH',
        experienceYears: 11,
        consultationFee: 600,
        room: 'Cabin 103',
        phone: '9822005566',
        status: 'Available',
      },
      {
        id: 4,
        name: 'Dr. Priya Nair',
        specialization: 'Dermatology',
        qualification: 'MBBS, MD (DVL)',
        experienceYears: 9,
        consultationFee: 700,
        room: 'Cabin 104',
        phone: '9822007788',
        status: 'In Consultation',
      },
    ],
    appointments: [
      {
        id: 1,
        patientId: 'MS-2026-0001',
        doctorId: 1,
        date: today,
        slot: '09:00',
        status: 'Completed',
        type: 'Routine Checkup',
        notes: 'Seasonal cough and mild fatigue',
        bookedAt: `${today} 08:30:00`,
      },
      {
        id: 2,
        patientId: 'MS-2026-0002',
        doctorId: 2,
        date: today,
        slot: '10:00',
        status: 'Booked',
        type: 'Follow-up',
        notes: 'Hypertension evaluation and ECG review',
        bookedAt: `${today} 08:45:00`,
      },
      {
        id: 3,
        patientId: 'MS-2026-0004',
        doctorId: 1,
        date: today,
        slot: '11:00',
        status: 'Booked',
        type: 'General Consultation',
        notes: 'Persistent headaches for 3 days',
        bookedAt: `${today} 09:15:00`,
      },
    ],
    waitlist: [
      {
        id: 1,
        patientId: 'MS-2026-0003',
        doctorId: 2,
        date: today,
        slot: '10:00',
        type: 'Follow-up',
        queuedAt: '09:20:14',
        notes: 'Priority waitlist for Dr. Rao cardiology slot',
      },
    ],
    records: [
      {
        id: 1,
        patientId: 'MS-2026-0002',
        doctorId: 2,
        doctorName: 'Dr. Aditi Rao',
        date: today,
        diagnosis: 'Essential Hypertension (Stage 1)',
        symptoms: 'Mild dizziness in mornings, occasional palpitations',
        vitals: {
          bpSystolic: 142,
          bpDiastolic: 88,
          heartRate: 78,
          temperature: 98.4,
          spO2: 99,
          weightKg: 64.5,
        },
        prescriptions: [
          {
            id: 'rx-1',
            medicine: 'Tab. Amlodipine',
            dosage: '5 mg',
            frequency: '1-0-0 (Morning)',
            duration: '30 days',
            instructions: 'Take after breakfast with water',
          },
          {
            id: 'rx-2',
            medicine: 'Tab. Telmisartan',
            dosage: '40 mg',
            frequency: '0-0-1 (Night)',
            duration: '30 days',
            instructions: 'Take at bedtime',
          },
        ],
        clinicalNotes: 'Low sodium DASH diet advised. Repeat serum electrolytes in 4 weeks.',
        followUpDate: '2026-11-18',
      },
      {
        id: 2,
        patientId: 'MS-2026-0001',
        doctorId: 1,
        doctorName: 'Dr. Rajesh Mehta',
        date: today,
        diagnosis: 'Acute Viral Pharyngitis',
        symptoms: 'Dry cough, throat irritation, low grade fever',
        vitals: {
          bpSystolic: 120,
          bpDiastolic: 80,
          heartRate: 74,
          temperature: 99.2,
          spO2: 98,
          weightKg: 72,
        },
        prescriptions: [
          {
            id: 'rx-3',
            medicine: 'Tab. Paracetamol',
            dosage: '650 mg',
            frequency: '1-0-1',
            duration: '3 days',
            instructions: 'SOS for fever or body ache',
          },
          {
            id: 'rx-4',
            medicine: 'Syp. Cetirizine + Dextromethorphan',
            dosage: '10 ml',
            frequency: '0-0-1 (Night)',
            duration: '5 days',
            instructions: 'Take before sleep, warm water gargles',
          },
        ],
        clinicalNotes: 'Hydration encouraged. Rest for 2 days.',
        followUpDate: '2026-10-25',
      },
    ],
    bills: [
      {
        id: 1,
        invoiceNumber: 'INV-2026-0001',
        patientId: 'MS-2026-0002',
        date: today,
        items: [
          { id: 'bi-1', description: 'Specialist Consultation (Cardiology)', category: 'Consultation', qty: 1, unitPrice: 800, amount: 800 },
          { id: 'bi-2', description: 'Resting 12-Lead ECG Analysis', category: 'Lab Test', qty: 1, unitPrice: 400, amount: 400 },
          { id: 'bi-3', description: 'Hypertension Pharmacy Kit (Amlodipine + Telmisartan)', category: 'Pharmacy', qty: 1, unitPrice: 250, amount: 250 },
        ],
        subtotal: 1450,
        discountPercent: 0,
        taxPercent: 0,
        total: 1450,
        status: 'Pending',
        notes: 'Payment expected at insurance desk or front desk counter',
      },
      {
        id: 2,
        invoiceNumber: 'INV-2026-0002',
        patientId: 'MS-2026-0001',
        date: today,
        items: [
          { id: 'bi-4', description: 'General Physician Consultation', category: 'Consultation', qty: 1, unitPrice: 500, amount: 500 },
          { id: 'bi-5', description: 'Fever & Cough Medication Dispensation', category: 'Pharmacy', qty: 1, unitPrice: 180, amount: 180 },
        ],
        subtotal: 680,
        discountPercent: 0,
        taxPercent: 0,
        total: 680,
        status: 'Paid',
        paymentMethod: 'UPI / QR',
        paidAt: `${today} 09:40:12`,
        transactionRef: 'UPI-982348210984',
        notes: 'Paid via GPay at Reception',
      },
    ],
    log: [],
    seq: { appt: 3, wait: 1, record: 2, bill: 2, log: 0, patientNum: 6 },
  };

  s.log.push({
    id: 1,
    time: new Date().toLocaleTimeString(),
    level: 'info',
    category: 'System',
    msg: 'MediSync Lite Enterprise initialized with thread-safe concurrency engine & local storage cache.',
  });
  s.seq.log = 1;
  return s;
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      if (parsed && Array.isArray(parsed.patients) && Array.isArray(parsed.doctors) && parsed.seq) {
        return parsed;
      }
    }
  } catch {
    /* fall through to seed */
  }
  return seed();
}

let state: State = load();
const listeners = new Set<() => void>();

// Cross-tab synchronization
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY && e.newValue) {
      try {
        state = JSON.parse(e.newValue);
        listeners.forEach((l) => l());
      } catch {
        // ignore
      }
    }
  });
}

function update(fn: (s: State) => void) {
  const next = structuredClone(state);
  fn(next);
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked */
  }
  listeners.forEach((l) => l());
}

function addLog(s: State, level: LogLevel, category: LogCategory, msg: string) {
  s.log.unshift({
    id: ++s.seq.log,
    time: new Date().toLocaleTimeString(),
    level,
    category,
    msg,
  });
  if (s.log.length > 250) s.log.length = 250;
}

export function useStore(): State {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    () => state,
  );
}

export const getState = () => state;

export const patientName = (s: State, id: string) => s.patients.find((p) => p.id === id)?.name ?? id;
export const getPatient = (s: State, id: string) => s.patients.find((p) => p.id === id);
export const doctorName = (s: State, id: number) => s.doctors.find((d) => d.id === id)?.name ?? `#${id}`;
export const getDoctor = (s: State, id: number) => s.doctors.find((d) => d.id === id);

export const money = (n: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);

/* ---------- Mutex: Promise-chain thread-safety engine ---------- */
export class Mutex {
  private tail: Promise<unknown> = Promise.resolve();
  private isLocked = false;
  private queueLength = 0;

  get locked(): boolean {
    return this.isLocked;
  }

  get queue(): number {
    return this.queueLength;
  }

  run<T>(fn: () => Promise<T>): Promise<T> {
    this.queueLength++;
    const result = this.tail.then(async () => {
      this.isLocked = true;
      try {
        return await fn();
      } finally {
        this.queueLength = Math.max(0, this.queueLength - 1);
        if (this.queueLength === 0) {
          this.isLocked = false;
        }
      }
    });
    this.tail = result.catch(() => undefined);
    return result;
  }
}

export const bookingLock = new Mutex();

/* ---------- Patient Management ---------- */
export function addPatient(p: Omit<Patient, 'id' | 'registeredAt'>): Patient {
  let created!: Patient;
  update((s) => {
    s.seq.patientNum = (s.seq.patientNum || s.patients.length) + 1;
    created = {
      ...p,
      id: `MS-${new Date().getFullYear()}-${String(s.seq.patientNum).padStart(4, '0')}`,
      registeredAt: todayDate(),
    };
    s.patients.push(created);
    addLog(s, 'success', 'Patient', `Registered patient: ${created.name} (${created.id}) - Blood: ${created.bloodGroup}`);
  });
  return created;
}

export function updatePatient(id: string, patch: Partial<Omit<Patient, 'id' | 'registeredAt'>>) {
  update((s) => {
    const idx = s.patients.findIndex((p) => p.id === id);
    if (idx !== -1) {
      s.patients[idx] = { ...s.patients[idx], ...patch };
      addLog(s, 'info', 'Patient', `Updated profile information for patient: ${s.patients[idx].name} (${id})`);
    }
  });
}

export function deletePatient(id: string) {
  update((s) => {
    const name = patientName(s, id);
    s.patients = s.patients.filter((p) => p.id !== id);
    s.appointments = s.appointments.filter((a) => a.patientId !== id);
    s.waitlist = s.waitlist.filter((w) => w.patientId !== id);
    s.records = s.records.filter((r) => r.patientId !== id);
    s.bills = s.bills.filter((b) => b.patientId !== id);
    addLog(s, 'warn', 'Patient', `Deleted patient ${name} (${id}) and purged all cascading relational records.`);
  });
}

/* ---------- Doctor Management ---------- */
export function addDoctor(d: Omit<Doctor, 'id'>): Doctor {
  let created!: Doctor;
  update((s) => {
    const maxId = s.doctors.reduce((m, x) => Math.max(m, x.id), 0);
    created = { ...d, id: maxId + 1 };
    s.doctors.push(created);
    addLog(s, 'success', 'Doctor', `Added doctor: ${created.name} (${created.specialization}) - Room ${created.room}`);
  });
  return created;
}

export function updateDoctor(id: number, patch: Partial<Omit<Doctor, 'id'>>) {
  update((s) => {
    const doc = s.doctors.find((d) => d.id === id);
    if (doc) {
      Object.assign(doc, patch);
      addLog(s, 'info', 'Doctor', `Updated doctor information for ${doc.name}`);
    }
  });
}

export function setDoctorStatus(id: number, status: DoctorStatus) {
  update((s) => {
    const doc = s.doctors.find((d) => d.id === id);
    if (doc) {
      doc.status = status;
      addLog(s, 'info', 'Doctor', `${doc.name} status updated to: ${status}`);
    }
  });
}

/* ---------- Appointments & Concurrency Engine ---------- */
async function attemptBooking(
  patientId: string,
  doctorId: number,
  date: string,
  slot: string,
  type: ApptType = 'General Consultation',
  notes = '',
  threadId = 1,
  simulatedLatency = 35,
): Promise<BookResult> {
  const startTime = performance.now();
  // SNAPSHOT READ: Classic check-then-act vulnerability when safe=false
  const snap = state;
  const patient = snap.patients.find((p) => p.id === patientId);
  if (!patient) return { ok: false, message: 'Invalid patient ID', threadId };

  const doc = doctorName(snap, doctorId);

  // Check if patient already holds this exact slot
  const mine = snap.appointments.some(
    (a) => a.patientId === patientId && a.doctorId === doctorId && a.date === date && a.slot === slot && a.status === 'Booked',
  );
  if (mine) {
    return {
      ok: false,
      message: `${patient.name} already booked with ${doc} on ${date} @ ${slot}`,
      patientName: patient.name,
      threadId,
    };
  }

  // Check if slot is taken
  const taken = snap.appointments.some(
    (a) => a.doctorId === doctorId && a.date === date && a.slot === slot && a.status === 'Booked',
  );

  // Simulate database I/O latency & network round-trip window
  await sleep(simulatedLatency + Math.random() * 20);

  if (taken) {
    let queued = false;
    update((s) => {
      const dup = s.waitlist.some(
        (w) => w.patientId === patientId && w.doctorId === doctorId && w.date === date && w.slot === slot,
      );
      if (!dup) {
        s.waitlist.push({
          id: ++s.seq.wait,
          patientId,
          doctorId,
          date,
          slot,
          type,
          queuedAt: new Date().toLocaleTimeString(),
          notes,
        });
        queued = true;
      }
      addLog(
        s,
        'warn',
        'Appointment',
        dup
          ? `[Slot Conflict] ${patient.name} is already waitlisted for ${doc} on ${date} @ ${slot}`
          : `[Waitlist Enqueued] Slot ${doc} on ${date} @ ${slot} taken. Placed ${patient.name} into FIFO waitlist queue.`,
      );
    });
    const execMs = Math.round(performance.now() - startTime);
    return {
      ok: false,
      waitlisted: true,
      patientName: patient.name,
      threadId,
      executionMs: execMs,
      message: queued
        ? `Slot taken; ${patient.name} placed in waitlist (#${state.waitlist.length})`
        : `${patient.name} is already on the waitlist for this slot`,
    };
  }

  // ATOMIC INSERT
  update((s) => {
    s.appointments.push({
      id: ++s.seq.appt,
      patientId,
      doctorId,
      date,
      slot,
      status: 'Booked',
      type,
      notes: notes || undefined,
      bookedAt: `${todayDate()} ${new Date().toLocaleTimeString()}`,
    });
    addLog(
      s,
      'success',
      'Appointment',
      `[Booking Confirmed] Booked ${patient.name} with ${doc} on ${date} @ ${slot} (${type})`,
    );
  });

  const execMs = Math.round(performance.now() - startTime);
  return {
    ok: true,
    message: `Confirmed booking for ${patient.name} with ${doc} on ${date} @ ${slot}`,
    patientName: patient.name,
    threadId,
    executionMs: execMs,
  };
}

/**
 * safe=true: wrapped in Mutex critical section (Linearized ACID-like isolation)
 * safe=false: concurrent race-condition exposed for lab demonstrations
 */
export function bookAppointment(
  patientId: string,
  doctorId: number,
  date: string,
  slot: string,
  type: ApptType = 'General Consultation',
  notes = '',
  safe = true,
  threadId = 1,
  simulatedLatency = 35,
): Promise<BookResult> {
  return safe
    ? bookingLock.run(() => attemptBooking(patientId, doctorId, date, slot, type, notes, threadId, simulatedLatency))
    : attemptBooking(patientId, doctorId, date, slot, type, notes, threadId, simulatedLatency);
}

function promoteFromWaitlist(s: State, doctorId: number, date: string, slot: string) {
  const next = s.waitlist
    .filter((w) => w.doctorId === doctorId && w.date === date && w.slot === slot)
    .sort((a, b) => a.id - b.id)[0];
  if (!next) return;

  s.waitlist = s.waitlist.filter((w) => w.id !== next.id);
  s.appointments.push({
    id: ++s.seq.appt,
    patientId: next.patientId,
    doctorId,
    date,
    slot,
    status: 'Booked',
    type: next.type,
    notes: next.notes ? `Promoted from waitlist: ${next.notes}` : 'Promoted from waitlist',
    bookedAt: `${todayDate()} ${new Date().toLocaleTimeString()}`,
  });
  addLog(
    s,
    'success',
    'Appointment',
    `[Auto-Promotion] FIFO Waitlist promoted ${patientName(s, next.patientId)} to booked slot with ${doctorName(
      s,
      doctorId,
    )} on ${date} @ ${slot}`,
  );
}

export function cancelAppointment(id: number) {
  update((s) => {
    const a = s.appointments.find((x) => x.id === id);
    if (!a || a.status !== 'Booked') return;
    a.status = 'Cancelled';
    addLog(
      s,
      'info',
      'Appointment',
      `[Cancelled] Appointment #${id} for ${patientName(s, a.patientId)} with ${doctorName(s, a.doctorId)} on ${a.date} @ ${a.slot} was cancelled.`,
    );
    promoteFromWaitlist(s, a.doctorId, a.date, a.slot);
  });
}

export function completeAppointment(id: number) {
  update((s) => {
    const a = s.appointments.find((x) => x.id === id);
    if (!a || a.status !== 'Booked') return;
    a.status = 'Completed';
    addLog(
      s,
      'success',
      'Appointment',
      `[Visit Completed] Marked appointment #${id} for ${patientName(s, a.patientId)} with ${doctorName(
        s,
        a.doctorId,
      )} as completed.`,
    );
  });
}

export function rescheduleAppointment(id: number, newDate: string, newSlot: string): boolean {
  let ok = false;
  update((s) => {
    const a = s.appointments.find((x) => x.id === id);
    if (!a || a.status !== 'Booked') return;

    // Check if new slot is taken
    const isTaken = s.appointments.some(
      (x) => x.id !== id && x.doctorId === a.doctorId && x.date === newDate && x.slot === newSlot && x.status === 'Booked',
    );
    if (isTaken) {
      addLog(s, 'warn', 'Appointment', `Reschedule failed: ${doctorName(s, a.doctorId)} @ ${newSlot} is already booked.`);
      return;
    }

    const oldDate = a.date;
    const oldSlot = a.slot;
    a.date = newDate;
    a.slot = newSlot;
    ok = true;

    addLog(
      s,
      'success',
      'Appointment',
      `[Rescheduled] Moved ${patientName(s, a.patientId)} from ${oldDate} @ ${oldSlot} to ${newDate} @ ${newSlot}.`,
    );

    // Promote anyone waitlisted for the OLD slot!
    promoteFromWaitlist(s, a.doctorId, oldDate, oldSlot);
  });
  return ok;
}

export function removeWait(id: number) {
  update((s) => {
    const w = s.waitlist.find((x) => x.id === id);
    s.waitlist = s.waitlist.filter((x) => x.id !== id);
    if (w) {
      addLog(s, 'info', 'Appointment', `Removed ${patientName(s, w.patientId)} from waitlist queue.`);
    }
  });
}

export function findConflicts(s: State): Appointment[][] {
  const groups = new Map<string, Appointment[]>();
  for (const a of s.appointments) {
    if (a.status !== 'Booked') continue;
    const k = `${a.doctorId}|${a.date}|${a.slot}`;
    groups.set(k, [...(groups.get(k) ?? []), a]);
  }
  return [...groups.values()].filter((g) => g.length > 1);
}

/** Keep earliest booking per slot; gracefully move extras into the FIFO waitlist */
export function repairConflicts() {
  update((s) => {
    const groups = findConflicts(s);
    for (const g of groups) {
      const [, ...extras] = [...g].sort((a, b) => a.id - b.id);
      for (const e of extras) {
        e.status = 'Cancelled';
        s.waitlist.push({
          id: ++s.seq.wait,
          patientId: e.patientId,
          doctorId: e.doctorId,
          date: e.date,
          slot: e.slot,
          type: e.type,
          queuedAt: new Date().toLocaleTimeString(),
          notes: 'Auto-migrated from race condition resolution',
        });
      }
    }
    addLog(s, 'success', 'Concurrency', `Repaired ${groups.length} double-booked conflict(s). Excess bookings placed in FIFO waitlist.`);
  });
}

/* ---------- Medical Records & Clinical Documentation ---------- */
export function addRecord(r: Omit<MedRecord, 'id' | 'date'>) {
  update((s) => {
    s.records.unshift({
      ...r,
      id: ++s.seq.record,
      date: todayDate(),
    });
    addLog(s, 'success', 'Patient', `Created medical record #${s.seq.record} for ${patientName(s, r.patientId)} - ${r.diagnosis}`);
  });
}

export function deleteRecord(id: number) {
  update((s) => {
    const r = s.records.find((x) => x.id === id);
    s.records = s.records.filter((x) => x.id !== id);
    if (r) {
      addLog(s, 'info', 'Patient', `Deleted medical record #${id} for ${patientName(s, r.patientId)}`);
    }
  });
}

/* ---------- Billing & Financial Management ---------- */
export function addBill(b: Omit<Bill, 'id' | 'invoiceNumber' | 'total' | 'subtotal' | 'date'>) {
  update((s) => {
    const subtotal = b.items.reduce((sum, item) => sum + item.amount, 0);
    const discount = (subtotal * (b.discountPercent || 0)) / 100;
    const taxable = subtotal - discount;
    const tax = (taxable * (b.taxPercent || 0)) / 100;
    const total = Math.round(taxable + tax);

    const invSeq = ++s.seq.bill;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invSeq).padStart(4, '0')}`;

    const newBill: Bill = {
      ...b,
      id: invSeq,
      invoiceNumber,
      date: todayDate(),
      subtotal,
      total,
    };

    s.bills.unshift(newBill);
    addLog(s, 'success', 'Billing', `Generated Invoice ${invoiceNumber} for ${patientName(s, b.patientId)}: ${money(total)}`);
  });
}

export function setBillStatus(
  id: number,
  status: Bill['status'],
  paymentMethod?: PaymentMethod,
  transactionRef?: string,
) {
  update((s) => {
    const b = s.bills.find((x) => x.id === id);
    if (!b) return;
    b.status = status;
    if (status === 'Paid') {
      b.paymentMethod = paymentMethod || 'Cash';
      b.paidAt = `${todayDate()} ${new Date().toLocaleTimeString()}`;
      b.transactionRef = transactionRef || `TXN-${Date.now().toString().slice(-8)}`;
      addLog(s, 'success', 'Billing', `Invoice ${b.invoiceNumber} marked PAID (${b.paymentMethod}) - ${money(b.total)}`);
    } else {
      b.paymentMethod = undefined;
      b.paidAt = undefined;
      b.transactionRef = undefined;
      addLog(s, 'info', 'Billing', `Invoice ${b.invoiceNumber} reverted to PENDING status.`);
    }
  });
}

export function deleteBill(id: number) {
  update((s) => {
    const b = s.bills.find((x) => x.id === id);
    s.bills = s.bills.filter((x) => x.id !== id);
    if (b) {
      addLog(s, 'warn', 'Billing', `Deleted invoice ${b.invoiceNumber}`);
    }
  });
}

/* ---------- Data Management, SQL Generation & Backup ---------- */
export function log(level: LogLevel, category: LogCategory, msg: string) {
  update((s) => addLog(s, level, category, msg));
}

export function resetData() {
  state = seed();
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function importJson(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr) as State;
    if (data && Array.isArray(data.patients) && Array.isArray(data.doctors)) {
      state = data;
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
      } catch {
        // ignore
      }
      listeners.forEach((l) => l());
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

const escapeSql = (v: string | number | null | undefined): string => {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  return `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
};

export function exportSql(s: State): string {
  const out: string[] = [
    '-- ==========================================================================',
    '-- MediSync Enterprise - Clinic Management System Relational Database Export',
    `-- Export Generated: ${new Date().toISOString()}`,
    '-- MySQL 8.0+ / MariaDB 10.5+ Compatible Schema with ACID Transaction Logic',
    '-- ==========================================================================',
    '',
    'CREATE DATABASE IF NOT EXISTS medisync CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;',
    'USE medisync;',
    '',
    '-- Purge existing tables with Foreign Key dependency resolution',
    'SET FOREIGN_KEY_CHECKS = 0;',
    'DROP TABLE IF EXISTS bill_item;',
    'DROP TABLE IF EXISTS bill;',
    'DROP TABLE IF EXISTS prescription;',
    'DROP TABLE IF EXISTS medical_record;',
    'DROP TABLE IF EXISTS waitlist;',
    'DROP TABLE IF EXISTS appointment;',
    'DROP TABLE IF EXISTS doctor;',
    'DROP TABLE IF EXISTS patient;',
    'SET FOREIGN_KEY_CHECKS = 1;',
    '',
    '-- Table 1: Patient Registry',
    'CREATE TABLE patient (',
    '    id VARCHAR(20) PRIMARY KEY,',
    '    name VARCHAR(100) NOT NULL,',
    '    age INT NOT NULL CHECK (age >= 0 AND age <= 125),',
    '    gender ENUM("Male", "Female", "Other") NOT NULL,',
    '    phone VARCHAR(20) NOT NULL,',
    '    email VARCHAR(100),',
    '    blood_group VARCHAR(5) NOT NULL,',
    '    allergies TEXT,',
    '    address TEXT,',
    '    emergency_contact VARCHAR(100),',
    '    registered_at DATE NOT NULL',
    ') ENGINE=InnoDB;',
    '',
    '-- Table 2: Doctor Profiles',
    'CREATE TABLE doctor (',
    '    id INT PRIMARY KEY AUTO_INCREMENT,',
    '    name VARCHAR(100) NOT NULL,',
    '    specialization VARCHAR(80) NOT NULL,',
    '    qualification VARCHAR(80) NOT NULL,',
    '    experience_years INT NOT NULL,',
    '    consultation_fee DECIMAL(10,2) NOT NULL,',
    '    room VARCHAR(20) NOT NULL,',
    '    phone VARCHAR(20) NOT NULL,',
    '    status ENUM("Available", "In Consultation", "On Leave") DEFAULT "Available"',
    ') ENGINE=InnoDB;',
    '',
    '-- Table 3: Appointment Booking with Concurrency Index',
    'CREATE TABLE appointment (',
    '    id INT PRIMARY KEY AUTO_INCREMENT,',
    '    patient_id VARCHAR(20) NOT NULL,',
    '    doctor_id INT NOT NULL,',
    '    slot_date DATE NOT NULL,',
    '    slot_time VARCHAR(10) NOT NULL,',
    '    status ENUM("Booked", "Completed", "Cancelled") DEFAULT "Booked",',
    '    visit_type VARCHAR(50) DEFAULT "General Consultation",',
    '    notes TEXT,',
    '    booked_at DATETIME NOT NULL,',
    '    CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE,',
    '    CONSTRAINT fk_appt_doctor FOREIGN KEY (doctor_id) REFERENCES doctor(id) ON DELETE CASCADE,',
    '    INDEX idx_doctor_slot (doctor_id, slot_date, slot_time),',
    '    INDEX idx_patient_schedule (patient_id, slot_date)',
    ') ENGINE=InnoDB;',
    '',
    '-- Table 4: FIFO Waitlist for High-Contention Slots',
    'CREATE TABLE waitlist (',
    '    id INT PRIMARY KEY AUTO_INCREMENT,',
    '    patient_id VARCHAR(20) NOT NULL,',
    '    doctor_id INT NOT NULL,',
    '    slot_date DATE NOT NULL,',
    '    slot_time VARCHAR(10) NOT NULL,',
    '    visit_type VARCHAR(50) DEFAULT "General Consultation",',
    '    queued_at VARCHAR(30) NOT NULL,',
    '    notes TEXT,',
    '    CONSTRAINT fk_wait_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE,',
    '    CONSTRAINT fk_wait_doctor FOREIGN KEY (doctor_id) REFERENCES doctor(id) ON DELETE CASCADE,',
    '    INDEX idx_wait_doctor_slot (doctor_id, slot_date, slot_time)',
    ') ENGINE=InnoDB;',
    '',
    '-- Table 5: Medical Records & Clinical Documentation',
    'CREATE TABLE medical_record (',
    '    id INT PRIMARY KEY AUTO_INCREMENT,',
    '    patient_id VARCHAR(20) NOT NULL,',
    '    doctor_id INT NOT NULL,',
    '    doctor_name VARCHAR(100) NOT NULL,',
    '    record_date DATE NOT NULL,',
    '    diagnosis VARCHAR(255) NOT NULL,',
    '    symptoms TEXT,',
    '    bp_systolic INT,',
    '    bp_diastolic INT,',
    '    heart_rate INT,',
    '    temperature DECIMAL(4,1),',
    '    spo2 INT,',
    '    weight_kg DECIMAL(5,1),',
    '    clinical_notes TEXT,',
    '    follow_up_date DATE,',
    '    CONSTRAINT fk_record_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE,',
    '    CONSTRAINT fk_record_doctor FOREIGN KEY (doctor_id) REFERENCES doctor(id) ON DELETE CASCADE',
    ') ENGINE=InnoDB;',
    '',
    '-- Table 6: Invoices & Billing Ledger',
    'CREATE TABLE bill (',
    '    id INT PRIMARY KEY AUTO_INCREMENT,',
    '    invoice_number VARCHAR(30) UNIQUE NOT NULL,',
    '    patient_id VARCHAR(20) NOT NULL,',
    '    invoice_date DATE NOT NULL,',
    '    subtotal DECIMAL(10,2) NOT NULL,',
    '    discount_percent DECIMAL(5,2) DEFAULT 0.00,',
    '    tax_percent DECIMAL(5,2) DEFAULT 0.00,',
    '    total DECIMAL(10,2) NOT NULL,',
    '    status ENUM("Pending", "Paid") DEFAULT "Pending",',
    '    payment_method VARCHAR(50),',
    '    paid_at VARCHAR(40),',
    '    transaction_ref VARCHAR(100),',
    '    notes TEXT,',
    '    CONSTRAINT fk_bill_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE',
    ') ENGINE=InnoDB;',
    '',
    '-- Sample Data Ingestion',
  ];

  // Insert doctors
  out.push('-- Seed Doctors');
  s.doctors.forEach((d) => {
    out.push(
      `INSERT INTO doctor (id, name, specialization, qualification, experience_years, consultation_fee, room, phone, status) VALUES (${d.id}, ${escapeSql(d.name)}, ${escapeSql(d.specialization)}, ${escapeSql(d.qualification)}, ${d.experienceYears}, ${d.consultationFee}, ${escapeSql(d.room)}, ${escapeSql(d.phone)}, ${escapeSql(d.status)});`,
    );
  });
  out.push('');

  // Insert patients
  out.push('-- Seed Patients');
  s.patients.forEach((p) => {
    out.push(
      `INSERT INTO patient (id, name, age, gender, phone, email, blood_group, allergies, address, emergency_contact, registered_at) VALUES (${escapeSql(p.id)}, ${escapeSql(p.name)}, ${p.age}, ${escapeSql(p.gender)}, ${escapeSql(p.phone)}, ${escapeSql(p.email)}, ${escapeSql(p.bloodGroup)}, ${escapeSql(p.allergies)}, ${escapeSql(p.address)}, ${escapeSql(p.emergencyContact)}, ${escapeSql(p.registeredAt)});`,
    );
  });
  out.push('');

  // Insert appointments
  out.push('-- Seed Appointments');
  s.appointments.forEach((a) => {
    out.push(
      `INSERT INTO appointment (id, patient_id, doctor_id, slot_date, slot_time, status, visit_type, notes, booked_at) VALUES (${a.id}, ${escapeSql(a.patientId)}, ${a.doctorId}, ${escapeSql(a.date)}, ${escapeSql(a.slot)}, ${escapeSql(a.status)}, ${escapeSql(a.type)}, ${escapeSql(a.notes)}, ${escapeSql(a.bookedAt)});`,
    );
  });
  out.push('');

  // Insert waitlist
  out.push('-- Seed Waitlist');
  s.waitlist.forEach((w) => {
    out.push(
      `INSERT INTO waitlist (id, patient_id, doctor_id, slot_date, slot_time, visit_type, queued_at, notes) VALUES (${w.id}, ${escapeSql(w.patientId)}, ${w.doctorId}, ${escapeSql(w.date)}, ${escapeSql(w.slot)}, ${escapeSql(w.type)}, ${escapeSql(w.queuedAt)}, ${escapeSql(w.notes)});`,
    );
  });
  out.push('');

  // Insert records
  out.push('-- Seed Medical Records');
  s.records.forEach((r) => {
    out.push(
      `INSERT INTO medical_record (id, patient_id, doctor_id, doctor_name, record_date, diagnosis, symptoms, bp_systolic, bp_diastolic, heart_rate, temperature, spo2, weight_kg, clinical_notes, follow_up_date) VALUES (${r.id}, ${escapeSql(r.patientId)}, ${r.doctorId}, ${escapeSql(r.doctorName)}, ${escapeSql(r.date)}, ${escapeSql(r.diagnosis)}, ${escapeSql(r.symptoms)}, ${escapeSql(r.vitals?.bpSystolic)}, ${escapeSql(r.vitals?.bpDiastolic)}, ${escapeSql(r.vitals?.heartRate)}, ${escapeSql(r.vitals?.temperature)}, ${escapeSql(r.vitals?.spO2)}, ${escapeSql(r.vitals?.weightKg)}, ${escapeSql(r.clinicalNotes)}, ${escapeSql(r.followUpDate)});`,
    );
  });
  out.push('');

  // Insert bills
  out.push('-- Seed Bills');
  s.bills.forEach((b) => {
    out.push(
      `INSERT INTO bill (id, invoice_number, patient_id, invoice_date, subtotal, discount_percent, tax_percent, total, status, payment_method, paid_at, transaction_ref, notes) VALUES (${b.id}, ${escapeSql(b.invoiceNumber)}, ${escapeSql(b.patientId)}, ${escapeSql(b.date)}, ${b.subtotal}, ${b.discountPercent}, ${b.taxPercent}, ${b.total}, ${escapeSql(b.status)}, ${escapeSql(b.paymentMethod)}, ${escapeSql(b.paidAt)}, ${escapeSql(b.transactionRef)}, ${escapeSql(b.notes)});`,
    );
  });
  out.push('');

  return out.join('\n') + '\n';
}

export function download(name: string, text: string, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
