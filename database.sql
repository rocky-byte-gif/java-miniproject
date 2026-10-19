-- ============================================================================
-- MediSync Enterprise - Clinic Management System Relational Database Architecture
-- Production MySQL 8.0+ / MariaDB 10.5+ Relational Schema
-- Features: 3NF Normalization, Foreign Key Cascades, Concurrency Locks,
-- Stored Procedures for ACID-safe booking, and FIFO Waitlist triggers.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS medisync
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE medisync;

-- Disable FK checks during schema setup
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS bill_item;
DROP TABLE IF EXISTS bill;
DROP TABLE IF EXISTS prescription;
DROP TABLE IF EXISTS medical_record;
DROP TABLE IF EXISTS waitlist;
DROP TABLE IF EXISTS appointment;
DROP TABLE IF EXISTS doctor;
DROP TABLE IF EXISTS patient;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. Patient Entity
-- ============================================================================
CREATE TABLE patient (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL CHECK (age >= 0 AND age <= 125),
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    blood_group VARCHAR(5) NOT NULL,
    allergies TEXT,
    address TEXT,
    emergency_contact VARCHAR(100),
    registered_at DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================================
-- 2. Doctor Entity
-- ============================================================================
CREATE TABLE doctor (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(80) NOT NULL,
    qualification VARCHAR(80) NOT NULL,
    experience_years INT NOT NULL DEFAULT 0,
    consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 500.00,
    room VARCHAR(20) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status ENUM('Available', 'In Consultation', 'On Leave') DEFAULT 'Available'
) ENGINE=InnoDB;

-- ============================================================================
-- 3. Appointment Entity (With High-Concurrency Indexing)
-- ============================================================================
CREATE TABLE appointment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id VARCHAR(20) NOT NULL,
    doctor_id INT NOT NULL,
    slot_date DATE NOT NULL,
    slot_time VARCHAR(10) NOT NULL,
    status ENUM('Booked', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Booked',
    visit_type VARCHAR(50) DEFAULT 'General Consultation',
    notes TEXT,
    booked_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE,
    CONSTRAINT fk_appt_doctor FOREIGN KEY (doctor_id) REFERENCES doctor(id) ON DELETE CASCADE,
    INDEX idx_doctor_slot (doctor_id, slot_date, slot_time),
    INDEX idx_patient_schedule (patient_id, slot_date)
) ENGINE=InnoDB;

-- ============================================================================
-- 4. FIFO Waitlist Entity
-- ============================================================================
CREATE TABLE waitlist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id VARCHAR(20) NOT NULL,
    doctor_id INT NOT NULL,
    slot_date DATE NOT NULL,
    slot_time VARCHAR(10) NOT NULL,
    visit_type VARCHAR(50) DEFAULT 'General Consultation',
    queued_at VARCHAR(30) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wait_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE,
    CONSTRAINT fk_wait_doctor FOREIGN KEY (doctor_id) REFERENCES doctor(id) ON DELETE CASCADE,
    INDEX idx_wait_doctor_slot (doctor_id, slot_date, slot_time)
) ENGINE=InnoDB;

-- ============================================================================
-- 5. Medical Record Entity & Prescriptions
-- ============================================================================
CREATE TABLE medical_record (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id VARCHAR(20) NOT NULL,
    doctor_id INT NOT NULL,
    doctor_name VARCHAR(100) NOT NULL,
    record_date DATE NOT NULL,
    diagnosis VARCHAR(255) NOT NULL,
    symptoms TEXT,
    bp_systolic INT,
    bp_diastolic INT,
    heart_rate INT,
    temperature DECIMAL(4,1),
    spo2 INT,
    weight_kg DECIMAL(5,1),
    clinical_notes TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_record_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE,
    CONSTRAINT fk_record_doctor FOREIGN KEY (doctor_id) REFERENCES doctor(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE prescription (
    id INT PRIMARY KEY AUTO_INCREMENT,
    record_id INT NOT NULL,
    medicine VARCHAR(100) NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    instructions TEXT,
    CONSTRAINT fk_presc_record FOREIGN KEY (record_id) REFERENCES medical_record(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 6. Billing Ledger & Itemized Invoice
-- ============================================================================
CREATE TABLE bill (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(30) UNIQUE NOT NULL,
    patient_id VARCHAR(20) NOT NULL,
    invoice_date DATE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0.00,
    tax_percent DECIMAL(5,2) DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('Pending', 'Paid') NOT NULL DEFAULT 'Pending',
    payment_method VARCHAR(50),
    paid_at VARCHAR(40),
    transaction_ref VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bill_patient FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE bill_item (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bill_id INT NOT NULL,
    description VARCHAR(150) NOT NULL,
    category ENUM('Consultation', 'Pharmacy', 'Lab Test', 'Procedure', 'Other') NOT NULL,
    qty INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_item_bill FOREIGN KEY (bill_id) REFERENCES bill(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================================
-- 7. Seed Sample Data
-- ============================================================================
INSERT INTO doctor (id, name, specialization, qualification, experience_years, consultation_fee, room, phone, status) VALUES
(1, 'Dr. Rajesh Mehta', 'General Medicine', 'MBBS, MD (Medicine)', 18, 500.00, 'Cabin 101', '9822001122', 'Available'),
(2, 'Dr. Aditi Rao', 'Cardiology', 'MBBS, MD, DM (Cardiology)', 14, 800.00, 'Cabin 102', '9822003344', 'Available'),
(3, 'Dr. Farhan Khan', 'Pediatrics', 'MBBS, MD (Pediatrics), DCH', 11, 600.00, 'Cabin 103', '9822005566', 'Available'),
(4, 'Dr. Priya Nair', 'Dermatology', 'MBBS, MD (DVL)', 9, 700.00, 'Cabin 104', '9822007788', 'In Consultation');

INSERT INTO patient (id, name, age, gender, phone, email, blood_group, allergies, address, emergency_contact, registered_at) VALUES
('MS-2026-0001', 'Aarav Sharma', 32, 'Male', '9876543210', 'aarav.sharma@example.com', 'B+', 'None', 'Flat 402, Green Acres, Pune', '9876543219 (Spouse)', '2026-01-10'),
('MS-2026-0002', 'Sunita Deshmukh', 45, 'Female', '9822334455', 'sunita.d@example.com', 'O+', 'Penicillin, NSAIDs', 'B-12, Sunshine Colony, Pune', '9822334499 (Brother)', '2026-02-14'),
('MS-2026-0003', 'Vikram Joshi', 28, 'Male', '9123456789', 'vikram.j@example.com', 'A+', 'Dust, Pollen', 'Rowhouse 4, Model Colony, Pune', '9123456780 (Father)', '2026-03-01'),
('MS-2026-0004', 'Neha Kulkarni', 36, 'Female', '9988776655', 'neha.k@example.com', 'AB+', 'None', '15 Shivaji Nagar, Pune', '9988776600 (Husband)', '2026-03-12'),
('MS-2026-0005', 'Rahul Patil', 52, 'Male', '9765432109', 'rahul.patil@example.com', 'O-', 'Sulfa drugs', 'Plot 88, Kothrud, Pune', '9765432100 (Son)', '2026-03-20'),
('MS-2026-0006', 'Ananya Iyer', 8, 'Female', '9812345670', 'parent.iyer@example.com', 'B-', 'Peanuts', 'Flat 101, Aundh, Pune', '9812345671 (Mother)', '2026-04-02');

INSERT INTO appointment (id, patient_id, doctor_id, slot_date, slot_time, status, visit_type, notes, booked_at) VALUES
(1, 'MS-2026-0001', 1, CURDATE(), '09:00', 'Completed', 'Routine Checkup', 'Seasonal cough and mild fatigue', NOW()),
(2, 'MS-2026-0002', 2, CURDATE(), '10:00', 'Booked', 'Follow-up', 'Hypertension evaluation and ECG review', NOW()),
(3, 'MS-2026-0004', 1, CURDATE(), '11:00', 'Booked', 'General Consultation', 'Persistent headaches for 3 days', NOW());

INSERT INTO waitlist (id, patient_id, doctor_id, slot_date, slot_time, visit_type, queued_at, notes) VALUES
(1, 'MS-2026-0003', 2, CURDATE(), '10:00', 'Follow-up', '09:20:14', 'Priority waitlist for Dr. Rao cardiology slot');

INSERT INTO medical_record (id, patient_id, doctor_id, doctor_name, record_date, diagnosis, symptoms, bp_systolic, bp_diastolic, heart_rate, temperature, spo2, weight_kg, clinical_notes, follow_up_date) VALUES
(1, 'MS-2026-0002', 2, 'Dr. Aditi Rao', CURDATE(), 'Essential Hypertension (Stage 1)', 'Mild dizziness in mornings, occasional palpitations', 142, 88, 78, 98.4, 99, 64.5, 'Low sodium DASH diet advised. Repeat serum electrolytes in 4 weeks.', DATE_ADD(CURDATE(), INTERVAL 30 DAY));

INSERT INTO prescription (record_id, medicine, dosage, frequency, duration, instructions) VALUES
(1, 'Tab. Amlodipine', '5 mg', '1-0-0 (Morning)', '30 days', 'Take after breakfast with water'),
(1, 'Tab. Telmisartan', '40 mg', '0-0-1 (Night)', '30 days', 'Take at bedtime');

INSERT INTO bill (id, invoice_number, patient_id, invoice_date, subtotal, discount_percent, tax_percent, total, status, payment_method, paid_at, transaction_ref, notes) VALUES
(1, 'INV-2026-0001', 'MS-2026-0002', CURDATE(), 1450.00, 0.00, 0.00, 1450.00, 'Pending', NULL, NULL, NULL, 'Payment expected at reception'),
(2, 'INV-2026-0002', 'MS-2026-0001', CURDATE(), 680.00, 0.00, 0.00, 680.00, 'Paid', 'UPI / QR', '2026-10-19 09:40:12', 'UPI-982348210984', 'Paid via GPay');

-- ============================================================================
-- 8. Stored Procedure: ACID Thread-Safe Booking with Row-Level Locking
-- Demonstrating the Backend Equivalent of the UI Mutex
-- ============================================================================
DELIMITER //

DROP PROCEDURE IF EXISTS sp_book_appointment //
CREATE PROCEDURE sp_book_appointment(
    IN p_patient_id VARCHAR(20),
    IN p_doctor_id INT,
    IN p_slot_date DATE,
    IN p_slot_time VARCHAR(10),
    IN p_visit_type VARCHAR(50),
    IN p_notes TEXT,
    OUT p_result VARCHAR(50),
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_is_booked INT DEFAULT 0;

    -- Start Transaction
    START TRANSACTION;

    -- Pessimistic Lock on the specific Doctor + Date + Slot
    SELECT COUNT(*) INTO v_is_booked
    FROM appointment
    WHERE doctor_id = p_doctor_id
      AND slot_date = p_slot_date
      AND slot_time = p_slot_time
      AND status = 'Booked'
    FOR UPDATE;

    IF v_is_booked > 0 THEN
        -- Slot is taken: Add patient to FIFO waitlist queue
        INSERT INTO waitlist (patient_id, doctor_id, slot_date, slot_time, visit_type, queued_at, notes)
        VALUES (p_patient_id, p_doctor_id, p_slot_date, p_slot_time, p_visit_type, CURTIME(), p_notes);

        COMMIT;
        SET p_result = 'WAITLISTED';
        SET p_message = 'Slot already booked; patient placed into waitlist';
    ELSE
        -- Slot is free: Atomically insert appointment
        INSERT INTO appointment (patient_id, doctor_id, slot_date, slot_time, status, visit_type, notes, booked_at)
        VALUES (p_patient_id, p_doctor_id, p_slot_date, p_slot_time, 'Booked', p_visit_type, p_notes, NOW());

        COMMIT;
        SET p_result = 'CONFIRMED';
        SET p_message = 'Appointment successfully confirmed';
    END IF;
END //

-- ============================================================================
-- 9. Stored Procedure: Cancel Appointment with Automatic Waitlist Promotion
-- ============================================================================
DROP PROCEDURE IF EXISTS sp_cancel_appointment //
CREATE PROCEDURE sp_cancel_appointment(
    IN p_appointment_id INT,
    OUT p_promoted_patient_id VARCHAR(20)
)
BEGIN
    DECLARE v_doctor_id INT;
    DECLARE v_slot_date DATE;
    DECLARE v_slot_time VARCHAR(10);
    DECLARE v_next_wait_id INT DEFAULT NULL;
    DECLARE v_next_patient_id VARCHAR(20) DEFAULT NULL;
    DECLARE v_next_type VARCHAR(50) DEFAULT NULL;

    START TRANSACTION;

    -- Mark appointment cancelled
    UPDATE appointment
    SET status = 'Cancelled'
    WHERE id = p_appointment_id AND status = 'Booked';

    -- Retrieve slot details
    SELECT doctor_id, slot_date, slot_time
    INTO v_doctor_id, v_slot_date, v_slot_time
    FROM appointment
    WHERE id = p_appointment_id;

    -- Find earliest waitlisted patient (FIFO)
    SELECT id, patient_id, visit_type
    INTO v_next_wait_id, v_next_patient_id, v_next_type
    FROM waitlist
    WHERE doctor_id = v_doctor_id AND slot_date = v_slot_date AND slot_time = v_slot_time
    ORDER BY id ASC
    LIMIT 1
    FOR UPDATE;

    IF v_next_wait_id IS NOT NULL THEN
        -- Remove from waitlist
        DELETE FROM waitlist WHERE id = v_next_wait_id;

        -- Promote to booked appointment
        INSERT INTO appointment (patient_id, doctor_id, slot_date, slot_time, status, visit_type, notes, booked_at)
        VALUES (v_next_patient_id, v_doctor_id, v_slot_date, v_slot_time, 'Booked', v_next_type, 'Promoted from Waitlist', NOW());

        SET p_promoted_patient_id = v_next_patient_id;
    ELSE
        SET p_promoted_patient_id = NULL;
    END IF;

    COMMIT;
END //

DELIMITER ;
