import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  FlaskConical,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import {
  Badge,
  btn,
  Card,
  Field,
  input,
  PageHeader,
  select,
  StatCard,
  useToast,
} from '../components/ui';
import {
  bookAppointment,
  cancelAppointment,
  doctorName,
  findConflicts,
  log,
  patientName,
  repairConflicts,
  SLOTS,
  todayDate,
  useStore,
} from '../lib/store';
import type { BookResult } from '../types';

export default function Lab({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const s = useStore();
  const { showToast } = useToast();
  const today = todayDate();

  const [doctorId, setDoctorId] = useState(s.doctors[0]?.id || 1);
  const [slot, setSlot] = useState('11:00');
  const [threadCount, setThreadCount] = useState(5);
  const [safe, setSafe] = useState(true);
  const [latencyMs, setLatencyMs] = useState(40);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<(BookResult & { safe: boolean; threadId: number; executionMs: number })[]>([]);

  const maxThreads = Math.max(2, s.patients.length);
  const n = Math.min(threadCount, s.patients.length);
  const currentDoc = s.doctors.find((d) => d.id === doctorId) || s.doctors[0];

  // Find if slot is currently occupied
  const existingBooking = s.appointments.find(
    (a) => a.doctorId === doctorId && a.date === today && a.slot === slot && a.status === 'Booked',
  );

  const freeSlot = () => {
    if (existingBooking) {
      cancelAppointment(existingBooking.id);
      showToast(`Slot ${slot} with ${currentDoc.name} cleared. Ready for clean test run.`, 'info');
    }
  };

  const runSimulation = async () => {
    setRunning(true);
    setResults([]);
    const testPatients = s.patients.slice(0, n);

    log(
      'info',
      'Concurrency',
      `[Benchmark Started] Dispatching ${n} simultaneous booking requests for ${currentDoc.name} @ ${slot} (${
        safe ? 'Mutex ON - Thread-Safe' : 'Mutex OFF - Race Condition Exposed'
      }, Latency: ${latencyMs}ms)`,
    );

    const promises = testPatients.map((p, idx) =>
      bookAppointment(
        p.id,
        doctorId,
        today,
        slot,
        'General Consultation',
        `Simulated Thread #${idx + 1}`,
        safe,
        idx + 1,
        latencyMs,
      ),
    );

    const outputs = await Promise.all(promises);

    setResults(
      outputs.map((r, i) => ({
        ...r,
        safe,
        threadId: r.threadId || i + 1,
        executionMs: r.executionMs || Math.round(35 + Math.random() * 20),
      })),
    );

    setRunning(false);

    const bookedCount = outputs.filter((r) => r.ok).length;
    if (bookedCount > 1) {
      showToast(`RACE CONDITION DETECTED! ${bookedCount} patients claimed the same slot!`, 'error');
    } else {
      showToast(`Execution finished consistently: 1 booked, remainder waitlisted.`, 'success');
    }
  };

  const bookedResults = results.filter((r) => r.ok);
  const waitlistedResults = results.filter((r) => r.waitlisted);
  const rejectedResults = results.filter((r) => !r.ok && !r.waitlisted);
  const hasRace = results.length > 0 && bookedResults.length > 1;

  const conflicts = findConflicts(s);

  return (
    <>
      <PageHeader
        title="Concurrency & Distributed Lock Lab"
        sub="Interactive stress-testing suite: inspect Check-Then-Act race conditions vs Mutex critical sections"
        action={
          conflicts.length > 0 && (
            <button
              className={btn.danger}
              onClick={() => {
                repairConflicts();
                showToast('Double-booked slots repaired and moved to waitlist.', 'success');
              }}
            >
              <RotateCcw size={15} /> Repair {conflicts.length} Conflict(s)
            </button>
          )
        }
      />

      {/* Lab Parameters & Controls */}
      <div className="mb-6 grid gap-6 xl:grid-cols-3">
        <Card
          title="Simulation Benchmark Parameters"
          subtitle="Configure thread contention and mutual exclusion"
          icon={<FlaskConical size={18} className="text-cyan-600" />}
        >
          <div className="space-y-4">
            <Field label="Attending Specialist">
              <select
                className={select}
                value={doctorId}
                onChange={(e) => setDoctorId(Number(e.target.value))}
              >
                {s.doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialization})
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Target Time Slot">
              <select className={select} value={slot} onChange={(e) => setSlot(e.target.value)}>
                {SLOTS.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </Field>

            {/* Slot State Indicator & Quick Clear */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-900/60">
              <div>
                <span className="text-slate-500">Current Slot Status: </span>
                <span className={`font-semibold ${existingBooking ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {existingBooking ? `Booked by ${patientName(s, existingBooking.patientId)}` : 'Available (Free)'}
                </span>
              </div>
              {existingBooking && (
                <button
                  type="button"
                  className={`${btn.ghost} !py-1 text-xs`}
                  onClick={freeSlot}
                  title="Cancel existing booking to make slot free for a clean test"
                >
                  Free Slot
                </button>
              )}
            </div>

            <Field
              label={`Simultaneous Concurrent Threads: ${n} Requests`}
              hint="Patients firing at once"
            >
              <input
                type="range"
                min={2}
                max={maxThreads}
                value={n}
                onChange={(e) => setThreadCount(Number(e.target.value))}
                className="w-full accent-cyan-600"
              />
            </Field>

            <Field
              label={`Simulated Database I/O Latency: ${latencyMs}ms`}
              hint="Window of vulnerability"
            >
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={latencyMs}
                onChange={(e) => setLatencyMs(Number(e.target.value))}
                className="w-full accent-cyan-600"
              />
            </Field>

            {/* Mutex Mode Toggle Buttons */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Locking Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSafe(true)}
                  className={`${btn.ghost} ${
                    safe
                      ? '!border-emerald-500 !bg-emerald-50 text-emerald-800 font-bold dark:!bg-emerald-950/60 dark:text-emerald-300'
                      : ''
                  }`}
                >
                  <ShieldCheck size={16} className="text-emerald-600" /> Mutex ON (Safe)
                </button>
                <button
                  type="button"
                  onClick={() => setSafe(false)}
                  className={`${btn.ghost} ${
                    !safe
                      ? '!border-rose-500 !bg-rose-50 text-rose-800 font-bold dark:!bg-rose-950/60 dark:text-rose-300'
                      : ''
                  }`}
                >
                  <ShieldOff size={16} className="text-rose-600" /> Mutex OFF (Race)
                </button>
              </div>
            </div>

            <button
              className={`${btn.primary} w-full py-3`}
              onClick={runSimulation}
              disabled={running || s.patients.length < 2}
            >
              {running ? (
                <>
                  <Cpu size={16} className="animate-spin" /> Dispatching {n} Threads...
                </>
              ) : (
                <>
                  <Play size={16} /> Run Concurrency Benchmark
                </>
              )}
            </button>
          </div>
        </Card>

        {/* Results & Visual Waterfall Panel */}
        <Card
          title="Benchmark Execution Analysis"
          subtitle="Real-time thread resolution and collision telemetry"
          icon={<Cpu size={18} className="text-emerald-600" />}
          className="xl:col-span-2"
        >
          {results.length === 0 ? (
            <div className="py-20 text-center text-sm text-slate-400">
              <FlaskConical size={36} className="mx-auto mb-3 opacity-40 text-cyan-500" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Awaiting Simulation Execution
              </p>
              <p className="mt-1 text-xs max-w-md mx-auto text-slate-400">
                Select your parameters and click "Run Concurrency Benchmark" to witness how asynchronous promise
                serialization eliminates double-booking hazards.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Verdict Banner */}
              <div
                className={`rounded-2xl border p-4 text-xs font-medium ${
                  hasRace
                    ? 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200'
                    : 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200'
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-bold">
                  {hasRace ? (
                    <>
                      <AlertTriangle size={18} className="text-rose-600" />
                      CRITICAL RACE CONDITION DETECTED!
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} className="text-emerald-600" />
                      100% LINEARIZABLE CONSISTENCY ACHIEVED
                    </>
                  )}
                </div>
                <p className="mt-1">
                  {hasRace
                    ? `Double-booking flaw triggered: ${bookedResults.length} different patients simultaneously captured the exact same doctor slot because the check-then-act critical section was left unprotected.`
                    : `Strict serial execution: Thread 1 secured the slot in ${bookedResults[0]?.executionMs}ms. All other ${waitlistedResults.length} concurrent requests were safely queued into the FIFO waitlist.`}
                </p>
              </div>

              {/* Thread Waterfall Visualizer */}
              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Thread Waterfall & Response Metrics
                </h4>
                <div className="space-y-2">
                  {results.map((r, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-500">
                            Thread #{r.threadId}
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-100">
                            {r.patientName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-[11px] text-slate-400">{r.executionMs} ms</span>
                          <Badge tone={r.ok ? (hasRace ? 'red' : 'green') : r.waitlisted ? 'amber' : 'gray'}>
                            {r.ok ? (hasRace ? 'Double-Booked' : 'Confirmed') : r.waitlisted ? 'Waitlist' : 'Rejected'}
                          </Badge>
                        </div>
                      </div>

                      {/* Visual Duration Bar */}
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            r.ok ? (hasRace ? 'bg-rose-500' : 'bg-emerald-500') : 'bg-amber-500'
                          }`}
                          style={{
                            width: `${Math.min(100, Math.max(15, (r.executionMs / (latencyMs * 2)) * 100))}%`,
                          }}
                        />
                      </div>

                      <p className="mt-1 text-[11px] text-slate-500">{r.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Technical Deep Dive: Why Check-Then-Act Fails */}
      <Card
        title="Theoretical Deep Dive: The Check-Then-Act Race Condition"
        subtitle="Mathematical and architectural analysis of asynchronous concurrency in web services"
        icon={<Zap size={18} className="text-cyan-600" />}
      >
        <div className="grid gap-4 md:grid-cols-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <h4 className="font-bold text-slate-900 dark:text-white mb-1.5">1. The TOCTOU Window</h4>
            <p>
              In traditional web architectures, querying the database to see if an appointment is free takes 10ms–50ms.
              If two HTTP requests hit the server within that window, both read "slot available = false", resulting
              in multiple INSERT statements for the same primary slot.
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <h4 className="font-bold text-slate-900 dark:text-white mb-1.5">2. Promise-Chain Mutex</h4>
            <p>
              MediSync resolves this with an internal lock:
              <code className="block mt-1 font-mono text-[11px] bg-slate-900 text-cyan-300 p-1.5 rounded">
                this.tail = this.tail.then(fn);
              </code>
              Every new booking task attaches to the promise chain tail, enforcing strict serialization without
              dropping throughput for non-competing doctors.
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <h4 className="font-bold text-slate-900 dark:text-white mb-1.5">3. Database InnoDB Row Locks</h4>
            <p>
              In production MySQL/PostgreSQL backends, this is implemented using{' '}
              <code className="font-mono text-cyan-600 dark:text-cyan-400 font-semibold">SELECT ... FOR UPDATE</code>.
              The database engine locks the row at the index level until the transaction executes <code className="font-mono">COMMIT</code>.
            </p>
          </div>
        </div>
      </Card>
    </>
  );
}
