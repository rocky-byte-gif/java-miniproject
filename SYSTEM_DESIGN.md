# MediSync Enterprise — System Design & Architecture Specification

## 1. Executive Summary & Problem Statement

**MediSync Enterprise** is a high-reliability Clinic Management & Scheduling System engineered to solve the classic **"Double-Booking Race Condition"** in healthcare slot allocation, while providing a clinical workflow spanning Patient Dossiers, Doctor Rostering, Medical Records (EHR with Vitals and Rx), and Itemized Invoicing.

In high-demand medical facilities, when two or more patients concurrently attempt to book the exact same doctor slot (e.g. at 10:00 AM), traditional naive web applications experience a **Check-Then-Act (TOCTOU: Time-of-Check to Time-of-Use)** race window:
1. Thread A checks if Slot (Dr. Rao, 10:00 AM) is taken -> **False**
2. Thread B checks if Slot (Dr. Rao, 10:00 AM) is taken -> **False**
3. Thread A writes `appointment` record -> **Slot taken**
4. Thread B writes `appointment` record -> **DOUBLE-BOOKING DISASTER**

MediSync Enterprise implements a multi-tiered concurrency defense:
- **Client/Service Layer:** Promise-chain serialized Mutex critical section.
- **Queue Layer:** Automated FIFO Waitlist promotion queue with instantaneous failover.
- **Relational DB Layer:** Composite unique indexation, Row-Level Pessimistic Locking (`SELECT ... FOR UPDATE`), and ACID transactions.

---

## 2. High-Level Architecture (HLD)

```
+-------------------------------------------------------------------------------+
|                             CLIENT TIER (React 19)                            |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  |           UI Presentation Layer (Tailwind CSS 4, Lucide Icons)          |  |
|  |  [Dashboard]  [Patients]  [Appointments]  [Records]  [Billing]  [Lab]  |  |
|  +-------------------------------------------------------------------------+  |
|                                     |                                         |
|  +-------------------------------------------------------------------------+  |
|  |          State & Reactivity Layer (useSyncExternalStore)                |  |
|  |  * Snapshot Isolation   * Cross-Tab Sync via Storage Events             |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
|                    CONCURRENCY CONTROL & BUSINESS LOGIC TIER                  |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  |                Promise-Chained Mutual Exclusion (Mutex)                 |  |
|  |                                                                         |  |
|  |   Incoming Threads --> [ Queue ] --> [ Critical Section ] --> Result    |  |
|  |                                            |                            |  |
|  |                              Safe Mode: Strict Serialization            |  |
|  |                              Lab Mode: Expose Race Window               |  |
|  +-------------------------------------------------------------------------+  |
|                                     |                                         |
|  +-------------------------------------------------------------------------+  |
|  |                   FIFO Waitlist Auto-Promotion Engine                   |  |
|  |   On slot cancellation -> Peek FIFO queue -> Atomically promote next    |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
|                            PERSISTENCE & DATA TIER                            |
|                                                                               |
|  +-------------------------------------+  +--------------------------------+  |
|  |       In-Memory & LocalStorage      |  |     Relational MySQL Engine    |  |
|  |    * Structured Clone Snapshots     |  |    * InnoDB Engine             |  |
|  |    * Reactive Subscription Pub/Sub  |  |    * Foreign Key Cascades      |  |
|  |    * Fast Client-Side Mutation      |  |    * SELECT ... FOR UPDATE     |  |
|  +-------------------------------------+  +--------------------------------+  |
+-------------------------------------------------------------------------------+
```

---

## 3. Concurrency Strategies & Deep Dive Comparison

| Strategy | Mechanism | Pros | Cons | MediSync Implementation |
|---|---|---|---|---|
| **Client/Service Mutex** | Promise-chain queue serialization | Zero DB round-trips for conflict detection; instantaneous UI response | Scoped to active runtime / memory space | Implemented in `store.ts` via `bookingLock.run()` |
| **Pessimistic Locking (`SELECT FOR UPDATE`)** | InnoDB row locks held until transaction `COMMIT` | Guaranteed 100% ACID consistency across distributed API servers | High lock contention under extreme spikes | Implemented in `database.sql` stored procedure `sp_book_appointment` |
| **Optimistic Concurrency (OCC)** | Record version number checking (`WHERE version = :expected`) | Lock-free, non-blocking reads; optimal for read-heavy workloads | High retry rate under heavy write contention | Demonstrated in Concurrency Lab analytics |
| **Distributed Lock (e.g. Redis Redlock)** | TTL-based distributed lease with consensus algorithm | Cross-datacenter, cross-microservice synchronization | Network partition fragility, clock drift subtleties | Architecture blueprint documented in System Design tab |

---

## 4. Low-Level Design (LLD) & Domain Data Models

### 4.1 Entity Relationship Diagram (ERD)

```
 +--------------------+              +------------------------+
 |      patient       | 1          * |      appointment       |
 +--------------------+<-------------+------------------------+
 | PK id              |              | PK id                  |
 |    name            |              | FK patient_id          |
 |    age             |              | FK doctor_id           |
 |    gender          |              |    slot_date           |
 |    phone           |              |    slot_time           |
 |    blood_group     |              |    status              |
 |    allergies       |              +------------------------+
 +---------+----------+                           |
           | 1                                    | 1
           |                                      |
           | *                                    | *
 +---------v----------+              +------------v-----------+
 |   medical_record   |              |        waitlist        |
 +--------------------+              +------------------------+
 | PK id              |              | PK id                  |
 | FK patient_id      |              | FK patient_id          |
 | FK doctor_id       |              | FK doctor_id           |
 |    diagnosis       |              |    slot_date           |
 |    symptoms        |              |    slot_time           |
 |    vitals JSON/cols|              |    queued_at           |
 +---------+----------+              +------------------------+
           | 1
           |
           | *
 +---------v----------+              +------------------------+
 |    prescription    |              |         doctor         |
 +--------------------+              +------------------------+
 | PK id              |              | PK id                  |
 | FK record_id       |              |    name                |
 |    medicine        |              |    specialization      |
 |    dosage          |              |    consultation_fee    |
 |    frequency       |              |    room                |
 +--------------------+              +------------------------+
           ^                                      ^
           |                                      |
 +---------+----------+                           |
 |        bill        | 1                       * |
 +--------------------+---------------------------+
 | PK id              |
 | FK patient_id      |
 |    invoice_number  |
 |    subtotal        |
 |    total           |
 |    status          |
 +--------------------+
```

---

## 5. Non-Functional Requirements & Design Principles

1. **High Availability & Fault Tolerance:** Graceful degradation when network disconnects; localStorage persistence with automatic JSON/SQL data recovery.
2. **Data Integrity & Relational Cascades:** Strict `ON DELETE CASCADE` ensures deleting a patient purges dangling appointments, unpaid invoices, and prescriptions to prevent orphaned records.
3. **Auditability & Observability:** Every state mutation emits a categorized, timestamped event log (`Appointment`, `Billing`, `Patient`, `Concurrency`, `System`).
4. **Accessible & Responsive UX:** Zero-latency UI updates, WCAG contrast compliance, keyboard accessibility, mobile-ready layout, and Dark/Light modes.
