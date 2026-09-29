-- ==============================================================================
-- AARIZO CommunityOS - Complete Initial Seed Data for PostgreSQL
-- Seeds Societies, Towers, Flats, Demo Roles, Staff, Domestic Workers,
-- Amenities, Visitor Passes, Billing, Maintenance, and Security Checkpoints
-- ==============================================================================

-- 1. Societies
INSERT INTO societies (id, name, code, city, address, total_towers, total_flats, established_year, gate_count, amenities_count, status)
VALUES
('soc-gvs', 'Green Valley Residency', 'GVS', 'Mumbai', 'Plot 42, Palm Beach Road, Sector 19, Sanpada, Navi Mumbai 400705', 3, 120, 2018, 2, 6, 'ACTIVE'),
('soc-azh', 'AARIZO Heights', 'AZH', 'Bengaluru', 'Survey 104, Outer Ring Road, Bellandur, Bengaluru 560103', 4, 160, 2021, 3, 8, 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address;

-- 2. Towers
INSERT INTO towers (id, society_id, name, block_code, total_floors, total_units, has_elevator, status)
VALUES
('tow-gvs-a', 'soc-gvs', 'Tower A (Aspen)', 'A', 14, 40, TRUE, 'ACTIVE'),
('tow-gvs-b', 'soc-gvs', 'Tower B (Birch)', 'B', 14, 40, TRUE, 'ACTIVE'),
('tow-gvs-c', 'soc-gvs', 'Tower C (Cedar)', 'C', 14, 40, TRUE, 'ACTIVE'),
('tow-azh-1', 'soc-azh', 'Tower 1 (Orchid)', 'T1', 20, 40, TRUE, 'ACTIVE'),
('tow-azh-2', 'soc-azh', 'Tower 2 (Lotus)', 'T2', 20, 40, TRUE, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 3. Flats
INSERT INTO flats (id, society_id, tower_id, flat_number, floor_number, intercom_extension, bhk_type, carpet_area_sqft, occupancy_status, status)
VALUES
('flat-gvs-a101', 'soc-gvs', 'tow-gvs-a', 'A-101', 1, '101', '3BHK', 1450.00, 'OWNER_OCCUPIED', 'ACTIVE'),
('flat-gvs-a201', 'soc-gvs', 'tow-gvs-a', 'A-201', 2, '201', '3BHK', 1450.00, 'OWNER_OCCUPIED', 'ACTIVE'),
('flat-gvs-b1204', 'soc-gvs', 'tow-gvs-b', 'B-1204', 12, '1204', '2BHK', 1150.00, 'OWNER_OCCUPIED', 'ACTIVE'),
('flat-gvs-b1205', 'soc-gvs', 'tow-gvs-b', 'B-1205', 12, '1205', '2BHK', 1150.00, 'VACANT', 'ACTIVE'),
('flat-gvs-c502', 'soc-gvs', 'tow-gvs-c', 'C-502', 5, '502', '2BHK', 1100.00, 'TENANT_OCCUPIED', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 4. Users (All 7 canonical roles)
INSERT INTO users (id, society_id, name, email, phone, role, flat_number, flat_details, designation, status)
VALUES
('user-resident-01', 'soc-gvs', 'Sarvesh Kulkarni', 'sarvesh@greenvalley.com', '+919876543210', 'resident', 'B-1204', 'Tower B · Flat 1204', 'Flat Owner & Resident', 'ACTIVE'),
('user-guard-01', 'soc-gvs', 'Officer R. Singh', 'guard1@greenvalley.com', '+919123456789', 'guard', NULL, 'Gate #1 North Terminal', 'Senior Gate Security Officer', 'ACTIVE'),
('user-secretary-01', 'soc-gvs', 'Mayuri Udar', 'secretary@greenvalley.com', '+919820012345', 'secretary', 'A-101', 'Block A · Flat 101', 'Management Committee Secretary', 'ACTIVE'),
('user-committee-01', 'soc-gvs', 'Rajesh Mehta', 'rajesh.committee@greenvalley.com', '+919900112233', 'committee', 'A-201', 'Tower A · Flat 201', 'Management Committee Member', 'ACTIVE'),
('user-fm-01', 'soc-gvs', 'Suresh Patil', 'facility@greenvalley.com', '+919811223344', 'facility_manager', NULL, 'Facility Office Block B', 'Facility & Operations Manager', 'ACTIVE'),
('user-vendor-01', 'soc-gvs', 'Priya Facility Care Ltd', 'priya.vendor@service.com', '+919844556677', 'vendor', NULL, 'Operations Desk Mumbai', 'Authorized Service Provider', 'ACTIVE'),
('user-admin-01', NULL, 'Antigravity Super Admin', 'admin@aarizo.com', '+919800000001', 'admin', NULL, 'Global Platform Ops', 'Platform Master Administrator', 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email;

-- 5. Residents
INSERT INTO residents (id, society_id, user_id, flat_id, name, phone, email, resident_type, move_in_date, is_verified, status)
VALUES
('res-sarvesh-01', 'soc-gvs', 'user-resident-01', 'flat-gvs-b1204', 'Sarvesh Kulkarni', '+919876543210', 'sarvesh@greenvalley.com', 'OWNER', '2020-03-15', TRUE, 'ACTIVE'),
('res-mayuri-01', 'soc-gvs', 'user-secretary-01', 'flat-gvs-a101', 'Mayuri Udar', '+919820012345', 'secretary@greenvalley.com', 'OWNER', '2019-06-01', TRUE, 'ACTIVE'),
('res-rajesh-01', 'soc-gvs', 'user-committee-01', 'flat-gvs-a201', 'Rajesh Mehta', '+919900112233', 'rajesh.committee@greenvalley.com', 'OWNER', '2019-01-10', TRUE, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 6. Vehicles
INSERT INTO vehicles (id, society_id, resident_id, vehicle_number, vehicle_type, make_model, color, is_verified)
VALUES
('veh-01', 'soc-gvs', 'res-sarvesh-01', 'MH04AB1234', '4_WHEELER', 'Tata Nexon EV', 'Teal Blue', TRUE),
('veh-02', 'soc-gvs', 'res-sarvesh-01', 'MH04CD5678', '2_WHEELER', 'Ather 450X', 'Space Grey', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 7. Parking Slots
INSERT INTO parking_slots (id, society_id, slot_number, tower_block, slot_type, allocated_flat_id, is_occupied, status)
VALUES
('slot-b-101', 'soc-gvs', 'B-P101', 'Tower B Basement', 'RESIDENT', 'flat-gvs-b1204', TRUE, 'ACTIVE'),
('slot-b-102', 'soc-gvs', 'B-P102', 'Tower B Basement', 'EV_CHARGING', 'flat-gvs-b1204', FALSE, 'ACTIVE'),
('slot-vis-01', 'soc-gvs', 'VIS-01', 'Podium Open', 'VISITOR', NULL, FALSE, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 8. Amenities
INSERT INTO amenities (id, society_id, name, category, capacity_per_slot, slot_duration_minutes, hourly_charge, opening_time, closing_time, requires_approval, status)
VALUES
('amen-club', 'soc-gvs', 'Grand Clubhouse & Banquet', 'CLUBHOUSE', 100, 180, 2500.00, '08:00:00', '23:00:00', TRUE, 'ACTIVE'),
('amen-pool', 'soc-gvs', 'Infinity Swimming Pool', 'SWIMMING_POOL', 25, 60, 0.00, '06:00:00', '21:00:00', FALSE, 'ACTIVE'),
('amen-gym', 'soc-gvs', 'Fitness & Cardio Hub', 'GYM', 20, 60, 0.00, '05:30:00', '22:30:00', FALSE, 'ACTIVE'),
('amen-tennis', 'soc-gvs', 'Floodlit Tennis Court', 'TENNIS_COURT', 4, 60, 150.00, '06:00:00', '21:00:00', FALSE, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 9. Visitor Passes
INSERT INTO visitor_passes (id, society_id, resident_id, flat_id, visitor_name, phone, pass_type, vehicle_number, purpose, status, valid_from, valid_to)
VALUES
('pass-demo-01', 'soc-gvs', 'res-sarvesh-01', 'flat-gvs-b1204', 'Amit Sharma', '+919988776655', 'GUEST', 'MH04XY9999', 'Family Dinner', 'APPROVED', CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP + INTERVAL '5 hours'),
('pass-demo-02', 'soc-gvs', 'res-sarvesh-01', 'flat-gvs-b1204', 'Dunzo Delivery Agent', '+919876000000', 'DELIVERY', 'MH04DL1111', 'Package Delivery', 'CHECKED_IN', CURRENT_TIMESTAMP - INTERVAL '15 minutes', CURRENT_TIMESTAMP + INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

-- 10. Billing Cycles & Invoices
INSERT INTO billing_cycles (id, society_id, cycle_name, month_year, billing_date, due_date, late_fee_amount, total_billed_amount, total_collected_amount)
VALUES
('cycle-oct-2026', 'soc-gvs', 'October 2026 Regular Maintenance', 'October 2026', '2026-10-01', '2026-10-15', 250.00, 480000.00, 395000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO billing_invoices (id, society_id, cycle_id, resident_id, flat_id, invoice_number, maintenance_amount, utility_amount, sinking_fund, total_amount, paid_amount, due_date, status)
VALUES
('inv-b1204-oct26', 'soc-gvs', 'cycle-oct-2026', 'res-sarvesh-01', 'flat-gvs-b1204', 'INV-GVS-2026-10-1204', 3500.00, 450.00, 500.00, 4450.00, 0.00, '2026-10-15', 'PENDING')
ON CONFLICT (id) DO NOTHING;

-- 11. Maintenance Tickets
INSERT INTO maintenance_tickets (id, society_id, resident_id, flat_id, category, title, description, priority, status, assigned_staff_name)
VALUES
('ticket-001', 'soc-gvs', 'res-sarvesh-01', 'flat-gvs-b1204', 'PLUMBING', 'Master Bathroom Flush Valve Leaking', 'Continuous water flow noticed since yesterday evening.', 'MEDIUM', 'OPEN', 'Ramesh Plumber')
ON CONFLICT (id) DO NOTHING;

-- 12. Parcels
INSERT INTO parcels (id, society_id, resident_id, flat_id, courier_company, delivery_partner_name, tracking_number, pickup_code, status)
VALUES
('parcel-01', 'soc-gvs', 'res-sarvesh-01', 'flat-gvs-b1204', 'Amazon Logistics', 'Sunil Kumar', 'AMZ-IN-889922', '4921', 'AT_GATE')
ON CONFLICT (id) DO NOTHING;

-- 13. Audit Log Initial Entry
INSERT INTO audit_logs (id, society_id, actor_id, actor_name, role, action, entity_name, entity_id, metadata)
VALUES
('audit-init-01', 'soc-gvs', 'user-admin-01', 'Antigravity Super Admin', 'admin', 'MIGRATE_DATABASE', 'SYSTEM', 'soc-gvs', '{"source": "Firestore", "target": "PostgreSQL", "status": "COMPLETED"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
