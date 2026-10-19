import {
  Check,
  CheckCircle2,
  Copy,
  Database,
  Download,
  GitBranch,
  Layers,
  Lock,
  Network,
  Server,
  ShieldAlert,
  ShieldCheck,
  Table as TableIcon,
  Unlock,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { Badge, btn, Card, PageHeader, useToast } from '../components/ui';
import { download, exportSql, useStore } from '../lib/store';

export default function SystemDesign() {
  const s = useStore();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'hld' | 'concurrency' | 'erd' | 'strategies' | 'sql'>('hld');

  const copySql = () => {
    navigator.clipboard.writeText(exportSql(s));
    setCopied(true);
    showToast('SQL schema & transaction queries copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <PageHeader
        title="System Design & Architecture"
        sub="Enterprise-grade architecture: concurrency guarantees, database schema, and high-availability patterns"
        action={
          <div className="flex gap-2">
            <button className={btn.ghost} onClick={copySql}>
              {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy SQL Schema'}
            </button>
            <button
              className={btn.primary}
              onClick={() => download('medisync-schema.sql', exportSql(s), 'application/sql')}
            >
              <Download size={16} /> Download SQL
            </button>
          </div>
        }
      />

      {/* Nav Tabs */}
      <div className="mb-6 flex overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/80 p-1.5 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        {[
          { id: 'hld', label: 'High-Level Architecture (HLD)', icon: Network },
          { id: 'concurrency', label: 'Concurrency State Machine', icon: Zap },
          { id: 'erd', label: 'Relational ERD & Tables', icon: TableIcon },
          { id: 'strategies', label: 'Locking Strategy Matrix', icon: GitBranch },
          { id: 'sql', label: 'ACID Stored Procedures', icon: Database },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-sm shadow-cyan-600/20'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: High Level Architecture */}
      {activeTab === 'hld' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card
              title="Presentation Tier (Client)"
              subtitle="React 19 + Tailwind CSS 4"
              icon={<Layers size={18} className="text-cyan-600" />}
            >
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                  <strong>Optimistic UI:</strong> Instant state updates with transactional rollbacks on failure.
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                  <strong>External Store Pub/Sub:</strong> Micro-subscriptions prevent re-rendering unaffected views.
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                  <strong>Multi-Tab Sync:</strong> Native <code className="font-mono">StorageEvent</code> listener coordinates browser windows.
                </li>
              </ul>
            </Card>

            <Card
              title="Concurrency & Logic Tier"
              subtitle="Promise-Chain Mutex + FIFO Queue"
              icon={<Zap size={18} className="text-amber-600" />}
            >
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <strong>Critical Section:</strong> Prevents Time-of-Check to Time-of-Use (TOCTOU) race condition.
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <strong>Linearized Execution:</strong> Thread tail queue promises execute strictly sequentially.
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <strong>Waitlist Promotion:</strong> Slot cancellation immediately yields slot to #1 waitlisted patient.
                </li>
              </ul>
            </Card>

            <Card
              title="Persistence & Data Tier"
              subtitle="Dual Storage: Memory & MySQL 8.0"
              icon={<Server size={18} className="text-emerald-600" />}
            >
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <strong>Relational Integrity:</strong> Strict Foreign Key Cascades prevent orphaned bills/records.
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <strong>InnoDB Row Locks:</strong> <code className="font-mono">SELECT ... FOR UPDATE</code> mimics DB-level mutex.
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <strong>Zero-Data Loss:</strong> Instant SQL dump format matches enterprise MySQL specifications.
                </li>
              </ul>
            </Card>
          </div>

          <Card title="End-to-End Request Life Cycle Diagram">
            <div className="overflow-x-auto rounded-xl bg-slate-950 p-6 font-mono text-xs text-slate-300">
              <pre>{`[User Click "Book Slot"]
       │
       ▼
[Validate Patient & Doctor Selection]
       │
       ▼
[Enter bookingLock.run() Mutex Queue] ────► [Wait for active lock release if queued]
       │
       ▼ (Lock Acquired)
[CRITICAL SECTION EXECUTION]
   ├── 1. Read Snapshot State (Doctor, Date, Slot)
   ├── 2. Simulate I/O Latency window (35ms - 55ms)
   ├── 3. If Slot ALREADY Booked?
   │        ├── YES ──► Enqueue into FIFO Waitlist Table ──► Return "WAITLISTED"
   │        └── NO  ──► Insert into Appointments Table  ──► Return "CONFIRMED"
       │
       ▼
[Release Mutex Lock Tail]
       │
       ▼
[Notify Next Waiting Thread in Queue]
       │
       ▼
[Write to LocalStorage & Dispatch Storage Event to Other Tabs]`}</pre>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: Concurrency State Machine */}
      {activeTab === 'concurrency' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card
              title="Vulnerable Mode (Mutex OFF: Race Condition)"
              icon={<ShieldAlert size={18} className="text-rose-600" />}
            >
              <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 dark:border-rose-900/60 dark:bg-rose-950/40">
                  <span className="font-bold text-rose-800 dark:text-rose-200">The Double-Booking Flaw:</span>
                  <p className="mt-1 text-rose-700 dark:text-rose-300">
                    Without mutual exclusion, multiple requests overlap during the simulated I/O latency window. Both
                    threads read the slot as "Free", both write to the table, and two patients end up with the same appointment.
                  </p>
                </div>
                <div className="rounded-xl bg-slate-900 p-4 font-mono text-slate-300">
                  <p className="text-rose-400">// Thread 1: Checks slot (10:00) - FREE</p>
                  <p className="text-amber-400">// Thread 2: Checks slot (10:00) - FREE (Overlap!)</p>
                  <p className="text-emerald-400">// Thread 1: Writes booking to DB</p>
                  <p className="text-rose-500 font-bold">// Thread 2: Writes booking to DB (CONFLICT!)</p>
                </div>
              </div>
            </Card>

            <Card
              title="Protected Mode (Mutex ON: Serialized Locking)"
              icon={<ShieldCheck size={18} className="text-emerald-600" />}
            >
              <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 dark:border-emerald-900/60 dark:bg-emerald-950/40">
                  <span className="font-bold text-emerald-800 dark:text-emerald-200">ACID Consistency Guarantee:</span>
                  <p className="mt-1 text-emerald-700 dark:text-emerald-300">
                    Thread 2's promise awaits Thread 1's full completion. When Thread 2 enters the critical section,
                    it discovers the slot is already occupied, and immediately routes the patient into the FIFO waitlist.
                  </p>
                </div>
                <div className="rounded-xl bg-slate-900 p-4 font-mono text-slate-300">
                  <p className="text-cyan-400">{'// Thread 1: Acquires Mutex Lock'}</p>
                  <p className="text-slate-500">{'// Thread 2: Enqueued in Promise chain (Blocked)'}</p>
                  <p className="text-emerald-400">{'// Thread 1: Confirms booking & Releases Lock'}</p>
                  <p className="text-cyan-400">{'// Thread 2: Wakes up, evaluates slot -> TAKEN'}</p>
                  <p className="text-amber-400">{'// Thread 2: Placed into Waitlist (Safe!)'}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card title="FIFO Waitlist State Machine & Auto-Promotion Mechanism">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <Badge tone="blue">Step 1: Enqueue</Badge>
                <h4 className="mt-2 text-sm font-bold">Contention Arrival</h4>
                <p className="mt-1 text-xs text-slate-500">
                  When a doctor's slot is booked, any subsequent concurrent requests are assigned sequential IDs in the waitlist table.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <Badge tone="amber">Step 2: Trigger</Badge>
                <h4 className="mt-2 text-sm font-bold">Slot Vacancy Event</h4>
                <p className="mt-1 text-xs text-slate-500">
                  Occurs when an appointment is Cancelled or Rescheduled. The system immediately checks for any queued entries for that doctor + date + slot.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <Badge tone="green">Step 3: Auto-Promotion</Badge>
                <h4 className="mt-2 text-sm font-bold">Atomic Promotion</h4>
                <p className="mt-1 text-xs text-slate-500">
                  The earliest waitlisted patient (<code className="font-mono">MIN(id)</code>) is removed from the waitlist and booked into the slot.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: ERD & Tables */}
      {activeTab === 'erd' && (
        <div className="space-y-6">
          <Card title="Relational Database Schema (Third Normal Form - 3NF)">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  table: 'patient',
                  desc: 'Patient demographic and clinical registry',
                  cols: [
                    { name: 'id (PK)', type: 'VARCHAR(20)' },
                    { name: 'name', type: 'VARCHAR(100)' },
                    { name: 'age', type: 'INT' },
                    { name: 'gender', type: 'ENUM' },
                    { name: 'blood_group', type: 'VARCHAR(5)' },
                    { name: 'allergies', type: 'TEXT' },
                  ],
                },
                {
                  table: 'doctor',
                  desc: 'Medical specialists and clinical fees',
                  cols: [
                    { name: 'id (PK)', type: 'INT AUTO_INC' },
                    { name: 'name', type: 'VARCHAR(100)' },
                    { name: 'specialization', type: 'VARCHAR(80)' },
                    { name: 'consultation_fee', type: 'DECIMAL(10,2)' },
                    { name: 'room', type: 'VARCHAR(20)' },
                    { name: 'status', type: 'ENUM' },
                  ],
                },
                {
                  table: 'appointment',
                  desc: 'Time slot allocations with concurrency index',
                  cols: [
                    { name: 'id (PK)', type: 'INT AUTO_INC' },
                    { name: 'patient_id (FK)', type: 'VARCHAR(20)' },
                    { name: 'doctor_id (FK)', type: 'INT' },
                    { name: 'slot_date', type: 'DATE' },
                    { name: 'slot_time', type: 'VARCHAR(10)' },
                    { name: 'status', type: 'ENUM' },
                  ],
                },
                {
                  table: 'waitlist',
                  desc: 'FIFO overflow queue for contested slots',
                  cols: [
                    { name: 'id (PK)', type: 'INT AUTO_INC' },
                    { name: 'patient_id (FK)', type: 'VARCHAR(20)' },
                    { name: 'doctor_id (FK)', type: 'INT' },
                    { name: 'slot_date', type: 'DATE' },
                    { name: 'slot_time', type: 'VARCHAR(10)' },
                    { name: 'queued_at', type: 'VARCHAR(30)' },
                  ],
                },
                {
                  table: 'medical_record',
                  desc: 'Clinical encounters, vitals & diagnosis',
                  cols: [
                    { name: 'id (PK)', type: 'INT AUTO_INC' },
                    { name: 'patient_id (FK)', type: 'VARCHAR(20)' },
                    { name: 'doctor_id (FK)', type: 'INT' },
                    { name: 'diagnosis', type: 'VARCHAR(255)' },
                    { name: 'vitals (BP/HR/SpO2)', type: 'COLUMNS' },
                    { name: 'follow_up_date', type: 'DATE' },
                  ],
                },
                {
                  table: 'bill',
                  desc: 'Invoices, taxation & payment reconciliation',
                  cols: [
                    { name: 'id (PK)', type: 'INT AUTO_INC' },
                    { name: 'invoice_number (UQ)', type: 'VARCHAR(30)' },
                    { name: 'patient_id (FK)', type: 'VARCHAR(20)' },
                    { name: 'subtotal / total', type: 'DECIMAL(10,2)' },
                    { name: 'payment_method', type: 'VARCHAR(50)' },
                    { name: 'status', type: 'ENUM' },
                  ],
                },
              ].map((t) => (
                <div
                  key={t.table}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-800">
                    <span className="font-mono text-sm font-bold text-cyan-600 dark:text-cyan-400">{t.table}</span>
                    <Badge tone="cyan">Table</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{t.desc}</p>
                  <div className="mt-3 divide-y divide-slate-100 text-xs dark:divide-slate-800/80">
                    {t.cols.map((c) => (
                      <div key={c.name} className="flex justify-between py-1 font-mono">
                        <span className="text-slate-700 dark:text-slate-300">{c.name}</span>
                        <span className="text-slate-400">{c.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: Locking Strategy Matrix */}
      {activeTab === 'strategies' && (
        <Card title="Concurrency Control Strategy Evaluation Matrix">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                  <th className="p-3">Strategy</th>
                  <th className="p-3">Lock Mechanism</th>
                  <th className="p-3">Throughput</th>
                  <th className="p-3">Consistency Guarantee</th>
                  <th className="p-3">Best Use Case</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="p-3 font-bold text-cyan-600">MediSync Client Mutex</td>
                  <td className="p-3">Promise Tail Queue</td>
                  <td className="p-3"><Badge tone="green">Ultra High</Badge></td>
                  <td className="p-3">100% within active memory session</td>
                  <td className="p-3">Single-page application optimistic UI & edge workers</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-indigo-600">Pessimistic Locking</td>
                  <td className="p-3">InnoDB <code className="font-mono">SELECT FOR UPDATE</code></td>
                  <td className="p-3"><Badge tone="amber">Moderate</Badge></td>
                  <td className="p-3">100% ACID across all distributed clients</td>
                  <td className="p-3">High-contention hospital appointment databases</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-violet-600">Optimistic Locking (OCC)</td>
                  <td className="p-3">Version column check (<code className="font-mono">version = v</code>)</td>
                  <td className="p-3"><Badge tone="green">High</Badge></td>
                  <td className="p-3">Conditional write rollback on conflict</td>
                  <td className="p-3">Read-heavy clinic dashboards with low update conflict</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-rose-600">Distributed Lock (Redlock)</td>
                  <td className="p-3">Redis Key with TTL + quorum lease</td>
                  <td className="p-3"><Badge tone="blue">High</Badge></td>
                  <td className="p-3">Cross-microservice cluster synchronization</td>
                  <td className="p-3">Multi-region distributed clinic network</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 5: ACID Stored Procedures */}
      {activeTab === 'sql' && (
        <Card
          title="MySQL ACID Stored Procedure: sp_book_appointment"
          subtitle="Row-Level Pessimistic Locking Implementation in database.sql"
        >
          <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-300 overflow-x-auto">
            <pre>{`DELIMITER //

CREATE PROCEDURE sp_book_appointment(
    IN p_patient_id VARCHAR(20),
    IN p_doctor_id INT,
    IN p_slot_date DATE,
    IN p_slot_time VARCHAR(10),
    IN p_visit_type VARCHAR(50),
    IN p_notes TEXT,
    OUT p_result VARCHAR(50)
)
BEGIN
    DECLARE v_is_booked INT DEFAULT 0;

    -- 1. BEGIN ACID TRANSACTION
    START TRANSACTION;

    -- 2. ACQUIRE ROW-LEVEL PESSIMISTIC LOCK (SELECT ... FOR UPDATE)
    SELECT COUNT(*) INTO v_is_booked
    FROM appointment
    WHERE doctor_id = p_doctor_id
      AND slot_date = p_slot_date
      AND slot_time = p_slot_time
      AND status = 'Booked'
    FOR UPDATE;

    -- 3. CHECK-THEN-ACT WITHIN PROTECTED CRITICAL SECTION
    IF v_is_booked > 0 THEN
        -- Slot is already claimed: Enqueue into Waitlist
        INSERT INTO waitlist (patient_id, doctor_id, slot_date, slot_time, visit_type, queued_at, notes)
        VALUES (p_patient_id, p_doctor_id, p_slot_date, p_slot_time, p_visit_type, CURTIME(), p_notes);

        COMMIT;
        SET p_result = 'WAITLISTED';
    ELSE
        -- Slot is available: Atomically Insert Appointment
        INSERT INTO appointment (patient_id, doctor_id, slot_date, slot_time, status, visit_type, notes, booked_at)
        VALUES (p_patient_id, p_doctor_id, p_slot_date, p_slot_time, 'Booked', p_visit_type, p_notes, NOW());

        COMMIT;
        SET p_result = 'CONFIRMED';
    END IF;
END //

DELIMITER ;`}</pre>
          </div>
        </Card>
      )}
    </>
  );
}
