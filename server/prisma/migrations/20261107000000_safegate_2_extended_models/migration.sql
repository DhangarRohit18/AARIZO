-- ==========================================
-- SAFEGATE 2.0 EXTENDED DOMAIN TABLES MIGRATION
-- ==========================================

-- CreateTable
CREATE TABLE IF NOT EXISTS "society_memberships" (
    "id" TEXT NOT NULL,
    "society_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'resident',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "society_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "visitor_logs" (
    "id" TEXT NOT NULL,
    "society_id" TEXT NOT NULL,
    "pass_id" TEXT,
    "visitor_name" TEXT NOT NULL,
    "visitor_phone" TEXT,
    "flat_number" TEXT NOT NULL,
    "vehicle_number" TEXT,
    "category" TEXT NOT NULL DEFAULT 'GUEST',
    "entry_gate" TEXT NOT NULL DEFAULT 'MAIN_GATE',
    "exit_gate" TEXT,
    "guard_id" TEXT,
    "check_in" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "check_out" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'INSIDE',
    "qr_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitor_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "work_orders" (
    "id" TEXT NOT NULL,
    "society_id" TEXT NOT NULL,
    "ticket_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'PLUMBING',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "facility_manager_id" TEXT,
    "assigned_staff_id" TEXT,
    "vendor_id" TEXT,
    "sla_deadline" TIMESTAMP(3),
    "estimated_cost" DECIMAL(10,2) DEFAULT 0.00,
    "actual_cost" DECIMAL(10,2) DEFAULT 0.00,
    "completion_notes" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "attendances" (
    "id" TEXT NOT NULL,
    "society_id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "staff_name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'SECURITY_GUARD',
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "check_in" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "check_out" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PRESENT',
    "gate_id" TEXT DEFAULT 'MAIN_GATE',
    "verified_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "shifts" (
    "id" TEXT NOT NULL,
    "society_id" TEXT NOT NULL,
    "shift_name" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "days_of_week" TEXT NOT NULL DEFAULT 'MON,TUE,WED,THU,FRI,SAT,SUN',
    "staff_count" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "amenity_bookings" (
    "id" TEXT NOT NULL,
    "society_id" TEXT NOT NULL,
    "amenity_id" TEXT NOT NULL,
    "resident_id" TEXT NOT NULL,
    "resident_name" TEXT NOT NULL,
    "flat_number" TEXT NOT NULL,
    "slot_date" DATE NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "guest_count" INTEGER NOT NULL DEFAULT 1,
    "total_charge" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "payment_id" TEXT,
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "amenity_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "refunds" (
    "id" TEXT NOT NULL,
    "society_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "invoice_id" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reason" TEXT NOT NULL,
    "razorpay_refund_id" TEXT,
    "initiated_by" TEXT,
    "settled_at" TIMESTAMP(3),
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "compliance_documents" (
    "id" TEXT NOT NULL,
    "society_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'FIRE_SAFETY',
    "doc_number" TEXT,
    "file_url" TEXT NOT NULL,
    "expiry_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'VALID',
    "verified_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "amc_contracts" (
    "id" TEXT NOT NULL,
    "society_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "vendor_name" TEXT NOT NULL,
    "service_category" TEXT NOT NULL,
    "contract_value" DECIMAL(10,2) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "sla_details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "renewal_alert_sent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "amc_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "move_requests" (
    "id" TEXT NOT NULL,
    "society_id" TEXT NOT NULL,
    "resident_id" TEXT NOT NULL,
    "flat_number" TEXT NOT NULL,
    "move_type" TEXT NOT NULL DEFAULT 'MOVE_IN',
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "vehicle_type" TEXT DEFAULT 'TRUCK',
    "security_deposit" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approved_by" TEXT,
    "checklist" JSONB DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "move_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "renovation_requests" (
    "id" TEXT NOT NULL,
    "society_id" TEXT NOT NULL,
    "resident_id" TEXT NOT NULL,
    "flat_number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "contractor_name" TEXT,
    "worker_count" INTEGER NOT NULL DEFAULT 2,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "renovation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "approvals" (
    "id" TEXT NOT NULL,
    "society_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "approver_id" TEXT NOT NULL,
    "approver_role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "comments" TEXT,
    "decided_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "trust_scores" (
    "id" TEXT NOT NULL,
    "society_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 85,
    "payment_score" INTEGER NOT NULL DEFAULT 90,
    "sla_score" INTEGER NOT NULL DEFAULT 80,
    "security_score" INTEGER NOT NULL DEFAULT 85,
    "community_rating" DECIMAL(3,2) NOT NULL DEFAULT 4.5,
    "factors" JSONB DEFAULT '[]',
    "last_calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trust_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "wallet_transactions" (
    "id" TEXT NOT NULL,
    "society_id" TEXT NOT NULL,
    "resident_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'AMENITY_FEE',
    "amount" DECIMAL(10,2) NOT NULL,
    "balance_after" DECIMAL(10,2) NOT NULL,
    "reference_id" TEXT,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "outbox_events" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "society_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "actor_id" TEXT,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "society_memberships_society_id_user_id_key" ON "society_memberships"("society_id", "user_id");
CREATE INDEX IF NOT EXISTS "society_memberships_user_id_idx" ON "society_memberships"("user_id");
CREATE INDEX IF NOT EXISTS "society_memberships_society_id_idx" ON "society_memberships"("society_id");

CREATE INDEX IF NOT EXISTS "visitor_logs_society_id_status_idx" ON "visitor_logs"("society_id", "status");
CREATE INDEX IF NOT EXISTS "visitor_logs_pass_id_idx" ON "visitor_logs"("pass_id");

CREATE INDEX IF NOT EXISTS "work_orders_society_id_status_idx" ON "work_orders"("society_id", "status");
CREATE INDEX IF NOT EXISTS "work_orders_assigned_staff_id_idx" ON "work_orders"("assigned_staff_id");

CREATE INDEX IF NOT EXISTS "attendances_society_id_date_idx" ON "attendances"("society_id", "date");
CREATE INDEX IF NOT EXISTS "attendances_staff_id_idx" ON "attendances"("staff_id");

CREATE INDEX IF NOT EXISTS "shifts_society_id_idx" ON "shifts"("society_id");

CREATE INDEX IF NOT EXISTS "amenity_bookings_society_id_amenity_id_slot_date_idx" ON "amenity_bookings"("society_id", "amenity_id", "slot_date");
CREATE INDEX IF NOT EXISTS "amenity_bookings_resident_id_idx" ON "amenity_bookings"("resident_id");

CREATE UNIQUE INDEX IF NOT EXISTS "refunds_razorpay_refund_id_key" ON "refunds"("razorpay_refund_id");
CREATE INDEX IF NOT EXISTS "refunds_society_id_idx" ON "refunds"("society_id");
CREATE INDEX IF NOT EXISTS "refunds_payment_id_idx" ON "refunds"("payment_id");

CREATE INDEX IF NOT EXISTS "compliance_documents_society_id_status_idx" ON "compliance_documents"("society_id", "status");

CREATE INDEX IF NOT EXISTS "amc_contracts_society_id_status_idx" ON "amc_contracts"("society_id", "status");

CREATE INDEX IF NOT EXISTS "move_requests_society_id_status_idx" ON "move_requests"("society_id", "status");

CREATE INDEX IF NOT EXISTS "renovation_requests_society_id_status_idx" ON "renovation_requests"("society_id", "status");

CREATE INDEX IF NOT EXISTS "approvals_society_id_entity_type_entity_id_idx" ON "approvals"("society_id", "entity_type", "entity_id");

CREATE UNIQUE INDEX IF NOT EXISTS "trust_scores_society_id_entity_type_entity_id_key" ON "trust_scores"("society_id", "entity_type", "entity_id");
CREATE INDEX IF NOT EXISTS "trust_scores_society_id_score_idx" ON "trust_scores"("society_id", "score");

CREATE INDEX IF NOT EXISTS "wallet_transactions_society_id_resident_id_idx" ON "wallet_transactions"("society_id", "resident_id");

CREATE UNIQUE INDEX IF NOT EXISTS "outbox_events_event_id_key" ON "outbox_events"("event_id");
CREATE INDEX IF NOT EXISTS "outbox_events_status_created_at_idx" ON "outbox_events"("status", "created_at");
CREATE INDEX IF NOT EXISTS "outbox_events_society_id_event_type_idx" ON "outbox_events"("society_id", "event_type");
