# MediSync Enterprise — Smart Clinic Management & Concurrency System

MediSync Enterprise is a professional, full-featured Clinic Management & Electronic Health Record (EHR) web application engineered with strict ACID concurrency guarantees, thread-safe appointment booking, automated FIFO waitlist promotion, digital prescription slips, itemized invoicing, and an interactive System Design & Architecture visualization suite.

---

## 🚀 Key Highlights & Enterprise Features

### 1. 🏥 Patient Management & Medical Dossiers
- **Complete Patient Registry:** Register, search, filter (by blood group, allergies, contact), edit, and manage patient profiles.
- **Interactive Medical Dossiers:** Click on any patient to view their comprehensive clinical dossier including vital signs history, allergy alert banners, past appointment records, and billing statements.
- **Relational Cascading Deletion:** Clean removal of all associated appointments, waitlists, prescriptions, and invoices upon patient deletion.

### 2. 📅 Thread-Safe Appointment Booking & Queue Scheduling
- **Visual Time-Slot Grid:** Interactive daily slot scheduler with attending specialist filtering, consultation fees, and real-time occupancy status.
- **Promise-Chain Mutex Lock:** Protects against Check-Then-Act (TOCTOU) race conditions to guarantee zero double-booking.
- **Automated FIFO Waitlist Promotion:** When a booked appointment is cancelled or rescheduled, the earliest waitlisted patient is automatically promoted to the slot.
- **Rescheduling Engine:** Seamlessly move visits to new dates/slots while preserving queue fairness.
- **Conflict Auto-Repair:** One-click detector and resolution tool for reconciling overlapping bookings generated during unsafe stress tests.

### 3. 🩺 Electronic Health Records (EHR) & Digital Prescriptions
- **Clinical Encounter Documentation:** Chief complaints, clinical findings, symptoms, and diagnosis.
- **Patient Vitals Monitoring:** Real-time tracking of Blood Pressure (Systolic/Diastolic), Heart Rate (BPM), Body Temperature (°F), Oxygen Saturation (SpO2 %), and Weight (kg).
- **Dynamic Prescription Builder:** Prescribe multiple medicines with dosage, frequency (e.g. 1-0-1), duration, and administration instructions.
- **Printable Official Prescription Slips (Rx):** Professional digital prescription slips formatted with clinic headers, doctor credentials, vitals summary, and 1-click print support (`window.print()`).

### 4. 💳 Itemized Billing & Tax Invoices
- **Financial Ledger & KPIs:** Track total billed revenue, revenue collected (paid), outstanding receivables (pending), and collection efficiency.
- **Itemized Invoice Builder:** Add consultation fees, pharmacy items, laboratory tests, and clinical procedures with dynamic discounts (%) and GST/Tax (%).
- **Multi-Channel Payment Settlement:** Collect payments via UPI/QR, Cash, Credit/Debit Card, or Medical Insurance with transaction reference logging.
- **Printable Official Tax Invoices:** Hospital-grade tax invoices with itemized tables, clinic GSTIN, payment confirmation watermarks, and 1-click print capability.

### 5. ⚡ Concurrency & Distributed Lock Lab
- **Interactive Multi-Threaded Simulator:** Fire 2 to 10 simultaneous booking requests at a single slot.
- **Mutex ON vs Mutex OFF:** Compare linearized mutual exclusion against vulnerable asynchronous race conditions.
- **Artificial Latency Slider:** Simulate database disk I/O latency (10ms–100ms) to inspect the widening of the vulnerability window.
- **Visual Thread Waterfall:** Real-time execution waterfall showing thread latency, lock acquisition order, and outcomes.

### 6. 🏗️ Dedicated System Design & Architecture Suite
- **Interactive High-Level Design (HLD):** Visual diagrams of Presentation Tier, Concurrency Control Tier, and Persistence Tier.
- **Concurrency State Machine:** Step-by-step state transition breakdown (Idle ➔ Locked ➔ Contention ➔ Waitlist Enqueue ➔ FIFO Promotion).
- **Relational ERD & Tables:** Full 3NF schema explorer for `patient`, `doctor`, `appointment`, `waitlist`, `medical_record`, `prescription`, `bill`, and `bill_item`.
- **Concurrency Strategies Matrix:** Comparative analysis of Client Mutex vs Pessimistic Locking (`SELECT FOR UPDATE`) vs Optimistic Concurrency Control (OCC) vs Redis Distributed Locks (Redlock).
- **Production MySQL Stored Procedures:** ACID transaction procedures with row-level locks included in `database.sql`.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript
- **Styling:** Tailwind CSS 4, Custom Modern Glassmorphic Theme (Dark & Light modes)
- **Icons:** Lucide React
- **Build Tool:** Vite 8.3
- **State & Concurrency:** `useSyncExternalStore`, Promise-Chain Mutex, Cross-Tab Storage Event Bus
- **Database Engine:** MySQL 8.0+ / MariaDB 10.5+ compatible schema (`database.sql`) with 3NF normalization, foreign key cascades, and ACID stored procedures.

---

## 🏃 Running the Project

### Prerequisites
Node.js 20.19+ or Node.js 22.12+

### Installation & Development
```bash
# Navigate to the project directory
cd medisync-lite

# Install dependencies
npm install

# Start development server
npm run dev
```
Open **http://localhost:3000** in your browser.

### Production Build & Type Checking
```bash
# Type check TypeScript files
npm run lint

# Build production bundle
npm run build
```

---

## 💾 Data Persistence & Backup

- **In-Browser Persistence:** All records and mutation logs are stored in browser `localStorage`.
- **Cross-Tab Synchronization:** Multiple open tabs automatically sync in real-time via `window.addEventListener('storage', ...)`.
- **Export Relational SQL:** Download a production-ready MySQL dump (`.sql`) matching `database.sql` anytime from Dashboard or System Design.
- **Export & Import JSON Backup:** Export complete application state or restore from a previous JSON backup with 1-click.
