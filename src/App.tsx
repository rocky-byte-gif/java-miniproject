import {
  Activity,
  CalendarClock,
  Database,
  FlaskConical,
  HeartPulse,
  LayoutDashboard,
  Moon,
  Network,
  Receipt,
  ShieldCheck,
  Stethoscope,
  Sun,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { ToastProvider } from './components/ui';
import Appointments from './pages/Appointments';
import Billing from './pages/Billing';
import Dashboard from './pages/Dashboard';
import Lab from './pages/Lab';
import Patients from './pages/Patients';
import Records from './pages/Records';
import SystemDesign from './pages/SystemDesign';

const tabs = [
  { id: 'dashboard', label: 'Operations Hub', icon: LayoutDashboard },
  { id: 'patients', label: 'Patient Registry', icon: Users },
  { id: 'appointments', label: 'Appointments', icon: CalendarClock },
  { id: 'records', label: 'EHR & Records', icon: Stethoscope },
  { id: 'billing', label: 'Invoices & Billing', icon: Receipt },
  { id: 'lab', label: 'Concurrency Lab', icon: FlaskConical },
  { id: 'system-design', label: 'System Design', icon: Network },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function App() {
  const [tab, setTab] = useState<TabId>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(undefined);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('medisync-theme', next ? 'dark' : 'light');
    } catch {
      /* ignore */
    }
  };

  const navigateTo = (targetTab: string, patientId?: string) => {
    if (patientId) setSelectedPatientId(patientId);
    setTab(targetTab as TabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 text-slate-800 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100 lg:flex">
        {/* Navigation Sidebar */}
        <aside className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800/90 dark:bg-slate-900/95 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
          {/* Logo & System Brand */}
          <div className="flex items-center justify-between px-5 py-4 lg:py-5 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-white shadow-md shadow-cyan-600/30">
                <HeartPulse size={20} />
              </div>
              <div>
                <div className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                  MediSync<span className="text-cyan-600 dark:text-cyan-400">Enterprise</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ACID Concurrency Active
                </div>
              </div>
            </div>

            {/* Mobile Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex gap-1 overflow-x-auto p-3 lg:flex-col lg:overflow-visible lg:p-3">
            {tabs.map(({ id, label, icon: Icon }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150 ${
                    active
                      ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-sm shadow-cyan-600/25'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white'
                  }`}
                >
                  <Icon size={17} className={active ? 'text-white' : 'text-slate-400 dark:text-slate-400'} />
                  {label}
                  {id === 'lab' && (
                    <span className="ml-auto hidden rounded-full bg-cyan-100/30 px-1.5 py-0.5 text-[10px] font-mono font-bold lg:inline-block">
                      Mutex
                    </span>
                  )}
                  {id === 'system-design' && (
                    <span className="ml-auto hidden rounded-full bg-indigo-100/30 px-1.5 py-0.5 text-[10px] font-mono font-bold lg:inline-block">
                      HLD/LLD
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Sidebar Footer */}
          <div className="hidden lg:absolute lg:bottom-4 lg:left-4 lg:right-4 lg:block">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/60 mb-2">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold mb-1">
                <ShieldCheck size={14} className="text-cyan-600" /> System Integrity
              </div>
              <p className="text-[11px] text-slate-400">
                In-Memory Mutex active with MySQL 8.0 schema compatibility.
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
            >
              <span className="flex items-center gap-2">
                {dark ? <Sun size={15} /> : <Moon size={15} />}
                {dark ? 'Light Theme' : 'Dark Theme'}
              </span>
              <span className="font-mono text-[10px] text-slate-400">{dark ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {tab === 'dashboard' && <Dashboard onNavigate={(t) => navigateTo(t)} />}
            {tab === 'patients' && (
              <Patients
                onBookAppointment={(pid) => navigateTo('appointments', pid)}
                onAddRecord={(pid) => navigateTo('records', pid)}
                onGenerateBill={(pid) => navigateTo('billing', pid)}
              />
            )}
            {tab === 'appointments' && (
              <Appointments
                initialPatientId={selectedPatientId}
                onAddRecord={(pid) => navigateTo('records', pid)}
                onGenerateBill={(pid) => navigateTo('billing', pid)}
              />
            )}
            {tab === 'records' && <Records initialPatientId={selectedPatientId} />}
            {tab === 'billing' && <Billing initialPatientId={selectedPatientId} />}
            {tab === 'lab' && <Lab onNavigate={(t) => navigateTo(t)} />}
            {tab === 'system-design' && <SystemDesign />}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
