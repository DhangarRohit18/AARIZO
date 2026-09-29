-- ==============================================================================
-- AARIZO CommunityOS - Complete PostgreSQL Schema & DDL
-- Multi-Tenant Gated Community & Society Management Architecture
-- Supports: Strict Tenant Isolation (RLS), RBAC, Real-time Triggers, JSONB Payloads
-- ==============================================================================

-- 1. EXTENSIONS & PREREQUISITES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. ENUM TYPES
-- ==============================================================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'resident',
        'guard',
        'secretary',
        'committee',
        'facility_manager',
        'vendor',
        'admin'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE entity_status AS ENUM (
        'ACTIVE',
        'INACTIVE',
        'SUSPENDED',
        'PENDING',
        'ARCHIVED'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE pass_type AS ENUM (
        'GUEST',
        'DELIVERY',
        'CAB',
        'SERVICE',
        'FREQUENT'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE pass_status AS ENUM (
        'PENDING',
        'APPROVED',
        'CHECKED_IN',
        'CHECKED_OUT',
        'EXPIRED',
        'CANCELLED',
        'REJECTED'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM (
        'PENDING',
        'PAID',
        'PARTIALLY_PAID',
        'OVERDUE',
        'CANCELLED'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE ticket_priority AS ENUM (
        'LOW',
        'MEDIUM',
        'HIGH',
        'EMERGENCY'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM (
        'OPEN',
        'IN_PROGRESS',
        'RESOLVED',
        'CLOSED',
        'REOPENED'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE incident_severity AS ENUM (
        'LOW',
        'MEDIUM',
        'HIGH',
        'CRITICAL'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ==============================================================================
-- 3. CORE TENANT & SOCIETY MANAGEMENT
-- ==============================================================================

CREATE TABLE IF NOT EXISTS societies (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(32) NOT NULL UNIQUE,
    city VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    pincode VARCHAR(20),
    total_towers INTEGER DEFAULT 0,
    total_flats INTEGER DEFAULT 0,
    established_year INTEGER,
    gate_count INTEGER DEFAULT 1,
    amenities_count INTEGER DEFAULT 0,
    status entity_status DEFAULT 'ACTIVE',
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS towers (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    block_code VARCHAR(32),
    total_floors INTEGER DEFAULT 1,
    total_units INTEGER DEFAULT 0,
    has_elevator BOOLEAN DEFAULT TRUE,
    status entity_status DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flats (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    tower_id VARCHAR(64) NOT NULL REFERENCES towers(id) ON DELETE CASCADE,
    flat_number VARCHAR(32) NOT NULL,
    floor_number INTEGER DEFAULT 0,
    intercom_extension VARCHAR(32),
    bhk_type VARCHAR(20),
    carpet_area_sqft NUMERIC(10, 2),
    occupancy_status VARCHAR(32) DEFAULT 'VACANT', -- VACANT, OWNER_OCCUPIED, TENANT_OCCUPIED
    status entity_status DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_flat_tower_number UNIQUE (tower_id, flat_number)
);

-- ==============================================================================
-- 4. USERS, IDENTITIES & RESIDENTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY, -- maps to auth provider uid (e.g. user-resident-01)
    society_id VARCHAR(64) REFERENCES societies(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(32) NOT NULL,
    role user_role NOT NULL DEFAULT 'resident',
    flat_id VARCHAR(64) REFERENCES flats(id) ON DELETE SET NULL,
    flat_number VARCHAR(64),
    flat_details TEXT,
    designation VARCHAR(150),
    avatar_url TEXT,
    fcm_token TEXT,
    status entity_status DEFAULT 'ACTIVE',
    preferences JSONB DEFAULT '{"theme": "dark", "notifications": true}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS residents (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    flat_id VARCHAR(64) NOT NULL REFERENCES flats(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(255),
    resident_type VARCHAR(32) DEFAULT 'OWNER', -- OWNER, TENANT
    move_in_date DATE,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(32),
    is_verified BOOLEAN DEFAULT FALSE,
    status entity_status DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS family_members (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    resident_id VARCHAR(64) NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone VARCHAR(32),
    age INTEGER,
    has_app_access BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    resident_id VARCHAR(64) REFERENCES residents(id) ON DELETE CASCADE,
    vehicle_number VARCHAR(32) NOT NULL,
    vehicle_type VARCHAR(32) NOT NULL, -- 2_WHEELER, 4_WHEELER, EV
    make_model VARCHAR(100),
    color VARCHAR(50),
    parking_slot_id VARCHAR(64),
    rfid_tag VARCHAR(100),
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_vehicle_society_number UNIQUE (society_id, vehicle_number)
);

-- ==============================================================================
-- 5. STAFF, DOMESTIC WORKERS & VENDORS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS staff (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    role_category VARCHAR(100) NOT NULL, -- SECURITY, HOUSEKEEPING, ELECTRICIAN, PLUMBER
    phone VARCHAR(32) NOT NULL,
    shift_timings VARCHAR(100),
    id_proof_type VARCHAR(50),
    id_proof_number VARCHAR(100),
    is_police_verified BOOLEAN DEFAULT FALSE,
    status entity_status DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS domestic_workers (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    profession VARCHAR(100) NOT NULL, -- MAID, COOK, DRIVER, NANNY
    phone VARCHAR(32) NOT NULL,
    passcode VARCHAR(32),
    rating NUMERIC(2, 1) DEFAULT 5.0,
    associated_flats TEXT[] DEFAULT '{}',
    current_status VARCHAR(32) DEFAULT 'OUTSIDE', -- INSIDE, OUTSIDE
    is_police_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendors (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    business_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(255),
    gst_number VARCHAR(50),
    rating NUMERIC(2, 1) DEFAULT 4.8,
    status entity_status DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    worker_id VARCHAR(64) NOT NULL,
    worker_type VARCHAR(50) NOT NULL, -- STAFF, DOMESTIC_WORKER
    check_in_time TIMESTAMPTZ NOT NULL,
    check_out_time TIMESTAMPTZ,
    gate_name VARCHAR(100),
    verified_by VARCHAR(64) REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 6. SECURITY, VISITOR PASSES & GATE CHECKPOINTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS visitor_passes (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    resident_id VARCHAR(64) REFERENCES residents(id) ON DELETE SET NULL,
    flat_id VARCHAR(64) REFERENCES flats(id) ON DELETE SET NULL,
    visitor_name VARCHAR(255) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    pass_type pass_type DEFAULT 'GUEST',
    vehicle_number VARCHAR(32),
    purpose VARCHAR(255),
    status pass_status DEFAULT 'PENDING',
    qr_code_hash TEXT,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_to TIMESTAMPTZ NOT NULL,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    gate_checked_by VARCHAR(64) REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parcels (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    resident_id VARCHAR(64) NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    flat_id VARCHAR(64) NOT NULL REFERENCES flats(id) ON DELETE CASCADE,
    courier_company VARCHAR(100) NOT NULL,
    delivery_partner_name VARCHAR(100),
    tracking_number VARCHAR(100),
    arrival_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    picked_up_at TIMESTAMPTZ,
    pickup_code VARCHAR(16) NOT NULL,
    status VARCHAR(32) DEFAULT 'AT_GATE', -- AT_GATE, COLLECTED, DELIVERED_TO_DOOR
    gate_officer_id VARCHAR(64) REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS child_safety (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    resident_id VARCHAR(64) NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    flat_id VARCHAR(64) NOT NULL REFERENCES flats(id) ON DELETE CASCADE,
    child_name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    photo_url TEXT,
    allowed_solo_exit BOOLEAN DEFAULT FALSE,
    guardian_contact VARCHAR(32) NOT NULL,
    exit_permission_status VARCHAR(32) DEFAULT 'DISALLOWED', -- ALLOWED, DISALLOWED, TIMED_PASS
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 7. BILLING, INVOICES & PAYMENTS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS billing_cycles (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    cycle_name VARCHAR(100) NOT NULL,
    month_year VARCHAR(20) NOT NULL, -- e.g. 'October 2026'
    billing_date DATE NOT NULL,
    due_date DATE NOT NULL,
    grace_period_days INTEGER DEFAULT 5,
    late_fee_amount NUMERIC(10, 2) DEFAULT 0.00,
    total_billed_amount NUMERIC(12, 2) DEFAULT 0.00,
    total_collected_amount NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS billing_invoices (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    cycle_id VARCHAR(64) REFERENCES billing_cycles(id) ON DELETE SET NULL,
    resident_id VARCHAR(64) NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    flat_id VARCHAR(64) NOT NULL REFERENCES flats(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    maintenance_amount NUMERIC(10, 2) NOT NULL,
    utility_amount NUMERIC(10, 2) DEFAULT 0.00,
    sinking_fund NUMERIC(10, 2) DEFAULT 0.00,
    late_fee NUMERIC(10, 2) DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL,
    paid_amount NUMERIC(10, 2) DEFAULT 0.00,
    due_date DATE NOT NULL,
    status invoice_status DEFAULT 'PENDING',
    payment_mode VARCHAR(50),
    paid_at TIMESTAMPTZ,
    breakdown JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS billing_transactions (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    invoice_id VARCHAR(64) NOT NULL REFERENCES billing_invoices(id) ON DELETE CASCADE,
    resident_id VARCHAR(64) NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    gateway VARCHAR(50) DEFAULT 'RAZORPAY',
    transaction_reference VARCHAR(150) UNIQUE,
    payment_method VARCHAR(50), -- UPI, CARD, NETBANKING
    status VARCHAR(50) DEFAULT 'SUCCESS',
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 8. AMENITIES & BOOKINGS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS amenities (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- CLUBHOUSE, SWIMMING_POOL, TENNIS_COURT, GYM
    capacity_per_slot INTEGER DEFAULT 10,
    slot_duration_minutes INTEGER DEFAULT 60,
    hourly_charge NUMERIC(10, 2) DEFAULT 0.00,
    opening_time TIME DEFAULT '06:00:00',
    closing_time TIME DEFAULT '22:00:00',
    requires_approval BOOLEAN DEFAULT FALSE,
    status entity_status DEFAULT 'ACTIVE',
    rules_text TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS amenity_bookings (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    amenity_id VARCHAR(64) NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    resident_id VARCHAR(64) NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    flat_id VARCHAR(64) NOT NULL REFERENCES flats(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    attendees_count INTEGER DEFAULT 1,
    charge_amount NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(32) DEFAULT 'CONFIRMED', -- CONFIRMED, PENDING_APPROVAL, CANCELLED
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 9. MAINTENANCE, COMPLAINTS & HOUSEKEEPING
-- ==============================================================================

CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    resident_id VARCHAR(64) REFERENCES residents(id) ON DELETE SET NULL,
    flat_id VARCHAR(64) REFERENCES flats(id) ON DELETE SET NULL,
    category VARCHAR(100) NOT NULL, -- PLUMBING, ELECTRICAL, CARPENTRY, ELEVATOR
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority ticket_priority DEFAULT 'MEDIUM',
    status ticket_status DEFAULT 'OPEN',
    assigned_to VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    assigned_staff_name VARCHAR(150),
    preferred_slot VARCHAR(100),
    feedback_notes TEXT,
    rating INTEGER,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaints (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    resident_id VARCHAR(64) REFERENCES residents(id) ON DELETE SET NULL,
    flat_id VARCHAR(64) REFERENCES flats(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- NOISE, PARKING, COMMON_AREA, PETS
    description TEXT NOT NULL,
    priority ticket_priority DEFAULT 'MEDIUM',
    status ticket_status DEFAULT 'OPEN',
    is_anonymous BOOLEAN DEFAULT FALSE,
    assigned_to VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS housekeeping_tasks (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    area_name VARCHAR(150) NOT NULL,
    task_type VARCHAR(100) NOT NULL, -- SWEEPING, MOPPING, SANITIZATION, GARBAGE_COLLECTION
    assigned_to VARCHAR(64) REFERENCES staff(id) ON DELETE SET NULL,
    scheduled_time TIMESTAMPTZ NOT NULL,
    completed_time TIMESTAMPTZ,
    status VARCHAR(32) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, MISSED
    supervisor_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 10. PARKING, GUEST STAY & COMMUNITY
-- ==============================================================================

CREATE TABLE IF NOT EXISTS parking_slots (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    slot_number VARCHAR(32) NOT NULL,
    tower_block VARCHAR(32),
    slot_type VARCHAR(32) DEFAULT 'RESIDENT', -- RESIDENT, VISITOR, EV_CHARGING
    allocated_flat_id VARCHAR(64) REFERENCES flats(id) ON DELETE SET NULL,
    is_occupied BOOLEAN DEFAULT FALSE,
    status entity_status DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_slot_society_number UNIQUE (society_id, slot_number)
);

CREATE TABLE IF NOT EXISTS parking_requests (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    resident_id VARCHAR(64) NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    vehicle_number VARCHAR(32) NOT NULL,
    vehicle_type VARCHAR(32) NOT NULL,
    request_type VARCHAR(32) DEFAULT 'EXTRA_SLOT', -- EXTRA_SLOT, VISITOR_RESERVATION
    from_date DATE,
    to_date DATE,
    status VARCHAR(32) DEFAULT 'PENDING',
    assigned_slot_id VARCHAR(64) REFERENCES parking_slots(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS guest_rooms (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    room_number VARCHAR(32) NOT NULL,
    block_name VARCHAR(50),
    capacity INTEGER DEFAULT 2,
    per_night_rate NUMERIC(10, 2) DEFAULT 0.00,
    status entity_status DEFAULT 'ACTIVE',
    amenities TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS guest_reservations (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    room_id VARCHAR(64) NOT NULL REFERENCES guest_rooms(id) ON DELETE CASCADE,
    resident_id VARCHAR(64) NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    guest_name VARCHAR(255) NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_nights INTEGER NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(32) DEFAULT 'CONFIRMED',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS move_requests (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    resident_id VARCHAR(64) NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    flat_id VARCHAR(64) NOT NULL REFERENCES flats(id) ON DELETE CASCADE,
    move_type VARCHAR(32) NOT NULL, -- MOVE_IN, MOVE_OUT
    scheduled_date DATE NOT NULL,
    elevator_reserved BOOLEAN DEFAULT TRUE,
    deposit_amount NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(32) DEFAULT 'PENDING_APPROVAL',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS renovations (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    resident_id VARCHAR(64) NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    flat_id VARCHAR(64) NOT NULL REFERENCES flats(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    contractor_name VARCHAR(255),
    contractor_phone VARCHAR(32),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    working_hours VARCHAR(100) DEFAULT '09:00 AM - 06:00 PM',
    status VARCHAR(32) DEFAULT 'PENDING_APPROVAL',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS amc_contracts (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    vendor_id VARCHAR(64) REFERENCES vendors(id) ON DELETE SET NULL,
    equipment_name VARCHAR(150) NOT NULL, -- ELEVATOR, DG_SET, WATER_TREATMENT, CCTV
    contract_title VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    annual_cost NUMERIC(12, 2) NOT NULL,
    service_frequency VARCHAR(50), -- MONTHLY, QUARTERLY
    next_service_date DATE,
    is_public_to_residents BOOLEAN DEFAULT TRUE,
    status entity_status DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 11. EMERGENCY, NOTIFICATIONS & AUDIT TRAIL
-- ==============================================================================

CREATE TABLE IF NOT EXISTS emergency_incidents (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    reporter_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    incident_type VARCHAR(100) NOT NULL, -- FIRE, MEDICAL, SECURITY_BREACH, LIFT_TRAP
    severity incident_severity DEFAULT 'HIGH',
    location VARCHAR(255) NOT NULL,
    description TEXT,
    dispatch_status VARCHAR(50) DEFAULT 'DISPATCHED',
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    recipient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'GENERAL', -- VISITOR, BILLING, MAINTENANCE, EMERGENCY, AMENITY
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    society_id VARCHAR(64) NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    actor_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    actor_name VARCHAR(255),
    role user_role,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 12. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_society_role ON users(society_id, role);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_residents_society_flat ON residents(society_id, flat_id);
CREATE INDEX IF NOT EXISTS idx_flats_society_tower ON flats(society_id, tower_id);
CREATE INDEX IF NOT EXISTS idx_passes_society_validity ON visitor_passes(society_id, valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_passes_phone ON visitor_passes(phone);
CREATE INDEX IF NOT EXISTS idx_parcels_society_resident ON parcels(society_id, resident_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_society_resident ON billing_invoices(society_id, resident_id, status);
CREATE INDEX IF NOT EXISTS idx_tickets_society_status ON maintenance_tickets(society_id, status, priority);
CREATE INDEX IF NOT EXISTS idx_attendance_worker_time ON attendance(worker_id, check_in_time DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_society_time ON audit_logs(society_id, timestamp DESC);

-- ==============================================================================
-- 13. AUTOMATED TIMESTAMP TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND column_name = 'updated_at'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at ON %I;', t);
        EXECUTE format('CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE PROCEDURE set_updated_at();', t);
    END LOOP;
END $$;
