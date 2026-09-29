-- ==============================================================================
-- AARIZO CommunityOS - PostgreSQL Row Level Security (RLS) Policies
-- Enforces Multi-Tenant Isolation & Role-Based Permissions at Database Level
-- Mirrors the production firestore.rules security model
-- ==============================================================================

-- Helper functions to get current session tenant and role
-- Session settings can be passed in connection: 
-- SET LOCAL app.current_user_id = 'user-resident-01';
-- SET LOCAL app.current_society_id = 'soc-gvs';
-- SET LOCAL app.current_role = 'resident';

CREATE OR REPLACE FUNCTION current_app_user_id() RETURNS VARCHAR AS $$
    SELECT NULLIF(current_setting('app.current_user_id', true), '');
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION current_app_society_id() RETURNS VARCHAR AS $$
    SELECT NULLIF(current_setting('app.current_society_id', true), '');
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION current_app_role() RETURNS VARCHAR AS $$
    SELECT NULLIF(current_setting('app.current_role', true), '');
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
    SELECT current_app_role() = 'admin';
$$ LANGUAGE sql STABLE;

-- 1. Enable RLS on all tenant tables
ALTER TABLE societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE towers ENABLE ROW LEVEL SECURITY;
ALTER TABLE flats ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE domestic_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_safety ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenity_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE housekeeping_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE move_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE renovations ENABLE ROW LEVEL SECURITY;
ALTER TABLE amc_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. TENANT ISOLATION POLICIES (society_id scoping)
-- ==============================================================================

-- Societies
CREATE POLICY societies_isolation ON societies
    FOR ALL
    USING (is_admin() OR id = current_app_society_id());

-- Towers
CREATE POLICY towers_isolation ON towers
    FOR ALL
    USING (is_admin() OR society_id = current_app_society_id());

-- Flats
CREATE POLICY flats_isolation ON flats
    FOR ALL
    USING (is_admin() OR society_id = current_app_society_id());

-- Users
CREATE POLICY users_isolation ON users
    FOR ALL
    USING (
        is_admin() 
        OR id = current_app_user_id() 
        OR (society_id = current_app_society_id() AND current_app_role() IN ('secretary', 'facility_manager', 'guard'))
    );

-- Residents
CREATE POLICY residents_isolation ON residents
    FOR ALL
    USING (is_admin() OR society_id = current_app_society_id());

-- Visitor Passes
CREATE POLICY visitor_passes_isolation ON visitor_passes
    FOR ALL
    USING (
        is_admin() 
        OR (
            society_id = current_app_society_id() 
            AND (
                current_app_role() IN ('secretary', 'guard', 'facility_manager')
                OR resident_id IN (SELECT id FROM residents WHERE user_id = current_app_user_id())
            )
        )
    );

-- Billing Invoices
CREATE POLICY billing_invoices_isolation ON billing_invoices
    FOR ALL
    USING (
        is_admin() 
        OR (
            society_id = current_app_society_id() 
            AND (
                current_app_role() IN ('secretary', 'committee', 'facility_manager')
                OR resident_id IN (SELECT id FROM residents WHERE user_id = current_app_user_id())
            )
        )
    );

-- Maintenance Tickets
CREATE POLICY maintenance_tickets_isolation ON maintenance_tickets
    FOR ALL
    USING (
        is_admin() 
        OR (
            society_id = current_app_society_id() 
            AND (
                current_app_role() IN ('secretary', 'facility_manager', 'vendor')
                OR resident_id IN (SELECT id FROM residents WHERE user_id = current_app_user_id())
            )
        )
    );

-- Parcels
CREATE POLICY parcels_isolation ON parcels
    FOR ALL
    USING (
        is_admin() 
        OR (
            society_id = current_app_society_id() 
            AND (
                current_app_role() IN ('secretary', 'guard', 'facility_manager')
                OR resident_id IN (SELECT id FROM residents WHERE user_id = current_app_user_id())
            )
        )
    );

-- Notifications
CREATE POLICY notifications_isolation ON notifications
    FOR ALL
    USING (
        is_admin() 
        OR recipient_id = current_app_user_id()
        OR (society_id = current_app_society_id() AND current_app_role() = 'secretary')
    );

-- Audit Logs (Append-only insert, read for admin/secretary/committee)
CREATE POLICY audit_logs_read ON audit_logs
    FOR SELECT
    USING (is_admin() OR (society_id = current_app_society_id() AND current_app_role() IN ('secretary', 'committee')));

CREATE POLICY audit_logs_insert ON audit_logs
    FOR INSERT
    WITH CHECK (is_admin() OR society_id = current_app_society_id());
