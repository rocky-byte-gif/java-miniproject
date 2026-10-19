import {
  Activity,
  AlertTriangle,
  FilePlus2,
  FileText,
  Filter,
  Heart,
  HeartPulse,
  Pill,
  Plus,
  Printer,
  Search,
  Stethoscope,
  Thermometer,
  Trash2,
  User,
  X,
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
  addRecord,
  deleteRecord,
  doctorName,
  getDoctor,
  getPatient,
  patientName,
  todayDate,
  useStore,
} from '../lib/store';
import type { MedRecord, PrescriptionItem, Vitals } from '../types';

const defaultVitals: Vitals = {
  bpSystolic: 120,
  bpDiastolic: 80,
  heartRate: 72,
  temperature: 98.6,
  spO2: 99,
  weightKg: 65,
};

const defaultRxItem: PrescriptionItem = {
  id: 'rx-new',
  medicine: '',
  dosage: '',
  frequency: '1-0-1 (Twice Daily)',
  duration: '5 days',
  instructions: 'Take after meals with water',
};

export default function Records({ initialPatientId }: { initialPatientId?: string }) {
  const s = useStore();
  const { showToast } = useToast();
  const today = todayDate();

  // Create Record Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [patientId, setPatientId] = useState(initialPatientId || s.patients[0]?.id || '');
  const [doctorId, setDoctorId] = useState(s.doctors[0]?.id || 1);
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [vitals, setVitals] = useState<Vitals>(defaultVitals);
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    { ...defaultRxItem, id: 'rx-1' },
  ]);

  // View / Print Prescription Slip Modal
  const [activeSlipRecord, setActiveSlipRecord] = useState<MedRecord | null>(null);

  // Table Filters
  const [patientFilter, setPatientFilter] = useState<string>('all');
  const [query, setQuery] = useState('');

  const currentPatient = getPatient(s, patientId);
  const currentDoctor = getDoctor(s, doctorId);

  const addPrescriptionRow = () => {
    setPrescriptions((prev) => [
      ...prev,
      {
        id: `rx-${Date.now()}`,
        medicine: '',
        dosage: '',
        frequency: '1-0-1 (Twice Daily)',
        duration: '5 days',
        instructions: 'Take after meals',
      },
    ]);
  };

  const removePrescriptionRow = (id: string) => {
    setPrescriptions((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePrescription = (id: string, field: keyof PrescriptionItem, val: string) => {
    setPrescriptions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: val } : p)),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      showToast('Select a patient first.', 'error');
      return;
    }
    if (!diagnosis.trim()) {
      showToast('Clinical diagnosis is required.', 'error');
      return;
    }

    const validRx = prescriptions.filter((p) => p.medicine.trim() !== '');

    addRecord({
      patientId,
      doctorId,
      doctorName: currentDoctor?.name || 'Attending Physician',
      diagnosis: diagnosis.trim(),
      symptoms: symptoms.trim() || undefined,
      vitals,
      prescriptions: validRx,
      clinicalNotes: clinicalNotes.trim() || undefined,
      followUpDate: followUpDate || undefined,
    });

    showToast(`Medical record & prescription created for ${patientName(s, patientId)}`, 'success');
    setDiagnosis('');
    setSymptoms('');
    setClinicalNotes('');
    setFollowUpDate('');
    setPrescriptions([{ ...defaultRxItem, id: 'rx-1' }]);
    setModalOpen(false);
  };

  const q = query.trim().toLowerCase();
  const filteredRecords = s.records.filter((r) => {
    const matchesPatient = patientFilter === 'all' || r.patientId === patientFilter;
    const matchesQuery =
      !q ||
      [r.diagnosis, r.doctorName, patientName(s, r.patientId), r.symptoms ?? ''].some((v) =>
        v.toLowerCase().includes(q),
      );
    return matchesPatient && matchesQuery;
  });

  return (
    <>
      <PageHeader
        title="Electronic Health Records (EHR)"
        sub="Clinical diagnoses, patient vitals monitoring, and digital Rx prescription generation"
        action={
          <button className={btn.primary} onClick={() => setModalOpen(true)}>
            <FilePlus2 size={16} /> New Clinical Record / Rx
          </button>
        }
      />

      <Card
        title={`Patient Medical Records (${filteredRecords.length})`}
        subtitle="Historical clinical encounters, prescriptions, and follow-ups"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className={`${input} !py-1.5 pl-9 text-xs sm:w-56`}
                placeholder="Search diagnosis, doctor, patient..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              className={`${select} !w-auto !py-1.5 text-xs`}
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
              aria-label="Filter by Patient"
            >
              <option value="all">All Patients</option>
              {s.patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        }
      >
        <Table
          head={['Date', 'Patient Name', 'Clinical Diagnosis', 'Attending Doctor', 'Vitals Summary', 'Prescribed Medicines', 'Actions']}
          empty="No clinical records found."
        >
          {filteredRecords.map((r) => {
            const pat = getPatient(s, r.patientId);
            return (
              <tr key={r.id} className="transition duration-100 hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className={`${td} font-mono text-xs text-slate-500`}>{r.date}</td>
                <td className={td}>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{patientName(s, r.patientId)}</span>
                  <span className="block text-[11px] text-slate-400">{r.patientId}</span>
                </td>
                <td className={td}>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{r.diagnosis}</div>
                  {r.symptoms && <div className="text-xs text-slate-400 truncate max-w-xs">{r.symptoms}</div>}
                </td>
                <td className={td}>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{r.doctorName}</span>
                </td>
                <td className={td}>
                  {r.vitals ? (
                    <div className="flex flex-wrap gap-1 text-[11px] font-mono">
                      {r.vitals.bpSystolic && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">
                          BP: {r.vitals.bpSystolic}/{r.vitals.bpDiastolic}
                        </span>
                      )}
                      {r.vitals.heartRate && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">
                          HR: {r.vitals.heartRate}
                        </span>
                      )}
                      {r.vitals.spO2 && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">
                          O2: {r.vitals.spO2}%
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
                <td className={td}>
                  <div className="space-y-1">
                    {r.prescriptions?.slice(0, 2).map((rx) => (
                      <div key={rx.id} className="text-xs">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{rx.medicine}</span>
                        <span className="text-slate-400"> ({rx.dosage})</span>
                      </div>
                    ))}
                    {(r.prescriptions?.length || 0) > 2 && (
                      <span className="text-[10px] text-cyan-600 font-semibold">
                        +{r.prescriptions.length - 2} more medicines
                      </span>
                    )}
                  </div>
                </td>
                <td className={td}>
                  <div className="flex items-center gap-1.5">
                    <button
                      className={btn.ghost}
                      title="View Official Prescription Slip"
                      onClick={() => setActiveSlipRecord(r)}
                    >
                      <Printer size={14} /> View Rx Slip
                    </button>
                    <button
                      className={btn.danger}
                      title="Delete Record"
                      onClick={() => {
                        if (confirm(`Delete record #${r.id} for ${patientName(s, r.patientId)}?`)) {
                          deleteRecord(r.id);
                          showToast('Medical record deleted.', 'info');
                        }
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>

      {/* MODAL 1: Create New Medical Record & Rx */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Medical Record & Prescription"
        icon={<FilePlus2 size={20} />}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Patient & Doctor Selection */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Patient" required>
              <select
                className={select}
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              >
                {s.patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id}) · {p.bloodGroup}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Attending Doctor" required>
              <select
                className={select}
                value={doctorId}
                onChange={(e) => setDoctorId(Number(e.target.value))}
              >
                {s.doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} · {d.specialization} ({d.room})
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Allergy Warning Alert if patient has allergies */}
          {currentPatient && currentPatient.allergies && currentPatient.allergies.toLowerCase() !== 'none' && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
              <AlertTriangle size={16} className="shrink-0 text-rose-600" />
              <span>
                <strong>PATIENT DRUG ALLERGY ALERT:</strong> {currentPatient.allergies}. Do not prescribe allergic compounds.
              </span>
            </div>
          )}

          {/* Vitals Input Strip */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              <Activity size={14} className="text-cyan-600" /> Patient Vitals Signs
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              <Field label="BP Systolic (mmHg)">
                <input
                  type="number"
                  className={input}
                  placeholder="120"
                  value={vitals.bpSystolic || ''}
                  onChange={(e) => setVitals({ ...vitals, bpSystolic: Number(e.target.value) })}
                />
              </Field>
              <Field label="BP Diastolic (mmHg)">
                <input
                  type="number"
                  className={input}
                  placeholder="80"
                  value={vitals.bpDiastolic || ''}
                  onChange={(e) => setVitals({ ...vitals, bpDiastolic: Number(e.target.value) })}
                />
              </Field>
              <Field label="Pulse (BPM)">
                <input
                  type="number"
                  className={input}
                  placeholder="72"
                  value={vitals.heartRate || ''}
                  onChange={(e) => setVitals({ ...vitals, heartRate: Number(e.target.value) })}
                />
              </Field>
              <Field label="Temp (°F)">
                <input
                  type="number"
                  step="0.1"
                  className={input}
                  placeholder="98.6"
                  value={vitals.temperature || ''}
                  onChange={(e) => setVitals({ ...vitals, temperature: Number(e.target.value) })}
                />
              </Field>
              <Field label="SpO2 (%)">
                <input
                  type="number"
                  className={input}
                  placeholder="99"
                  value={vitals.spO2 || ''}
                  onChange={(e) => setVitals({ ...vitals, spO2: Number(e.target.value) })}
                />
              </Field>
              <Field label="Weight (kg)">
                <input
                  type="number"
                  step="0.5"
                  className={input}
                  placeholder="65"
                  value={vitals.weightKg || ''}
                  onChange={(e) => setVitals({ ...vitals, weightKg: Number(e.target.value) })}
                />
              </Field>
            </div>
          </div>

          {/* Clinical Findings */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Clinical Diagnosis" required>
              <input
                className={input}
                placeholder="e.g. Acute Bronchitis, Essential Hypertension"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </Field>
            <Field label="Symptoms & Chief Complaints">
              <input
                className={input}
                placeholder="e.g. Dry hacking cough, low-grade fever for 3 days"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </Field>
          </div>

          {/* Dynamic Prescription Builder */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <Pill size={14} className="text-cyan-600" /> Prescribed Medications (Rx)
              </h4>
              <button
                type="button"
                className={`${btn.ghost} !py-1 text-xs`}
                onClick={addPrescriptionRow}
              >
                <Plus size={13} /> Add Medicine
              </button>
            </div>

            <div className="space-y-3">
              {prescriptions.map((rx, idx) => (
                <div
                  key={rx.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      Medicine #{idx + 1}
                    </span>
                    {prescriptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePrescriptionRow(rx.id)}
                        className="text-rose-500 hover:text-rose-700"
                        title="Remove Medicine"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                    <div className="sm:col-span-2">
                      <input
                        className={input}
                        placeholder="Medicine name (e.g. Tab. Azithromycin)"
                        value={rx.medicine}
                        onChange={(e) => updatePrescription(rx.id, 'medicine', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <input
                        className={input}
                        placeholder="Dosage (e.g. 500mg)"
                        value={rx.dosage}
                        onChange={(e) => updatePrescription(rx.id, 'dosage', e.target.value)}
                      />
                    </div>
                    <div>
                      <input
                        className={input}
                        placeholder="Frequency (e.g. 1-0-1)"
                        value={rx.frequency}
                        onChange={(e) => updatePrescription(rx.id, 'frequency', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div>
                      <input
                        className={input}
                        placeholder="Duration (e.g. 5 days, 30 days)"
                        value={rx.duration}
                        onChange={(e) => updatePrescription(rx.id, 'duration', e.target.value)}
                      />
                    </div>
                    <div>
                      <input
                        className={input}
                        placeholder="Instructions (e.g. After meals with warm water)"
                        value={rx.instructions}
                        onChange={(e) => updatePrescription(rx.id, 'instructions', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Advice & Follow-up */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Clinical Advice / Lifestyle Notes">
              <input
                className={input}
                placeholder="e.g. Adequate hydration, low-sodium diet, avoid strenuous exertion"
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
              />
            </Field>
            <Field label="Follow-Up Consultation Date">
              <input
                type="date"
                className={input}
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={btn.ghost} onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className={btn.primary}>
              Save Clinical Record & Rx
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: View & Print Digital Rx Prescription Slip */}
      {activeSlipRecord && (
        <Modal
          open={!!activeSlipRecord}
          onClose={() => setActiveSlipRecord(null)}
          title="Digital Prescription Slip (Rx)"
          icon={<FileText size={20} />}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6 text-sm">
            {/* Printable Prescription Card Container */}
            <div
              id="prescription-print-area"
              className="rounded-2xl border-2 border-slate-200 bg-white p-6 text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-cyan-600 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-cyan-700 dark:text-cyan-400">
                    MEDISYNC HEALTH CLINIC
                  </h2>
                  <p className="text-xs text-slate-500">
                    Department of Internal Medicine & Specialist Consultations
                  </p>
                  <p className="text-xs text-slate-400">
                    104 Medical Enclave, Pune · Emergency Contact: +91 9822001122
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {activeSlipRecord.doctorName}
                  </h3>
                  <p className="text-xs text-slate-500">Reg No: MMC-2012-98421</p>
                  <p className="font-mono text-xs text-cyan-600 font-semibold">
                    Date: {activeSlipRecord.date}
                  </p>
                </div>
              </div>

              {/* Patient Demographics */}
              {(() => {
                const pat = getPatient(s, activeSlipRecord.patientId);
                return (
                  <div className="my-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60 sm:grid-cols-4">
                    <div>
                      <span className="text-slate-400">Patient Name:</span>
                      <p className="font-bold">{pat?.name || activeSlipRecord.patientId}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Age / Gender:</span>
                      <p className="font-semibold">
                        {pat ? `${pat.age} yrs / ${pat.gender}` : '—'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Blood Group:</span>
                      <p className="font-bold text-rose-600">{pat?.bloodGroup || '—'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Patient ID:</span>
                      <p className="font-mono">{activeSlipRecord.patientId}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Vitals Box */}
              {activeSlipRecord.vitals && (
                <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800 font-mono">
                  <span className="font-sans font-bold text-slate-500">Vitals:</span>
                  {activeSlipRecord.vitals.bpSystolic && (
                    <span>BP: {activeSlipRecord.vitals.bpSystolic}/{activeSlipRecord.vitals.bpDiastolic} mmHg</span>
                  )}
                  {activeSlipRecord.vitals.heartRate && (
                    <span>HR: {activeSlipRecord.vitals.heartRate} bpm</span>
                  )}
                  {activeSlipRecord.vitals.temperature && (
                    <span>Temp: {activeSlipRecord.vitals.temperature} °F</span>
                  )}
                  {activeSlipRecord.vitals.spO2 && (
                    <span>SpO2: {activeSlipRecord.vitals.spO2}%</span>
                  )}
                  {activeSlipRecord.vitals.weightKg && (
                    <span>Weight: {activeSlipRecord.vitals.weightKg} kg</span>
                  )}
                </div>
              )}

              {/* Clinical Diagnosis */}
              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Diagnosis:</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {activeSlipRecord.diagnosis}
                </p>
                {activeSlipRecord.symptoms && (
                  <p className="text-xs text-slate-500">Symptoms: {activeSlipRecord.symptoms}</p>
                )}
              </div>

              {/* Rx Symbol & Medication Table */}
              <div className="mb-5">
                <div className="mb-2 flex items-center gap-1.5 font-serif text-lg font-bold text-cyan-700 dark:text-cyan-400">
                  ℞ <span className="font-sans text-xs uppercase tracking-wider text-slate-400">Medications</span>
                </div>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 font-semibold">
                      <th className="py-2">#</th>
                      <th className="py-2">Medicine & Dosage</th>
                      <th className="py-2">Frequency</th>
                      <th className="py-2">Duration</th>
                      <th className="py-2">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {activeSlipRecord.prescriptions.map((rx, idx) => (
                      <tr key={rx.id}>
                        <td className="py-2 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2 font-bold text-slate-800 dark:text-slate-100">
                          {rx.medicine} <span className="font-normal text-slate-500">({rx.dosage})</span>
                        </td>
                        <td className="py-2 font-medium">{rx.frequency}</td>
                        <td className="py-2">{rx.duration}</td>
                        <td className="py-2 text-slate-500">{rx.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Clinical Notes & Follow-up */}
              {activeSlipRecord.clinicalNotes && (
                <div className="mb-4 text-xs">
                  <span className="font-bold text-slate-500">Doctor's Advice:</span>
                  <p className="text-slate-700 dark:text-slate-300">{activeSlipRecord.clinicalNotes}</p>
                </div>
              )}

              {activeSlipRecord.followUpDate && (
                <div className="mb-6 rounded-lg bg-cyan-50/70 p-2 text-xs font-semibold text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-200">
                  Follow-up recommended on: {activeSlipRecord.followUpDate}
                </div>
              )}

              {/* Signature Line */}
              <div className="mt-8 flex items-end justify-between border-t border-slate-200 pt-4 dark:border-slate-800 text-xs">
                <span className="text-slate-400">Generated via MediSync Enterprise EHR</span>
                <div className="text-center">
                  <div className="h-10 font-serif italic text-slate-400 flex items-center justify-center">
                    (Authorized Signatory)
                  </div>
                  <span className="font-semibold border-t border-slate-300 px-4 pt-1 block">
                    {activeSlipRecord.doctorName}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className={btn.ghost}
                onClick={() => setActiveSlipRecord(null)}
              >
                Close
              </button>
              <button
                type="button"
                className={btn.primary}
                onClick={() => {
                  window.print();
                }}
              >
                <Printer size={16} /> Print Prescription Slip
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
