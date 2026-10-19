import {
  AlertTriangle,
  Calendar,
  CalendarCheck,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  FilePlus2,
  Filter,
  Receipt,
  RotateCcw,
  Search,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import {
  Badge,
  btn,
  Card,
  Field,
  input,
  Modal,
  PageHeader,
  select,
  Table,
  td,
  useToast,
} from '../components/ui';
import {
  bookAppointment,
  cancelAppointment,
  completeAppointment,
  doctorName,
  findConflicts,
  formatDate,
  money,
  patientName,
  removeWait,
  repairConflicts,
  rescheduleAppointment,
  SLOTS,
  todayDate,
  useStore,
} from '../lib/store';
import type { Appointment, ApptType } from '../types';

const statusTone: Record<string, 'blue' | 'green' | 'gray'> = {
  Booked: 'blue',
  Completed: 'green',
  Cancelled: 'gray',
};

const visitTypes: ApptType[] = [
  'General Consultation',
  'Follow-up',
  'Routine Checkup',
  'Emergency',
];

export default function Appointments({
  initialPatientId,
  onAddRecord,
  onGenerateBill,
}: {
  initialPatientId?: string;
  onAddRecord?: (patientId: string) => void;
  onGenerateBill?: (patientId: string) => void;
}) {
  const s = useStore();
  const { showToast } = useToast();
  const today = todayDate();

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(s.doctors[0]?.id || 1);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);

  // Booking Modal
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [patientId, setPatientId] = useState(initialPatientId || s.patients[0]?.id || '');
  const [visitType, setVisitType] = useState<ApptType>('General Consultation');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reschedule Modal
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState(today);
  const [rescheduleSlot, setRescheduleSlot] = useState(SLOTS[0]);

  // Filters for Table
  const [statusFilter, setStatusFilter] = useState<'All' | 'Booked' | 'Completed' | 'Cancelled'>('All');
  const [tableDateFilter, setTableDateFilter] = useState<'All' | 'Today'>('Today');

  const conflicts = findConflicts(s);
  const currentDoc = s.doctors.find((d) => d.id === selectedDoctorId) || s.doctors[0];

  const handleOpenBooking = (slot: string) => {
    setActiveSlot(slot);
    setBookModalOpen(true);
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSlot) return;
    if (!patientId) {
      showToast('Please select or register a patient first.', 'error');
      return;
    }

    setIsSubmitting(true);
    const result = await bookAppointment(
      patientId,
      selectedDoctorId,
      selectedDate,
      activeSlot,
      visitType,
      notes,
      true, // safe=true (using Mutex)
    );
    setIsSubmitting(false);

    if (result.ok) {
      showToast(result.message, 'success');
      setBookModalOpen(false);
      setNotes('');
    } else if (result.waitlisted) {
      showToast(result.message, 'warn');
      setBookModalOpen(false);
      setNotes('');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTarget) return;

    const success = rescheduleAppointment(rescheduleTarget.id, rescheduleDate, rescheduleSlot);
    if (success) {
      showToast(`Appointment rescheduled to ${rescheduleDate} @ ${rescheduleSlot}`, 'success');
      setRescheduleTarget(null);
    } else {
      showToast(`Slot ${rescheduleSlot} on ${rescheduleDate} is already occupied.`, 'error');
    }
  };

  // Filtered Appointments Table Rows
  const filteredAppts = s.appointments
    .filter((a) => {
      const matchesDate = tableDateFilter === 'All' || a.date === today;
      const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
      return matchesDate && matchesStatus;
    })
    .sort((a, b) => b.id - a.id);

  return (
    <>
      <PageHeader
        title="Appointment Scheduling & Queue"
        sub="Thread-safe slot allocation, multi-doctor calendar, and automated FIFO waitlist promotion"
        action={
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Zap size={14} /> Mutex Active (Zero Double-Booking)
            </span>
          </div>
        }
      />

      {/* Double-Booking Conflict Alert Banner (if created via unsafe lab) */}
      {conflicts.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-rose-900 shadow-sm dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-rose-600 p-2 text-white">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm">
                {conflicts.length} Double-Booked Slot Conflict(s) Detected!
              </h4>
              <p className="text-xs opacity-90">
                Created during unsafe simulation (Mutex OFF). Click Repair to preserve earliest booking and move others to FIFO waitlist.
              </p>
            </div>
          </div>
          <button
            className={btn.danger}
            onClick={() => {
              repairConflicts();
              showToast('Conflicts resolved: excess bookings safely moved to waitlist.', 'success');
            }}
          >
            <RotateCcw size={14} /> Auto-Repair All Conflicts
          </button>
        </div>
      )}

      {/* Scheduling Control Center */}
      <div className="mb-6 grid gap-6 xl:grid-cols-3">
        {/* Slot Grid Panel */}
        <Card
          title="Interactive Time-Slot Grid"
          subtitle={`Viewing schedule for ${currentDoc.name} (${currentDoc.specialization})`}
          icon={<CalendarPlus size={18} className="text-cyan-600" />}
          className="xl:col-span-2"
          action={
            <div className="flex items-center gap-1 text-xs">
              <span className="flex items-center gap-1 text-slate-500 mr-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Free
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> Booked
              </span>
            </div>
          }
        >
          {/* Controls: Date Picker & Doctor Selector */}
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Consultation Date
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  className={input}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                <button
                  type="button"
                  className={`${btn.ghost} shrink-0 text-xs`}
                  onClick={() => setSelectedDate(today)}
                >
                  Today
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Attending Specialist
              </label>
              <select
                className={select}
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
              >
                {s.doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} · {d.specialization} ({money(d.consultationFee)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time Slots Grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {SLOTS.map((slot) => {
              const appt = s.appointments.find(
                (a) =>
                  a.doctorId === selectedDoctorId &&
                  a.date === selectedDate &&
                  a.slot === slot &&
                  a.status === 'Booked',
              );
              const waitCount = s.waitlist.filter(
                (w) => w.doctorId === selectedDoctorId && w.date === selectedDate && w.slot === slot,
              ).length;
              const isConflict =
                s.appointments.filter(
                  (a) =>
                    a.doctorId === selectedDoctorId &&
                    a.date === selectedDate &&
                    a.slot === slot &&
                    a.status === 'Booked',
                ).length > 1;

              return (
                <button
                  key={slot}
                  onClick={() => handleOpenBooking(slot)}
                  className={`group relative flex flex-col justify-between rounded-xl border p-3 text-left transition-all duration-150 active:scale-95 ${
                    isConflict
                      ? 'border-rose-400 bg-rose-50 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/50'
                      : appt
                      ? 'border-sky-200 bg-sky-50/70 hover:border-sky-300 hover:bg-sky-100/70 dark:border-sky-900/50 dark:bg-sky-950/30'
                      : 'border-emerald-200 bg-emerald-50/60 hover:border-emerald-300 hover:bg-emerald-100/70 dark:border-emerald-900/50 dark:bg-emerald-950/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100">
                      {slot}
                    </span>
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isConflict ? 'bg-rose-500 animate-ping' : appt ? 'bg-sky-500' : 'bg-emerald-500'
                      }`}
                    />
                  </div>

                  <div className="my-1.5 min-w-0">
                    {appt ? (
                      <div>
                        <p className="truncate text-xs font-semibold text-sky-900 dark:text-sky-200">
                          {patientName(s, appt.patientId)}
                        </p>
                        <p className="truncate text-[10px] text-sky-700/80 dark:text-sky-300/70">
                          {appt.type}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                        Available
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{appt ? 'Occupied' : 'Click to book'}</span>
                    {waitCount > 0 && (
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        {waitCount} waiting
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Waitlist Panel */}
        <Card
          title={`Contention Waitlist (${s.waitlist.length})`}
          subtitle="FIFO promotion queue when booked slots are cancelled"
          icon={<Clock size={18} className="text-amber-600" />}
        >
          {s.waitlist.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <Clock size={28} className="mx-auto mb-2 opacity-40" />
              <p>Waitlist is empty.</p>
              <p className="mt-1 text-[11px] text-slate-500">
                Patients who attempt to book an already occupied slot will automatically be queued here.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {s.waitlist.map((w, idx) => (
                <div
                  key={w.id}
                  className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3 text-xs dark:border-amber-900/40 dark:bg-amber-950/30"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 font-mono text-[10px] font-bold text-white">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {patientName(s, w.patientId)}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {doctorName(s, w.doctorId)} on {w.date} @ <span className="font-mono">{w.slot}</span>
                      </p>
                    </div>
                    <button
                      className="rounded-lg p-1 text-slate-400 hover:bg-amber-100 hover:text-slate-700 dark:hover:bg-amber-900"
                      title="Remove from waitlist"
                      onClick={() => {
                        removeWait(w.id);
                        showToast(`Removed patient from waitlist queue.`);
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {w.notes && <p className="mt-1.5 text-[11px] italic text-slate-600 dark:text-slate-400">"{w.notes}"</p>}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Appointments Management Table */}
      <Card
        title="Comprehensive Appointments Registry"
        subtitle="Manage visit statuses, cancellations, and clinical transitions"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <select
              className={`${select} !w-auto !py-1.5 text-xs`}
              value={tableDateFilter}
              onChange={(e) => setTableDateFilter(e.target.value as any)}
            >
              <option value="Today">Today ({today})</option>
              <option value="All">All Dates</option>
            </select>
            <select
              className={`${select} !w-auto !py-1.5 text-xs`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="All">All Statuses</option>
              <option value="Booked">Booked Only</option>
              <option value="Completed">Completed Only</option>
              <option value="Cancelled">Cancelled Only</option>
            </select>
          </div>
        }
      >
        <Table
          head={['ID', 'Patient Name', 'Doctor', 'Date & Slot', 'Visit Type', 'Status', 'Actions']}
          empty="No appointments match the selected filters."
        >
          {filteredAppts.map((a) => (
            <tr key={a.id} className="transition duration-100 hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
              <td className={`${td} font-mono text-xs text-slate-400`}>#{a.id}</td>
              <td className={td}>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{patientName(s, a.patientId)}</span>
                <span className="block text-[11px] text-slate-400">{a.patientId}</span>
              </td>
              <td className={td}>
                <span className="text-slate-700 dark:text-slate-300">{doctorName(s, a.doctorId)}</span>
              </td>
              <td className={td}>
                <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">{a.date}</div>
                <div className="font-mono text-cyan-600 dark:text-cyan-400">{a.slot}</div>
              </td>
              <td className={td}>
                <span className="text-xs text-slate-600 dark:text-slate-400">{a.type}</span>
              </td>
              <td className={td}>
                <Badge tone={statusTone[a.status]}>{a.status}</Badge>
              </td>
              <td className={td}>
                <div className="flex items-center gap-1.5">
                  {a.status === 'Booked' && (
                    <>
                      <button
                        className={btn.ghost}
                        title="Mark Visit Completed"
                        onClick={() => {
                          completeAppointment(a.id);
                          showToast(`Visit completed for ${patientName(s, a.patientId)}`, 'success');
                        }}
                      >
                        <Check size={14} className="text-emerald-600" /> Complete
                      </button>
                      <button
                        className={btn.ghost}
                        title="Reschedule to another slot"
                        onClick={() => {
                          setRescheduleTarget(a);
                          setRescheduleDate(a.date);
                          setRescheduleSlot(a.slot);
                        }}
                      >
                        Reschedule
                      </button>
                      <button
                        className={btn.danger}
                        title="Cancel Booking (Will promote waitlisted patient)"
                        onClick={() => {
                          if (confirm(`Cancel appointment #${a.id}? If someone is waitlisted, they will be auto-promoted.`)) {
                            cancelAppointment(a.id);
                            showToast(`Appointment #${a.id} cancelled. Check waitlist for promotions.`, 'info');
                          }
                        }}
                      >
                        <X size={14} /> Cancel
                      </button>
                    </>
                  )}
                  {a.status === 'Completed' && (
                    <>
                      {onAddRecord && (
                        <button
                          className={btn.ghost}
                          title="Generate Prescription / Record"
                          onClick={() => onAddRecord(a.patientId)}
                        >
                          <FilePlus2 size={14} /> Rx
                        </button>
                      )}
                      {onGenerateBill && (
                        <button
                          className={btn.ghost}
                          title="Generate Invoice"
                          onClick={() => onGenerateBill(a.patientId)}
                        >
                          <Receipt size={14} /> Bill
                        </button>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      {/* MODAL 1: Book Slot / Join Waitlist */}
      <Modal
        open={bookModalOpen}
        onClose={() => setBookModalOpen(false)}
        title={`Book Appointment Slot: ${activeSlot} (${selectedDate})`}
        icon={<CalendarPlus size={20} />}
      >
        <form onSubmit={handleBook} className="space-y-4">
          <div className="rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60">
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Attending Doctor:</span>
              <span className="font-semibold">{currentDoc.name} ({currentDoc.specialization})</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Consultation Fee:</span>
              <span className="font-mono font-bold text-emerald-600">{money(currentDoc.consultationFee)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Room Location:</span>
              <span>{currentDoc.room}</span>
            </div>
          </div>

          <Field label="Select Patient" required>
            <select
              className={select}
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            >
              {s.patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id}) · {p.bloodGroup} · {p.phone}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Visit Type" required>
            <select
              className={select}
              value={visitType}
              onChange={(e) => setVisitType(e.target.value as ApptType)}
            >
              {visitTypes.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Reason for Visit / Symptoms" hint="Optional notes for physician">
            <textarea
              className={input}
              rows={2}
              placeholder="e.g. Follow-up blood pressure test, seasonal allergic rash, headache"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>

          <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-3 text-xs text-cyan-900 dark:border-cyan-900/40 dark:bg-cyan-950/30 dark:text-cyan-200">
            <strong>Concurrency Note:</strong> If another concurrent user claims this slot milliseconds earlier, the system
            will safely place your patient at the top of the FIFO waitlist.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className={btn.ghost}
              onClick={() => setBookModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className={btn.primary} disabled={isSubmitting}>
              {isSubmitting ? 'Processing Mutex...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Reschedule Appointment */}
      {rescheduleTarget && (
        <Modal
          open={!!rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          title={`Reschedule Visit: ${patientName(s, rescheduleTarget.patientId)}`}
          icon={<RotateCcw size={20} />}
        >
          <form onSubmit={handleReschedule} className="space-y-4">
            <p className="text-xs text-slate-500">
              Moving appointment from{' '}
              <strong className="text-slate-800 dark:text-slate-100">
                {rescheduleTarget.date} @ {rescheduleTarget.slot}
              </strong>{' '}
              with {doctorName(s, rescheduleTarget.doctorId)}.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Field label="New Date" required>
                <input
                  type="date"
                  className={input}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                />
              </Field>
              <Field label="New Time Slot" required>
                <select
                  className={select}
                  value={rescheduleSlot}
                  onChange={(e) => setRescheduleSlot(e.target.value)}
                >
                  {SLOTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className={btn.ghost} onClick={() => setRescheduleTarget(null)}>
                Cancel
              </button>
              <button type="submit" className={btn.primary}>
                Confirm Reschedule
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
