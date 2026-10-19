import {
  Calendar,
  CalendarPlus,
  Edit,
  Eye,
  FilePlus2,
  FileText,
  Mail,
  MapPin,
  Phone,
  Receipt,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import {
  Avatar,
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
  addPatient,
  BLOOD_GROUPS,
  deletePatient,
  doctorName,
  money,
  updatePatient,
  useStore,
} from '../lib/store';
import type { BloodGroup, Patient } from '../types';

const defaultForm = {
  name: '',
  age: '',
  gender: 'Male' as Patient['gender'],
  phone: '',
  email: '',
  bloodGroup: 'O+' as BloodGroup,
  allergies: '',
  address: '',
  emergencyContact: '',
};

export default function Patients({
  onBookAppointment,
  onAddRecord,
  onGenerateBill,
}: {
  onBookAppointment?: (patientId: string) => void;
  onAddRecord?: (patientId: string) => void;
  onGenerateBill?: (patientId: string) => void;
}) {
  const s = useStore();
  const { showToast } = useToast();

  const [registerOpen, setRegisterOpen] = useState(false);
  const [editPatientData, setEditPatientData] = useState<Patient | null>(null);
  const [profilePatient, setProfilePatient] = useState<Patient | null>(null);

  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [query, setQuery] = useState('');
  const [bloodFilter, setBloodFilter] = useState<string>('All');

  const validate = (f: typeof form) => {
    const err: Record<string, string> = {};
    const age = Number(f.age);
    if (!f.name.trim()) err.name = 'Full name is required';
    if (!Number.isInteger(age) || age < 0 || age > 125) err.age = 'Age must be between 0 and 125';
    if (!/^\d{10}$/.test(f.phone.trim())) err.phone = 'Phone must be exactly 10 digits';
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) err.email = 'Enter a valid email address';
    return err;
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate(form);
    setErrors(err);
    if (Object.keys(err).length) return;

    const created = addPatient({
      name: form.name.trim(),
      age: Number(form.age),
      gender: form.gender,
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      bloodGroup: form.bloodGroup,
      allergies: form.allergies.trim() || 'None',
      address: form.address.trim() || undefined,
      emergencyContact: form.emergencyContact.trim() || undefined,
    });

    showToast(`Patient ${created.name} (${created.id}) registered successfully!`, 'success');
    setForm(defaultForm);
    setRegisterOpen(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPatientData) return;
    const err = validate({
      ...editPatientData,
      age: String(editPatientData.age),
    } as any);
    setErrors(err);
    if (Object.keys(err).length) return;

    updatePatient(editPatientData.id, {
      name: editPatientData.name.trim(),
      age: Number(editPatientData.age),
      gender: editPatientData.gender,
      phone: editPatientData.phone.trim(),
      email: editPatientData.email?.trim() || undefined,
      bloodGroup: editPatientData.bloodGroup,
      allergies: editPatientData.allergies.trim() || 'None',
      address: editPatientData.address?.trim() || undefined,
      emergencyContact: editPatientData.emergencyContact?.trim() || undefined,
    });

    showToast(`Profile updated for ${editPatientData.name}`, 'info');
    setEditPatientData(null);
  };

  const handleDelete = (p: Patient) => {
    if (
      confirm(
        `Are you sure you want to delete patient "${p.name}" (${p.id})?\n\nRelational database cascading will also delete their appointments, waitlist entries, prescriptions, and billing statements.`,
      )
    ) {
      deletePatient(p.id);
      showToast(`Deleted patient ${p.name} and purged cascading records.`, 'warn');
      if (profilePatient?.id === p.id) setProfilePatient(null);
    }
  };

  const q = query.trim().toLowerCase();
  const filtered = s.patients.filter((p) => {
    const matchesQuery =
      !q || [p.name, p.id, p.phone, p.allergies, p.email ?? ''].some((v) => v.toLowerCase().includes(q));
    const matchesBlood = bloodFilter === 'All' || p.bloodGroup === bloodFilter;
    return matchesQuery && matchesBlood;
  });

  return (
    <>
      <PageHeader
        title="Patient Directory & Dossiers"
        sub="Comprehensive electronic health registry, medical history dossiers, and emergency profiles"
        action={
          <button className={btn.primary} onClick={() => setRegisterOpen(true)}>
            <UserPlus size={16} /> Register New Patient
          </button>
        }
      />

      <Card
        title={`All Registered Patients (${filtered.length})`}
        subtitle="Search and view comprehensive medical dossiers"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className={`${input} !py-2 pl-9 text-xs sm:w-64`}
                placeholder="Search name, ID, phone..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              className={`${select} !w-auto !py-2 text-xs`}
              value={bloodFilter}
              onChange={(e) => setBloodFilter(e.target.value)}
              aria-label="Filter by Blood Group"
            >
              <option value="All">All Blood Groups</option>
              {BLOOD_GROUPS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        }
      >
        <Table
          head={['Patient', 'ID', 'Age / Gender', 'Contact Phone', 'Blood Group', 'Documented Allergies', 'Actions']}
          empty="No matching patient records found."
        >
          {filtered.map((p) => {
            const hasAllergies = p.allergies && p.allergies.toLowerCase() !== 'none';
            return (
              <tr key={p.id} className="transition duration-100 hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className={td}>
                  <div className="flex items-center gap-3">
                    <Avatar name={p.name} size="sm" />
                    <div>
                      <button
                        onClick={() => setProfilePatient(p)}
                        className="font-semibold text-slate-900 hover:text-cyan-600 dark:text-slate-100 dark:hover:text-cyan-400 text-left"
                      >
                        {p.name}
                      </button>
                      <div className="text-[11px] text-slate-400">{p.email || 'No email on file'}</div>
                    </div>
                  </div>
                </td>
                <td className={`${td} font-mono text-xs text-slate-500`}>{p.id}</td>
                <td className={td}>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{p.age} yrs</span>
                  <span className="text-slate-400 text-xs"> · {p.gender}</span>
                </td>
                <td className={`${td} font-mono text-xs text-slate-600 dark:text-slate-300`}>{p.phone}</td>
                <td className={td}>
                  <Badge tone={p.bloodGroup.includes('+') ? 'red' : 'violet'}>{p.bloodGroup}</Badge>
                </td>
                <td className={td}>
                  {hasAllergies ? (
                    <span className="inline-flex items-center rounded-lg bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                      ⚠ {p.allergies}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">None reported</span>
                  )}
                </td>
                <td className={td}>
                  <div className="flex items-center gap-1.5">
                    <button
                      className={btn.ghost}
                      title="View Medical Dossier"
                      onClick={() => setProfilePatient(p)}
                    >
                      <Eye size={14} /> Profile
                    </button>
                    <button
                      className={btn.ghost}
                      title="Edit Profile"
                      onClick={() => setEditPatientData(p)}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className={btn.danger}
                      title={`Delete ${p.name}`}
                      onClick={() => handleDelete(p)}
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

      {/* MODAL 1: Register New Patient */}
      <Modal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        title="Register New Patient"
        icon={<UserPlus size={20} />}
      >
        <form onSubmit={handleRegister} className="space-y-4" noValidate>
          <Field label="Full Legal Name" required error={errors.name}>
            <input
              className={input}
              placeholder="e.g. Aarav Sharma"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              maxLength={70}
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Age" required error={errors.age}>
              <input
                className={input}
                type="number"
                min={0}
                max={125}
                placeholder="e.g. 34"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
            </Field>
            <Field label="Gender" required>
              <select
                className={select}
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value as any })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </Field>
            <Field label="Blood Group" required>
              <select
                className={select}
                value={form.bloodGroup}
                onChange={(e) => setForm({ ...form, bloodGroup: e.target.value as BloodGroup })}
              >
                {BLOOD_GROUPS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Primary Phone (10 digits)" required error={errors.phone}>
              <input
                className={input}
                inputMode="numeric"
                maxLength={10}
                placeholder="9876543210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
              />
            </Field>
            <Field label="Email Address" error={errors.email}>
              <input
                className={input}
                type="email"
                placeholder="aarav@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Documented Medical Allergies" hint="Contraindications & drug alerts">
            <input
              className={input}
              placeholder="e.g. Penicillin, Sulfa drugs, Peanuts (or 'None')"
              value={form.allergies}
              onChange={(e) => setForm({ ...form, allergies: e.target.value })}
            />
          </Field>

          <Field label="Residential Address">
            <input
              className={input}
              placeholder="Street, City, Postal Code"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </Field>

          <Field label="Emergency Contact (Name & Phone)">
            <input
              className={input}
              placeholder="e.g. Priya Sharma (Spouse) - 9876543211"
              value={form.emergencyContact}
              onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={btn.ghost} onClick={() => setRegisterOpen(false)}>
              Cancel
            </button>
            <button type="submit" className={btn.primary}>
              Register Patient
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Edit Patient */}
      {editPatientData && (
        <Modal
          open={!!editPatientData}
          onClose={() => setEditPatientData(null)}
          title={`Edit Profile: ${editPatientData.name}`}
          icon={<Edit size={20} />}
        >
          <form onSubmit={handleUpdate} className="space-y-4">
            <Field label="Full Legal Name" required error={errors.name}>
              <input
                className={input}
                value={editPatientData.name}
                onChange={(e) => setEditPatientData({ ...editPatientData, name: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Age" required error={errors.age}>
                <input
                  className={input}
                  type="number"
                  value={editPatientData.age}
                  onChange={(e) => setEditPatientData({ ...editPatientData, age: Number(e.target.value) })}
                />
              </Field>
              <Field label="Gender">
                <select
                  className={select}
                  value={editPatientData.gender}
                  onChange={(e) => setEditPatientData({ ...editPatientData, gender: e.target.value as any })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </Field>
              <Field label="Blood Group">
                <select
                  className={select}
                  value={editPatientData.bloodGroup}
                  onChange={(e) => setEditPatientData({ ...editPatientData, bloodGroup: e.target.value as BloodGroup })}
                >
                  {BLOOD_GROUPS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Phone (10 digits)" required error={errors.phone}>
                <input
                  className={input}
                  maxLength={10}
                  value={editPatientData.phone}
                  onChange={(e) => setEditPatientData({ ...editPatientData, phone: e.target.value.replace(/\D/g, '') })}
                />
              </Field>
              <Field label="Email">
                <input
                  className={input}
                  value={editPatientData.email || ''}
                  onChange={(e) => setEditPatientData({ ...editPatientData, email: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Allergies">
              <input
                className={input}
                value={editPatientData.allergies}
                onChange={(e) => setEditPatientData({ ...editPatientData, allergies: e.target.value })}
              />
            </Field>
            <Field label="Address">
              <input
                className={input}
                value={editPatientData.address || ''}
                onChange={(e) => setEditPatientData({ ...editPatientData, address: e.target.value })}
              />
            </Field>
            <Field label="Emergency Contact">
              <input
                className={input}
                value={editPatientData.emergencyContact || ''}
                onChange={(e) => setEditPatientData({ ...editPatientData, emergencyContact: e.target.value })}
              />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className={btn.ghost} onClick={() => setEditPatientData(null)}>
                Cancel
              </button>
              <button type="submit" className={btn.primary}>
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: View Patient Medical Dossier */}
      {profilePatient && (
        <Modal
          open={!!profilePatient}
          onClose={() => setProfilePatient(null)}
          title={`Clinical Medical Dossier: ${profilePatient.name}`}
          icon={<FileText size={20} />}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6 text-sm">
            {/* Header Demographic Pill */}
            <div className="flex flex-col gap-4 rounded-2xl border border-cyan-100 bg-cyan-50/40 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-cyan-900/50 dark:bg-cyan-950/30">
              <div className="flex items-center gap-4">
                <Avatar name={profilePatient.name} size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{profilePatient.name}</h3>
                    <Badge tone="red">{profilePatient.bloodGroup}</Badge>
                    <span className="font-mono text-xs text-slate-500">({profilePatient.id})</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {profilePatient.age} years old · {profilePatient.gender} · Registered {profilePatient.registeredAt}
                  </p>
                </div>
              </div>

              {/* Direct Quick Actions for this Patient */}
              <div className="flex flex-wrap gap-2">
                {onBookAppointment && (
                  <button
                    className={btn.ghost}
                    onClick={() => {
                      onBookAppointment(profilePatient.id);
                      setProfilePatient(null);
                    }}
                  >
                    <CalendarPlus size={14} /> Book Slot
                  </button>
                )}
                {onAddRecord && (
                  <button
                    className={btn.ghost}
                    onClick={() => {
                      onAddRecord(profilePatient.id);
                      setProfilePatient(null);
                    }}
                  >
                    <FilePlus2 size={14} /> Write Rx
                  </button>
                )}
                {onGenerateBill && (
                  <button
                    className={btn.ghost}
                    onClick={() => {
                      onGenerateBill(profilePatient.id);
                      setProfilePatient(null);
                    }}
                  >
                    <Receipt size={14} /> Bill
                  </button>
                )}
              </div>
            </div>

            {/* Allergy Alert Banner if any */}
            {profilePatient.allergies && profilePatient.allergies.toLowerCase() !== 'none' && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
                <span className="font-bold">CRITICAL DRUG ALLERGY WARNING:</span> {profilePatient.allergies}
              </div>
            )}

            {/* Contact & Emergency Details */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                <span className="text-slate-400">Phone & Email</span>
                <p className="mt-1 font-semibold">{profilePatient.phone}</p>
                <p className="text-slate-500">{profilePatient.email || 'No email'}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                <span className="text-slate-400">Emergency Contact</span>
                <p className="mt-1 font-semibold">{profilePatient.emergencyContact || 'None listed'}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                <span className="text-slate-400">Residential Address</span>
                <p className="mt-1 font-semibold">{profilePatient.address || 'None provided'}</p>
              </div>
            </div>

            {/* Appointments History for this Patient */}
            <div>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Appointment History</h4>
              {s.appointments.filter((a) => a.patientId === profilePatient.id).length === 0 ? (
                <p className="text-xs text-slate-400">No appointments recorded.</p>
              ) : (
                <div className="space-y-2">
                  {s.appointments
                    .filter((a) => a.patientId === profilePatient.id)
                    .map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between rounded-xl border border-slate-100 p-2.5 text-xs dark:border-slate-800"
                      >
                        <div>
                          <span className="font-semibold">{a.date}</span> at <span className="font-mono">{a.slot}</span>
                          <span className="text-slate-400"> with {doctorName(s, a.doctorId)}</span>
                        </div>
                        <Badge tone={a.status === 'Completed' ? 'green' : a.status === 'Booked' ? 'blue' : 'gray'}>
                          {a.status}
                        </Badge>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Medical Records for this Patient */}
            <div>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Clinical Records & Prescriptions</h4>
              {s.records.filter((r) => r.patientId === profilePatient.id).length === 0 ? (
                <p className="text-xs text-slate-400">No medical records documented yet.</p>
              ) : (
                <div className="space-y-3">
                  {s.records
                    .filter((r) => r.patientId === profilePatient.id)
                    .map((r) => (
                      <div key={r.id} className="rounded-xl border border-slate-200/80 p-3.5 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{r.diagnosis}</span>
                          <span className="text-slate-400">{r.date} · {r.doctorName}</span>
                        </div>
                        {r.symptoms && <p className="mt-1 text-xs text-slate-500">Symptoms: {r.symptoms}</p>}
                        {r.prescriptions?.length > 0 && (
                          <div className="mt-2 divide-y divide-slate-100 rounded-lg bg-slate-50 p-2 text-[11px] dark:divide-slate-800 dark:bg-slate-900/80">
                            {r.prescriptions.map((rx) => (
                              <div key={rx.id} className="flex justify-between py-1">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                  {rx.medicine} ({rx.dosage})
                                </span>
                                <span className="text-slate-500">
                                  {rx.frequency} · {rx.duration}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Invoices for this Patient */}
            <div>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Billing & Invoices</h4>
              {s.bills.filter((b) => b.patientId === profilePatient.id).length === 0 ? (
                <p className="text-xs text-slate-400">No invoices issued for this patient.</p>
              ) : (
                <div className="space-y-2">
                  {s.bills
                    .filter((b) => b.patientId === profilePatient.id)
                    .map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between rounded-xl border border-slate-100 p-2.5 text-xs dark:border-slate-800"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold">{b.invoiceNumber}</span>
                          <span className="text-slate-400">· {b.date}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold">{money(b.total)}</span>
                          <Badge tone={b.status === 'Paid' ? 'green' : 'amber'}>{b.status}</Badge>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
