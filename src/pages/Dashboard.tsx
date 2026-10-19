import {
  Activity,
  ArrowRight,
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Database,
  Download,
  FilePlus2,
  FileText,
  IndianRupee,
  Layers,
  Lock,
  Receipt,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  Upload,
  UserPlus,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import {
  Avatar,
  Badge,
  btn,
  Card,
  Modal,
  PageHeader,
  StatCard,
  useToast,
} from '../components/ui';
import {
  bookingLock,
  doctorName,
  download,
  exportSql,
  importJson,
  money,
  patientName,
  resetData,
  setDoctorStatus,
  SLOTS,
  todayDate,
  useStore,
} from '../lib/store';
import type { DoctorStatus, LogCategory, LogLevel } from '../types';

const levelTone: Record<LogLevel, 'gray' | 'green' | 'amber' | 'red'> = {
  info: 'gray',
  success: 'green',
  warn: 'amber',
  error: 'red',
};

const categoryTone: Record<LogCategory, 'cyan' | 'violet' | 'blue' | 'amber' | 'green' | 'gray'> = {
  Appointment: 'blue',
  Billing: 'violet',
  Patient: 'cyan',
  Doctor: 'amber',
  Concurrency: 'green',
  System: 'gray',
};

export default function Dashboard({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const s = useStore();
  const { showToast } = useToast();
  const today = todayDate();
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  const todayAppts = s.appointments.filter((a) => a.date === today);
  const booked = todayAppts.filter((a) => a.status === 'Booked');
  const completed = todayAppts.filter((a) => a.status === 'Completed');
  const collected = s.bills.filter((b) => b.status === 'Paid').reduce((t, b) => t + b.total, 0);
  const pending = s.bills.filter((b) => b.status === 'Pending').reduce((t, b) => t + b.total, 0);

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all clinical data back to the demo benchmark?')) {
      resetData();
      showToast('Clinical database reset to pristine demo benchmark state.', 'info');
    }
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonInput.trim()) return;
    const ok = importJson(jsonInput);
    if (ok) {
      showToast('State successfully restored from JSON backup!', 'success');
      setImportModalOpen(false);
      setJsonInput('');
    } else {
      showToast('Invalid JSON structure. Please check the backup file.', 'error');
    }
  };

  return (
    <>
      <PageHeader
        title="Clinical Operations Hub"
        sub={`Real-time overview for today (${today}) · System status: Optimal · Concurrency Lock Active`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              className={btn.ghost}
              onClick={() => {
                download(`medisync-${today}.sql`, exportSql(s), 'application/sql');
                showToast('Exported complete relational SQL schema & seed dump.');
              }}
            >
              <Download size={15} /> Export SQL
            </button>
            <button
              className={btn.ghost}
              onClick={() => {
                download(`medisync-backup-${today}.json`, JSON.stringify(s, null, 2), 'application/json');
                showToast('Exported full database JSON snapshot.');
              }}
            >
              <Download size={15} /> Export JSON
            </button>
            <button className={btn.ghost} onClick={() => setImportModalOpen(true)}>
              <Upload size={15} /> Import Backup
            </button>
            <button className={btn.danger} onClick={handleReset}>
              <RotateCcw size={15} /> Reset Data
            </button>
          </div>
        }
      />

      {/* KPI Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="REGISTERED PATIENTS"
          value={s.patients.length}
          subvalue={`${s.patients.filter((p) => p.allergies !== 'None').length} with documented allergies`}
          icon={<Users size={22} />}
          trend={{ label: '8% this month', positive: true }}
          color="cyan"
        />
        <StatCard
          title="TODAY'S APPOINTMENTS"
          value={`${booked.length} / ${todayAppts.length}`}
          subvalue={`${completed.length} completed visits today`}
          icon={<CalendarCheck size={22} />}
          trend={{ label: '100% capacity on-track', positive: true }}
          color="emerald"
        />
        <StatCard
          title="WAITLIST QUEUE"
          value={s.waitlist.length}
          subvalue="Auto-promoted upon cancellation"
          icon={<Clock size={22} />}
          trend={{ label: 'Zero double-booking', positive: true }}
          color="amber"
        />
        <StatCard
          title="REVENUE COLLECTED"
          value={money(collected)}
          subvalue={`Pending: ${money(pending)} across ${s.bills.filter((b) => b.status === 'Pending').length} bills`}
          icon={<IndianRupee size={22} />}
          trend={{ label: 'Healthy collection rate', positive: true }}
          color="violet"
        />
      </div>

      {/* Quick Launchpad Action Bar */}
      <div className="mb-6 rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-indigo-500/10 p-4 dark:border-cyan-900/40 dark:from-cyan-950/40 dark:via-teal-950/30 dark:to-indigo-950/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-600 p-2.5 text-white shadow-md shadow-cyan-600/30">
              <Activity size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Clinic Quick Actions</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Direct shortcuts to primary workflow modules</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {onNavigate && (
              <>
                <button className={btn.primary} onClick={() => onNavigate('patients')}>
                  <UserPlus size={15} /> New Patient
                </button>
                <button className={btn.ghost} onClick={() => onNavigate('appointments')}>
                  <CalendarPlus size={15} /> Book Slot
                </button>
                <button className={btn.ghost} onClick={() => onNavigate('records')}>
                  <FilePlus2 size={15} /> New Rx / Record
                </button>
                <button className={btn.ghost} onClick={() => onNavigate('billing')}>
                  <Receipt size={15} /> Generate Bill
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Doctors Roster & Today's Schedule */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* Doctor Roster & Shift Status */}
        <Card
          title="Doctor Duty Roster & Slot Load"
          subtitle="Real-time occupancy across today's consultation hours"
          icon={<Stethoscope size={18} className="text-cyan-600" />}
          action={
            <Badge tone="cyan" dot>
              {s.doctors.filter((d) => d.status === 'Available').length} Active
            </Badge>
          }
        >
          <div className="space-y-4">
            {s.doctors.map((d) => {
              const docBooked = todayAppts.filter((a) => a.doctorId === d.id && a.status === 'Booked').length;
              const docCompleted = todayAppts.filter((a) => a.doctorId === d.id && a.status === 'Completed').length;
              const loadPercent = Math.round(((docBooked + docCompleted) / SLOTS.length) * 100);

              return (
                <div
                  key={d.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition duration-150 hover:border-slate-200 dark:border-slate-800/80 dark:bg-slate-900/50"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={d.name} size="sm" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{d.name}</span>
                          <span className="text-xs text-slate-400">· {d.room}</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {d.specialization} · Fee: {money(d.consultationFee)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800"
                        value={d.status}
                        onChange={(e) => {
                          setDoctorStatus(d.id, e.target.value as DoctorStatus);
                          showToast(`Updated ${d.name} status to ${e.target.value}`);
                        }}
                      >
                        <option value="Available">Available</option>
                        <option value="In Consultation">In Consultation</option>
                        <option value="On Leave">On Leave</option>
                      </select>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>
                      Schedule Occupancy ({docBooked} booked, {docCompleted} done)
                    </span>
                    <span className="font-mono font-semibold">{loadPercent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        loadPercent > 75
                          ? 'bg-amber-500'
                          : loadPercent > 40
                          ? 'bg-cyan-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, loadPercent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Today's Appointments Schedule */}
        <Card
          title="Today's Appointments"
          subtitle="Sequential time-slot timeline for clinic floor coordination"
          icon={<CalendarCheck size={18} className="text-emerald-600" />}
          action={
            onNavigate && (
              <button
                className="text-xs font-semibold text-cyan-600 hover:underline dark:text-cyan-400"
                onClick={() => onNavigate('appointments')}
              >
                View Calendar Grid →
              </button>
            )
          }
        >
          {todayAppts.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">No appointments scheduled for today.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[...todayAppts]
                .sort((a, b) => a.slot.localeCompare(b.slot))
                .map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-cyan-50 px-2.5 py-1.5 font-mono text-xs font-bold text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
                        {a.slot}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {patientName(s, a.patientId)}
                          </span>
                          <Badge
                            tone={
                              a.status === 'Completed' ? 'green' : a.status === 'Booked' ? 'blue' : 'gray'
                            }
                          >
                            {a.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400">
                          {doctorName(s, a.doctorId)} · {a.type}
                        </p>
                      </div>
                    </div>
                    {a.notes && (
                      <span className="hidden max-w-xs truncate text-xs text-slate-500 md:block">
                        {a.notes}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>

      {/* Concurrency & System Telemetry Status */}
      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Card
          title="System Design Architecture Telemetry"
          subtitle="Live thread & lock monitoring"
          icon={<ShieldCheck size={18} className="text-cyan-600" />}
          action={
            onNavigate && (
              <button
                className="text-xs font-semibold text-cyan-600 hover:underline dark:text-cyan-400"
                onClick={() => onNavigate('system-design')}
              >
                System Docs →
              </button>
            )
          }
        >
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
              <span className="text-slate-500">Lock Engine</span>
              <span className="font-mono font-bold text-emerald-600">Promise-Chain Mutex Active</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
              <span className="text-slate-500">Mutex State</span>
              <span className="font-mono font-bold text-cyan-600">
                {bookingLock.locked ? 'LOCKED (Processing Critical Section)' : 'IDLE (Ready)'}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
              <span className="text-slate-500">Cross-Tab Sync</span>
              <span className="font-mono font-bold text-emerald-600">Active (StorageEvent Bus)</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
              <span className="text-slate-500">Database Engine</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">MySQL 8.0 / InnoDB Compliant</span>
            </div>
          </div>
        </Card>

        {/* Live Clinical Audit Stream */}
        <Card
          title="Clinical Activity & Audit Trail"
          subtitle="Timestamped mutation events"
          icon={<Activity size={18} className="text-emerald-600" />}
          className="lg:col-span-2"
        >
          <ul className="max-h-60 space-y-2 overflow-y-auto pr-1">
            {s.log.slice(0, 10).map((l) => (
              <li
                key={l.id}
                className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/40 p-2.5 text-xs dark:border-slate-800/60 dark:bg-slate-900/40"
              >
                <span className="mt-0.5 shrink-0 font-mono text-[11px] text-slate-400">{l.time}</span>
                <Badge tone={categoryTone[l.category] || 'gray'}>{l.category}</Badge>
                <Badge tone={levelTone[l.level]}>{l.level}</Badge>
                <span className="min-w-0 flex-1 break-words text-slate-700 dark:text-slate-300">{l.msg}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* JSON Import Backup Modal */}
      <Modal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Import MediSync Database Backup"
        icon={<Upload size={20} />}
      >
        <form onSubmit={handleImport} className="space-y-4">
          <p className="text-xs text-slate-500">
            Paste your JSON database snapshot below to restore patients, doctors, appointments, medical records, and billing data.
          </p>
          <textarea
            className="w-full h-44 rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs dark:border-slate-800 dark:bg-slate-950"
            placeholder='{"patients": [...], "doctors": [...], ...}'
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2">
            <button type="button" className={btn.ghost} onClick={() => setImportModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className={btn.primary}>
              Restore Database
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
