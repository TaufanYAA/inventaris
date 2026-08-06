-- DATABASE SEED DATA: LAB INVENTORY, CMMS & IT ASSET MANAGEMENT (ITAM) SYSTEM
-- SEEDS DATA FOR ROLES, USERS, LOCATIONS, 45 HYBRID COMPUTERS, RACKS, SWITCHES, PORTS, IPAM, TICKETS, AND CONSUMABLES

-- TRUNCATE ALL SEED TABLES TO ENSURE NO DUPLICATE CONSTRAINTS
TRUNCATE TABLE 
    activity_logs,
    consumable_transactions,
    consumable_items,
    warranties,
    procurement,
    suppliers,
    software_installations,
    software,
    maintenance_details,
    maintenance,
    incidents,
    tickets,
    qr_codes,
    ip_addresses,
    switch_ports,
    rack_slots,
    patch_panels,
    racks,
    network_links,
    network_nodes,
    network_configs,
    network_devices,
    internet_providers,
    dhcp_scopes,
    subnets,
    vlans,
    computers,
    laboratories,
    rooms,
    user_roles,
    roles,
    users
    RESTART IDENTITY CASCADE;

-- 1. SEED ROLES
INSERT INTO roles (role_name, role_description) VALUES
('Admin', 'Administrator Utama dengan hak akses penuh sistem'),
('Laboran', 'Asisten/Staff pengelola inventaris fisik lab dan peminjaman'),
('Teknisi', 'Staff pemeliharaan hardware, OS, software, dan trouble tiket'),
('Operator', 'Staff entry data operasional harian'),
('Mahasiswa', 'Pengguna umum yang meminjam barang pendukung praktikum');

-- 2. SEED DEFAULT USERS
INSERT INTO users (id, username, email, password_hash, full_name, phone_number) VALUES
('a1111111-1111-1111-1111-111111111111', 'superadmin', 'admin@labnet.ac.id', '$2b$12$eImiTXGVGb1t.IbX/7lJLe.49vX.25eX.25eX.25eX.25eX.25eX.', 'Dr. Eng. Hermawan, M.T.', '081234567890'),
('a2222222-2222-2222-2222-222222222222', 'laboran_budi', 'budi.laboran@labnet.ac.id', '$2b$12$eImiTXGVGb1t.IbX/7lJLe.49vX.25eX.25eX.25eX.25eX.25eX.', 'Budi Santoso, A.Md.', '082345678901'),
('a3333333-3333-3333-3333-333333333333', 'teknisi_rian', 'rian.teknisi@labnet.ac.id', '$2b$12$eImiTXGVGb1t.IbX/7lJLe.49vX.25eX.25eX.25eX.25eX.25eX.', 'Rian Hidayat', '083456789012'),
('a4444444-4444-4444-4444-444444444444', 'dosen_ranti', 'ranti.dosen@labnet.ac.id', '$2b$12$eImiTXGVGb1t.IbX/7lJLe.49vX.25eX.25eX.25eX.25eX.25eX.', 'Ranti Sulastri, M.Kom.', '084567890123'),
('a5555555-5555-5555-5555-555555555555', 'mhs_aldi', 'aldi.taher@student.ac.id', '$2b$12$eImiTXGVGb1t.IbX/7lJLe.49vX.25eX.25eX.25eX.25eX.25eX.', 'Aldi Taher (NIM 10123001)', '085678901234');

-- Assign Roles
INSERT INTO user_roles (user_id, role_id) VALUES
('a1111111-1111-1111-1111-111111111111', (SELECT id FROM roles WHERE role_name = 'Admin')),
('a2222222-2222-2222-2222-222222222222', (SELECT id FROM roles WHERE role_name = 'Laboran')),
('a3333333-3333-3333-3333-333333333333', (SELECT id FROM roles WHERE role_name = 'Teknisi')),
('a4444444-4444-4444-4444-444444444444', (SELECT id FROM roles WHERE role_name = 'Operator')),
('a5555555-5555-5555-5555-555555555555', (SELECT id FROM roles WHERE role_name = 'Mahasiswa'));

-- 3. SEED ROOMS
INSERT INTO rooms (id, room_name, location_floor, room_description) VALUES
('b1111111-1111-1111-1111-111111111111', 'Ruang Server Lab', 3, 'Ruang server utama lab komputer dengan pendingin AC presisi & UPS backup'),
('b2222222-2222-2222-2222-222222222222', 'Gedung C Ruang 301 (Lab A)', 3, 'Laboratorium Komputer Pemrograman & Rekayasa Software'),
('b3333333-3333-3333-3333-333333333333', 'Gedung C Ruang 302 (Lab B)', 3, 'Laboratorium Komputer Jaringan & Sistem Komunikasi data'),
('b4444444-4444-4444-4444-444444444444', 'Gedung C Ruang 303 (Lab C)', 3, 'Laboratorium Komputer Sistem Informasi & Rekayasa Bisnis'),
('b5555555-5555-5555-5555-555555555555', 'Gedung C Ruang 304 (Lab D)', 3, 'Laboratorium Komputer Multimedia & Desain Grafis'),
('b6666666-6666-6666-6666-666666666666', 'Gedung C Ruang 305 (Lab E)', 3, 'Laboratorium Komputer Cloud Computing & IoT'),
('b7777777-7777-7777-7777-777777777777', 'Gedung C Ruang 306 (Lab F)', 3, 'Laboratorium Komputer Kecerdasan Buatan & Data Science');

-- 4. SEED LABORATORIES
INSERT INTO laboratories (id, lab_name, room_id, lab_description) VALUES
('c1111111-1111-1111-1111-111111111111', 'Lab A (Pemrograman)', 'b2222222-2222-2222-2222-222222222222', 'Fokus pada praktikum web, mobile app development, basis data, dan struktur data'),
('c2222222-2222-2222-2222-222222222222', 'Lab B (Jaringan)', 'b3333333-3333-3333-3333-333333333333', 'Fokus pada praktikum jaringan komputer, administrasi server, keamanan, & sistem tertanam'),
('c3333333-3333-3333-3333-333333333333', 'Lab C (Sistem Informasi)', 'b4444444-4444-4444-4444-444444444444', 'Fokus pada rekayasa proses bisnis, ERP, & analisis data enterprise'),
('c4444444-4444-4444-4444-444444444444', 'Lab D (Multimedia)', 'b5555555-5555-5555-5555-555555555555', 'Fokus pada pemodelan 3D, animasi, game development, & video editing'),
('c5555555-5555-5555-5555-555555555555', 'Lab E (Komputasi Awan)', 'b6666666-6666-6666-6666-666666666666', 'Fokus pada virtualisasi, cloud architecture, & implementasi smart devices'),
('c6666666-6666-6666-6666-666666666666', 'Lab F (Kecerdasan Buatan)', 'b7777777-7777-7777-7777-777777777777', 'Fokus pada machine learning, neural networks, computer vision, & big data analytics');

-- 5. SEED ISP & NETWORK CONFIGS
INSERT INTO internet_providers (id, provider_name, bandwidth_speed_mbps, contact_number, provider_status) VALUES
('d1111111-1111-1111-1111-111111111111', 'Biznet Dedicated Enterprise', 500, '1500988', 'Aktif'),
('d2222222-2222-2222-2222-222222222222', 'Telkom Astinet Backup Line', 100, '021-147', 'Aktif');

-- 6. SEED NETWORK DEVICES (Router, Core Switch, AP)
INSERT INTO network_devices (id, device_name, device_type, brand, model_name, serial_number, room_id, internet_provider_id, condition, status, lifecycle_status) VALUES
('e1111111-1111-1111-1111-111111111111', 'Router Utama MikroTik CCR2004', 'Router', 'MikroTik', 'CCR2004-1G-12S+2XS', 'MT-992384-CCR', 'b1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Baik', 'Aktif', 'Active'),
('e2222222-2222-2222-2222-222222222222', 'Core Switch Cisco Catalyst 2960-X', 'Switch', 'Cisco', 'Catalyst 2960-X 24TS-L', 'CS-77625-CAT', 'b1111111-1111-1111-1111-111111111111', NULL, 'Baik', 'Aktif', 'Active'),
('e3333333-3333-3333-3333-333333333333', 'Switch Lab A - TP-Link SG1024', 'Switch', 'TP-Link', 'TL-SG1024D', 'TP-55241-SWA', 'b2222222-2222-2222-2222-222222222222', NULL, 'Baik', 'Aktif', 'Active'),
('e4444444-4444-4444-4444-444444444444', 'Switch Lab B - TP-Link SG1024', 'Switch', 'TP-Link', 'TL-SG1024D', 'TP-55242-SWB', 'b3333333-3333-3333-3333-333333333333', NULL, 'Baik', 'Aktif', 'Active'),
('e5555555-5555-5555-5555-555555555555', 'Access Point Lab A Ubiquiti UniFi AC Pro', 'Access Point', 'Ubiquiti', 'UniFi AC Pro', 'UAP-88349-LA', 'b2222222-2222-2222-2222-222222222222', NULL, 'Baik', 'Aktif', 'Active'),
('e6666666-6666-6666-6666-666666666666', 'Access Point Lab B Ubiquiti UniFi AC Pro', 'Access Point', 'Ubiquiti', 'UniFi AC Pro', 'UAP-88350-LB', 'b3333333-3333-3333-3333-333333333333', NULL, 'Baik', 'Aktif', 'Active');

-- Network Configurations
INSERT INTO network_configs (network_device_id, gateway_ip, dns_servers, dhcp_pools, vlans, ntp_servers, firewall_rules_summary) VALUES
('e1111111-1111-1111-1111-111111111111', '192.168.10.1', '8.8.8.8, 1.1.1.1', 
 '{"pools": [{"name": "DHCP_LabA", "range": "192.168.10.100-192.168.10.200"}, {"name": "DHCP_LabB", "range": "192.168.20.100-192.168.20.200"}]}', 
 '{"vlans": [{"id": 10, "name": "VLAN_LabA"}, {"id": 20, "name": "VLAN_LabB"}]}', 
 'id.pool.ntp.org', 
 'Chain Input: Drop Invalid, Accept Established. Forward: Fasttrack, Accept Local.');

-- SNMP Config
INSERT INTO snmp_devices (network_device_id, snmp_version, snmp_community, snmp_port) VALUES
('e1111111-1111-1111-1111-111111111111', 'v2c', 'public-utki', 161),
('e2222222-2222-2222-2222-222222222222', 'v2c', 'public-utki', 161);

-- 7. SEED RACKS, RACK SLOTS & PATCH PANELS
INSERT INTO racks (id, rack_name, room_id, total_units, rack_description) VALUES
('f1111111-1111-1111-1111-111111111111', 'Rack Server Utama C-3', 'b1111111-1111-1111-1111-111111111111', 42, 'Rak server tertutup 42U untuk Router, Core Switch, dan Server Lab');

INSERT INTO patch_panels (id, panel_name, rack_id, total_ports) VALUES
('f2222222-2222-2222-2222-222222222222', 'Patch Panel Cat6 24-Port 1', 'f1111111-1111-1111-1111-111111111111', 24);

-- Seed Rack Slots (Visual Elevation map)
INSERT INTO rack_slots (rack_id, slot_number, u_height, network_device_id, slot_description) VALUES
('f1111111-1111-1111-1111-111111111111', 42, 1, 'e1111111-1111-1111-1111-111111111111', 'Mounted Router CCR2004'),
('f1111111-1111-1111-1111-111111111111', 41, 1, 'e2222222-2222-2222-2222-222222222222', 'Mounted Core Switch Catalyst');

INSERT INTO rack_slots (rack_id, slot_number, u_height, patch_panel_id, slot_description) VALUES
('f1111111-1111-1111-1111-111111111111', 39, 1, 'f2222222-2222-2222-2222-222222222222', 'Mounted Patch Panel LAN Belden');

-- Switch Ports for Cisco Core Switch
DO $$
DECLARE
    i INT;
    port_name_str VARCHAR;
BEGIN
    FOR i IN 1..24 LOOP
        port_name_str := 'Gi0/' || i;
        INSERT INTO switch_ports (id, network_device_id, port_name, port_speed, vlan_id, poe_supported, poe_enabled, port_status, connected_device_type) VALUES
        (gen_random_uuid(), 'e2222222-2222-2222-2222-222222222222', port_name_str, '1 Gbps', 1, 
         CASE WHEN i <= 8 THEN TRUE ELSE FALSE END,
         CASE WHEN i <= 2 THEN TRUE ELSE FALSE END,
         CASE WHEN i <= 10 THEN 'Up' ELSE 'Down' END,
         CASE 
            WHEN i = 1 THEN 'Access Point' 
            WHEN i = 2 THEN 'Access Point' 
            WHEN i IN (3, 4) THEN 'Network Device' 
            WHEN i IN (5, 6, 7, 8) THEN 'Computer'
            ELSE 'None' 
         END);
    END LOOP;
END $$;

-- 8. SEED NETWORK DOCK (VLANs, SUBNETs, DHCP SCOPEs, DNS)
INSERT INTO vlans (id, vlan_number, vlan_name, laboratory_id) VALUES
('f1111111-1111-1111-1111-111111111111', 10, 'VLAN_LabA_Pemrograman', 'c1111111-1111-1111-1111-111111111111'),
('f2222222-2222-2222-2222-222222222222', 20, 'VLAN_LabB_Jaringan', 'c2222222-2222-2222-2222-222222222222'),
('f3333333-3333-3333-3333-333333333333', 30, 'VLAN_LabC_SistInfo', 'c3333333-3333-3333-3333-333333333333'),
('f4444444-4444-4444-4444-444444444444', 40, 'VLAN_LabD_Multimedia', 'c4444444-4444-4444-4444-444444444444'),
('f5555555-5555-5555-5555-555555555555', 50, 'VLAN_LabE_Awan', 'c5555555-5555-5555-5555-555555555555'),
('f6666666-6666-6666-6666-666666666666', 60, 'VLAN_LabF_Kecerdasan', 'c6666666-6666-6666-6666-666666666666');

INSERT INTO subnets (id, subnet_cidr, vlan_id, gateway_ip, dns_servers) VALUES
('f3333333-3333-3333-3333-333333333333', '192.168.10.0/24', 'f1111111-1111-1111-1111-111111111111', '192.168.10.1', '8.8.8.8, 1.1.1.1'),
('f4444444-4444-4444-4444-444444444444', '192.168.20.0/24', 'f2222222-2222-2222-2222-222222222222', '192.168.20.1', '8.8.8.8, 1.1.1.1'),
('f5555555-5555-5555-5555-555555555555', '192.168.30.0/24', 'f3333333-3333-3333-3333-333333333333', '192.168.30.1', '8.8.8.8, 1.1.1.1'),
('f6666666-6666-6666-6666-666666666666', '192.168.40.0/24', 'f4444444-4444-4444-4444-444444444444', '192.168.40.1', '8.8.8.8, 1.1.1.1'),
('f7777777-7777-7777-7777-777777777777', '192.168.50.0/24', 'f5555555-5555-5555-5555-555555555555', '192.168.50.1', '8.8.8.8, 1.1.1.1'),
('f8888888-8888-8888-8888-888888888888', '192.168.60.0/24', 'f6666666-6666-6666-6666-666666666666', '192.168.60.1', '8.8.8.8, 1.1.1.1');

INSERT INTO dhcp_scopes (subnet_id, scope_name, ip_start, ip_end, lease_time_seconds) VALUES
('f3333333-3333-3333-3333-333333333333', 'DHCP_Scope_LabA', '192.168.10.100', '192.168.10.254', 86400),
('f4444444-4444-4444-4444-444444444444', 'DHCP_Scope_LabB', '192.168.20.100', '192.168.20.254', 86400),
('f5555555-5555-5555-5555-555555555555', 'DHCP_Scope_LabC', '192.168.30.100', '192.168.30.254', 86400),
('f6666666-6666-6666-6666-666666666666', 'DHCP_Scope_LabD', '192.168.40.100', '192.168.40.254', 86400),
('f7777777-7777-7777-7777-777777777777', 'DHCP_Scope_LabE', '192.168.50.100', '192.168.50.254', 86400),
('f8888888-8888-8888-8888-888888888888', 'DHCP_Scope_LabF', '192.168.60.100', '192.168.60.254', 86400);

INSERT INTO dns_records (domain_name, record_type, record_value) VALUES
('router.labnet.ac.id', 'A', '192.168.10.1'),
('switch-core.labnet.ac.id', 'CNAME', 'router.labnet.ac.id');

-- 9. LOOP PL/pgSQL SEED 270 COMPUTERS (6 LABS * 45 PCs) & IPAM
DO $$
DECLARE
    lab_idx INT;
    pc_idx INT;
    global_pc_idx INT := 1;
    lab_id UUID;
    comp_id UUID;
    ip_addr VARCHAR;
    subnet_base INT;
BEGIN
    FOR lab_idx IN 1..6 LOOP
        IF lab_idx = 1 THEN lab_id := 'c1111111-1111-1111-1111-111111111111'; subnet_base := 10;
        ELSIF lab_idx = 2 THEN lab_id := 'c2222222-2222-2222-2222-222222222222'; subnet_base := 20;
        ELSIF lab_idx = 3 THEN lab_id := 'c3333333-3333-3333-3333-333333333333'; subnet_base := 30;
        ELSIF lab_idx = 4 THEN lab_id := 'c4444444-4444-4444-4444-444444444444'; subnet_base := 40;
        ELSIF lab_idx = 5 THEN lab_id := 'c5555555-5555-5555-5555-555555555555'; subnet_base := 50;
        ELSIF lab_idx = 6 THEN lab_id := 'c6666666-6666-6666-6666-666666666666'; subnet_base := 60;
        END IF;

        FOR pc_idx IN 1..45 LOOP
            ip_addr := '192.168.' || subnet_base || '.' || (10 + pc_idx);
            comp_id := gen_random_uuid();

            -- Insert Computer using HYBRID MODEL
            INSERT INTO computers (
                id, computer_name, laboratory_id, operating_system,
                processor, motherboard, ram, storage, gpu,
                monitor_brand, monitor_model, monitor_serial, peripheral_details,
                condition, status, lifecycle_status
            ) VALUES (
                comp_id, 
                'PC-' || CASE WHEN global_pc_idx < 100 THEN LPAD(global_pc_idx::text, 2, '0') ELSE global_pc_idx::text END, 
                lab_id, 
                CASE WHEN global_pc_idx % 5 = 0 THEN 'Ubuntu'::operating_system_enum ELSE 'Windows 11'::operating_system_enum END,
                CASE WHEN global_pc_idx % 3 = 0 THEN 'Intel Core i7-12700' ELSE 'AMD Ryzen 5 5600X' END,
                'Asus Prime H610M-K',
                CASE WHEN global_pc_idx % 4 = 0 THEN '16GB DDR4 Dual-Channel' ELSE '8GB DDR4' END,
                'Samsung 980 512GB NVMe M.2 SSD',
                CASE WHEN global_pc_idx % 6 = 0 THEN 'NVIDIA RTX 3060 12GB' ELSE 'Intel UHD Graphics 730' END,
                'LG Electronics', 
                'UltraGear 24GQ50F', 
                'SN-MONITOR-' || global_pc_idx,
                'Logitech K120 Keyboard USB + Logitech B100 Mouse Optical USB',
                CASE 
                    WHEN global_pc_idx = 12 THEN 'Maintenance'::device_condition_enum 
                    WHEN global_pc_idx = 18 THEN 'Rusak Ringan'::device_condition_enum
                    ELSE 'Baik'::device_condition_enum 
                END,
                CASE WHEN global_pc_idx = 12 THEN 'Nonaktif'::device_status_enum ELSE 'Aktif'::device_status_enum END,
                CASE 
                    WHEN global_pc_idx = 12 THEN 'Maintenance'::asset_lifecycle_enum 
                    WHEN global_pc_idx = 45 THEN 'Retired'::asset_lifecycle_enum
                    ELSE 'Active'::asset_lifecycle_enum 
                END
            );

            -- Allocate IP Address in IPAM
            INSERT INTO ip_addresses (ip_address, subnet_mask, gateway_address, dns_servers, ip_type, allocation_status, computer_id, ip_description) VALUES
            (ip_addr, '255.255.255.0', 
             '192.168.' || subnet_base || '.1',
             '8.8.8.8, 1.1.1.1', 'Static', 'Allocated', comp_id, 'Workstation PC-' || CASE WHEN global_pc_idx < 100 THEN LPAD(global_pc_idx::text, 2, '0') ELSE global_pc_idx::text END);

            -- Seed QR Code
            INSERT INTO qr_codes (qr_payload, computer_id) VALUES
            ('https://labnet.ac.id/scan/computer/' || comp_id, comp_id);

            global_pc_idx := global_pc_idx + 1;
        END LOOP;
    END LOOP;
END $$;


-- 10. SEED IPAM FOR ROUTER & SWITCHES
INSERT INTO ip_addresses (ip_address, subnet_mask, gateway_address, dns_servers, ip_type, allocation_status, network_device_id, ip_description) VALUES
('192.168.10.1', '255.255.255.0', NULL, '8.8.8.8', 'Static', 'Reserved', 'e1111111-1111-1111-1111-111111111111', 'Gateway Router CCR2004 Lab A'),
('192.168.20.1', '255.255.255.0', NULL, '8.8.8.8', 'Static', 'Reserved', 'e1111111-1111-1111-1111-111111111111', 'Gateway Router CCR2004 Lab B'),
('192.168.10.2', '255.255.255.0', '192.168.10.1', '8.8.8.8', 'Static', 'Allocated', 'e2222222-2222-2222-2222-222222222222', 'Cisco Catalyst Core Switch Management IP'),
('192.168.10.10', '255.255.255.0', '192.168.10.1', '8.8.8.8', 'Static', 'Allocated', 'e5555555-5555-5555-5555-555555555555', 'AP Lab A IP');

-- 11. SEED NETWORK MAP GRAPH (NODES & LINKS)
INSERT INTO network_nodes (node_label, node_type, network_device_id) VALUES
('Router-CCR2004', 'Router', 'e1111111-1111-1111-1111-111111111111'),
('Cisco-CoreSwitch', 'Switch', 'e2222222-2222-2222-2222-222222222222'),
('AP-LabA', 'AP', 'e5555555-5555-5555-5555-555555555555');

INSERT INTO network_links (source_node_id, target_node_id, link_type, bandwidth_speed) VALUES
((SELECT id FROM network_nodes WHERE node_label = 'Router-CCR2004'), (SELECT id FROM network_nodes WHERE node_label = 'Cisco-CoreSwitch'), 'Fiber', '10 Gbps'),
((SELECT id FROM network_nodes WHERE node_label = 'Cisco-CoreSwitch'), (SELECT id FROM network_nodes WHERE node_label = 'AP-LabA'), 'Ethernet', '1 Gbps');

-- 12. SEED SOFTWARE
INSERT INTO software (software_name, version, license_key, license_type, max_install_limit, expiry_date) VALUES
('Windows 11 Pro Education', '23H2', 'W269N-WFGWX-YVC9B-4J6C9-T83GX', 'KMS Key', 100, '2030-12-31'),
('Microsoft Office LTSC 2021', '16.0', 'FNYWH-XB96M-C2QGH-K9T8B-P86GY', 'KMS Key', 100, '2030-12-31'),
('AutoCAD 2024 Education Suite', '24.3', '555-88349281-EDU', 'Subscription', 45, '2027-02-15'),
('Matlab R2023b Campus License', '9.15', 'ML-992384-CAMP', 'Concurrent', 25, '2026-12-31'),
('VS Code', '1.86', 'Open Source', 'Free', 9999, NULL);

-- Map software installations on computers (Windows & VS Code on all 45 computers)
INSERT INTO software_installations (computer_id, software_id)
SELECT c.id, s.id
FROM computers c, software s
WHERE s.software_name IN ('Windows 11 Pro Education', 'VS Code');

-- 13. SEED WARRANTY & BACKUP HISTORY & INCIDENTS & TICKETS
INSERT INTO suppliers (id, supplier_name, contact_person, phone_number, address) VALUES
('91111111-1111-1111-1111-111111111111', 'CV. Jaya Raya Mandiri', 'Roni Wijaya', '021-5524381', 'Jl. Mangga Dua Raya No. 42, Jakarta Pusat');

INSERT INTO procurement (id, supplier_id, procurement_title, invoice_number, purchase_date, total_cost, procurement_notes) VALUES
('77111111-1111-1111-1111-111111111111', '91111111-1111-1111-1111-111111111111', 'Pengadaan PC Workstation Baru 2026', 'INV-2026-9923', '2026-01-10', 450000000.00, 'Pengadaan 45 Unit PC Workstation Baru beserta monitor');

-- Seed Warranties for computers
INSERT INTO warranties (supplier_id, warranty_number, start_date, end_date, pic_name, computer_id)
SELECT '91111111-1111-1111-1111-111111111111', 'WAR-BEL-PC-' || c.computer_name, '2026-01-10', '2029-01-10', 'Roni Wijaya (Warranty PIC)', c.id
FROM computers c;

-- Seed Network Backups
INSERT INTO network_backup_history (network_device_id, backup_date, backup_file_url, restore_status, operator_id, checksum) VALUES
('e1111111-1111-1111-1111-111111111111', now() - INTERVAL '2 days', '/backups/router_ccr_20260804.backup', 'Success', 'a3333333-3333-3333-3333-333333333333', 'd8c361661159ea8996e3a96677f5ad67c2cdcf22bd19962e245a4a90947098e9');

-- Seed Tickets, Incidents, and Maintenance Flow
INSERT INTO tickets (id, ticket_number, reporter_name, reporter_phone, laboratory_id, computer_id, complaint_details, ticket_status) VALUES
('00000000-0000-0000-0000-000000000001', 'TCK-20260806-001', 'Ranti Sulastri, M.Kom.', '084567890123', 'c1111111-1111-1111-1111-111111111111', 
 (SELECT id FROM computers WHERE computer_name = 'PC-12'), 'PC sering BSOD acak ketika merender visualisasi program.', 'Open');

INSERT INTO incidents (id, incident_number, ticket_id, incident_title, incident_description, severity, incident_status) VALUES
('99999999-9999-9999-9999-999999999999', 'INC-20260806-001', '00000000-0000-0000-0000-000000000001', 'BSOD Berulang PC-12 Lab A', 'Crash BSOD Kernel Security Check Failure pada PC-12 di Lab A.', 'High', 'Open');

INSERT INTO maintenance (id, computer_id, incident_id, technician_id, ticket_title, maintenance_status, scheduled_date) VALUES
('77777777-7777-7777-7777-777777777777', (SELECT id FROM computers WHERE computer_name = 'PC-12'), '99999999-9999-9999-9999-999999999999', 'a3333333-3333-3333-3333-333333333333', 
 'Investigasi RAM & Overheat PC-12', 'In Progress', '2026-08-06');

INSERT INTO maintenance_details (maintenance_id, action_taken, spareparts_replaced, maintenance_cost) VALUES
('77777777-7777-7777-7777-777777777777', 'Membersihkan pin RAM dengan karet penghapus. Menjalankan MemTest86.', NULL, 0.00);

-- Component Change History (Asset change log)
INSERT INTO computer_component_history (computer_id, component_type, previous_model, new_model, serial_number_removed, serial_number_added, technician_id, change_reason) VALUES
((SELECT id FROM computers WHERE computer_name = 'PC-01'), 'RAM', 'Corsair 8GB DDR4', 'Corsair 16GB DDR4 (Upgrade)', 'SN-RAM-01', 'SN-RAM-UPGRADED-01', 'a3333333-3333-3333-3333-333333333333', 'Peningkatan kapasitas RAM untuk menopang tugas AI/ML');

-- Preventive maintenance schedules
INSERT INTO maintenance_schedules (schedule_title, schedule_type, target_laboratory_id, interval_months, last_run_date, next_due_date) VALUES
('Pembersihan Debu Workstation Lab A', 'Preventive', 'c1111111-1111-1111-1111-111111111111', 3, '2026-05-10', '2026-08-10'),
('Backup Berkala Konfigurasi Router MikroTik', 'Backup', NULL, 1, '2026-07-20', '2026-08-20');

-- 14. SEED CONSUMABLE INVENTORY
INSERT INTO consumable_items (id, item_name, item_brand, stock_quantity, min_stock_alert, unit_type, item_description) VALUES
('81111111-1111-1111-1111-111111111111', 'Konektor RJ45 Cat6 Belden', 'Belden', 0, 20, 'pcs', 'Konektor RJ45 kualitas tinggi untuk kabel UTP Cat6'),
('82222222-2222-2222-2222-222222222222', 'Pasta Thermal Noctua NT-H1', 'Noctua', 0, 2, 'tube', 'Pasta thermal high-performance untuk processor workstation'),
('83333333-3333-3333-3333-333333333333', 'Kabel LAN UTP Cat6 Belden (1 Roll)', 'Belden', 0, 1, 'box', 'Kabel LAN Belden UTP Cat 6 panjang 305 meter per box');

-- Trigger will update stock_quantity on transaction insert
INSERT INTO consumable_transactions (consumable_item_id, transaction_type, quantity, transaction_notes, created_by) VALUES
('81111111-1111-1111-1111-111111111111', 'Stock In', 200, 'Pengadaan awal semester', 'a1111111-1111-1111-1111-111111111111'),
('82222222-2222-2222-2222-222222222222', 'Stock In', 5, 'Pembelian Noctua thermal grease', 'a1111111-1111-1111-1111-111111111111'),
('83333333-3333-3333-3333-333333333333', 'Stock In', 3, 'Pengadaan UTP Kabel Belden 3 Roll', 'a1111111-1111-1111-1111-111111111111');

INSERT INTO consumable_transactions (consumable_item_id, transaction_type, quantity, computer_id, transaction_notes, created_by) VALUES
('81111111-1111-1111-1111-111111111111', 'Stock Out', 10, (SELECT id FROM computers WHERE computer_name = 'PC-01'), 'Digunakan untuk crimping kabel LAN baru workstation PC-01', 'a3333333-3333-3333-3333-333333333333'),
('82222222-2222-2222-2222-222222222222', 'Stock Out', 1, (SELECT id FROM computers WHERE computer_name = 'PC-12'), 'Repaste thermal processor PC-12 karena overheat', 'a3333333-3333-3333-3333-333333333333');

-- 15. SEED SYSTEM SETTINGS & SAMPLE AUDIT LOGS
INSERT INTO system_settings (setting_key, setting_value, setting_description) VALUES
('campus_name', 'Universitas Teknologi Komputer Indonesia (UTKI)', 'Nama Institusi Kampus Utama'),
('alert_email_notification', 'admin@labnet.ac.id', 'Email penerima laporan kendala otomatis server'),
('snmp_read_community', 'public-utki', 'Snmp community string untuk network monitoring script');

INSERT INTO activity_logs (user_id, action_type, target_table, record_id, action_description, ip_address) VALUES
('a1111111-1111-1111-1111-111111111111', 'Login', 'users', 'a1111111-1111-1111-1111-111111111111', 'User Admin login berhasil', '192.168.10.21'),
('a3333333-3333-3333-3333-333333333333', 'Edit', 'computers', (SELECT id FROM computers WHERE computer_name = 'PC-12'), 'Mengubah kondisi PC-12 menjadi Maintenance', '192.168.10.15');

-- Seed SNMP Mock Metrics (NOC simulation)
INSERT INTO snmp_metrics (snmp_device_id, cpu_utilization_percent, memory_utilization_percent, uptime_seconds, traffic_in_kbps, traffic_out_kbps) VALUES
((SELECT id FROM snmp_devices LIMIT 1), 42.50, 68.20, 1318400, 18500.00, 7200.00);
