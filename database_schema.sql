-- SCHEMA DESIGN: LAB INVENTORY, CMMS & IT ASSET MANAGEMENT (ITAM) SYSTEM
-- TARGET DATABASE: SUPABASE POSTGRESQL
-- COMPATIBILITY: POSTGRESQL 13+

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. DROP EXISTING VIEWS AND TABLES (RESET SCHEMA)
-- =========================================================================
DROP VIEW IF EXISTS computer_health_view CASCADE;
DROP VIEW IF EXISTS network_health_view CASCADE;
DROP VIEW IF EXISTS asset_summary_view CASCADE;
DROP VIEW IF EXISTS software_summary_view CASCADE;
DROP VIEW IF EXISTS ticket_summary_view CASCADE;
DROP VIEW IF EXISTS maintenance_summary_view CASCADE;
DROP VIEW IF EXISTS recent_activity_view CASCADE;

DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS qr_codes CASCADE;
DROP TABLE IF EXISTS notification_queue CASCADE;
DROP TABLE IF EXISTS dns_records CASCADE;
DROP TABLE IF EXISTS dhcp_scopes CASCADE;
DROP TABLE IF EXISTS subnets CASCADE;
DROP TABLE IF EXISTS vlans CASCADE;
DROP TABLE IF EXISTS snmp_metrics CASCADE;
DROP TABLE IF EXISTS snmp_devices CASCADE;
DROP TABLE IF EXISTS network_backup_history CASCADE;
DROP TABLE IF EXISTS warranties CASCADE;
DROP TABLE IF EXISTS borrowing_details CASCADE;
DROP TABLE IF EXISTS borrowing CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS consumable_transactions CASCADE;
DROP TABLE IF EXISTS consumable_items CASCADE;
DROP TABLE IF EXISTS procurement CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS maintenance_photos CASCADE;
DROP TABLE IF EXISTS maintenance_details CASCADE;
DROP TABLE IF EXISTS maintenance_schedules CASCADE;
DROP TABLE IF EXISTS maintenance CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS software_installations CASCADE;
DROP TABLE IF EXISTS software CASCADE;
DROP TABLE IF EXISTS network_links CASCADE;
DROP TABLE IF EXISTS network_nodes CASCADE;
DROP TABLE IF EXISTS network_configs CASCADE;
DROP TABLE IF EXISTS ip_addresses CASCADE;
DROP TABLE IF EXISTS switch_ports CASCADE;
DROP TABLE IF EXISTS rack_slots CASCADE;
DROP TABLE IF EXISTS patch_panels CASCADE;
DROP TABLE IF EXISTS racks CASCADE;
DROP TABLE IF EXISTS peripherals CASCADE;
DROP TABLE IF EXISTS monitors CASCADE;
DROP TABLE IF EXISTS computer_component_history CASCADE;
DROP TABLE IF EXISTS computer_components CASCADE;
DROP TABLE IF EXISTS computers CASCADE;
DROP TABLE IF EXISTS laboratories CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS device_condition_enum CASCADE;
DROP TYPE IF EXISTS device_status_enum CASCADE;
DROP TYPE IF EXISTS network_device_type_enum CASCADE;
DROP TYPE IF EXISTS operating_system_enum CASCADE;
DROP TYPE IF EXISTS maintenance_status_enum CASCADE;
DROP TYPE IF EXISTS borrowing_status_enum CASCADE;
DROP TYPE IF EXISTS ticket_status_enum CASCADE;
DROP TYPE IF EXISTS link_type_enum CASCADE;
DROP TYPE IF EXISTS ip_type_enum CASCADE;
DROP TYPE IF EXISTS allocation_status_enum CASCADE;
DROP TYPE IF EXISTS asset_lifecycle_enum CASCADE;

-- =========================================================================
-- 2. CUSTOM TYPES (ENUMS)
-- =========================================================================
CREATE TYPE device_condition_enum AS ENUM ('Baik', 'Maintenance', 'Rusak Ringan', 'Rusak Berat');
CREATE TYPE device_status_enum AS ENUM ('Aktif', 'Nonaktif', 'Cadangan');
CREATE TYPE network_device_type_enum AS ENUM ('Router', 'Switch', 'Access Point', 'Firewall', 'Server', 'UPS', 'ONU');
CREATE TYPE operating_system_enum AS ENUM ('Windows 11', 'Windows 10', 'Ubuntu', 'Debian');
CREATE TYPE maintenance_status_enum AS ENUM ('Pending', 'In Progress', 'Resolved', 'Cancelled');
CREATE TYPE borrowing_status_enum AS ENUM ('Dipinjam', 'Kembali', 'Terlambat');
CREATE TYPE ticket_status_enum AS ENUM ('Open', 'In Review', 'Resolved', 'Closed', 'Escalated');
CREATE TYPE link_type_enum AS ENUM ('Ethernet', 'Fiber', 'Wireless');
CREATE TYPE ip_type_enum AS ENUM ('Static', 'DHCP Pool', 'Network Address', 'Broadcast Address');
CREATE TYPE allocation_status_enum AS ENUM ('Available', 'Reserved', 'Allocated');
CREATE TYPE asset_lifecycle_enum AS ENUM ('Planning', 'Procurement', 'Installed', 'Active', 'Maintenance', 'Retired', 'Disposed');

-- =========================================================================
-- 3. CORE TABLES (USER MANAGEMENT & RBAC)
-- =========================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name VARCHAR(30) UNIQUE NOT NULL, -- Admin, Laboran, Teknisi, Operator, Mahasiswa
    role_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- =========================================================================
-- 4. PHYSICAL LOCATION & RACK MANAGEMENT TABLES
-- =========================================================================
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_name VARCHAR(100) UNIQUE NOT NULL,
    location_floor INTEGER NOT NULL,
    room_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE laboratories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_name VARCHAR(100) UNIQUE NOT NULL,
    room_id UUID REFERENCES rooms(id) ON DELETE RESTRICT,
    lab_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE racks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rack_name VARCHAR(50) UNIQUE NOT NULL,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    total_units INTEGER NOT NULL DEFAULT 42, -- U height (42U)
    rack_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE patch_panels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panel_name VARCHAR(100) NOT NULL,
    rack_id UUID REFERENCES racks(id) ON DELETE CASCADE,
    total_ports INTEGER NOT NULL DEFAULT 24,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================================================
-- 5. WORKSTATION TABLES (COMPUTERS HYBRID MODEL & COMPONENT HISTORY)
-- =========================================================================
CREATE TABLE computers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    computer_name VARCHAR(50) UNIQUE NOT NULL, -- PC-01 s/d PC-45
    laboratory_id UUID REFERENCES laboratories(id) ON DELETE RESTRICT,
    operating_system operating_system_enum NOT NULL,
    
    -- Hybrid hardware specification columns (directly in computers for fast querying)
    processor VARCHAR(150),
    motherboard VARCHAR(150),
    ram VARCHAR(50),
    storage VARCHAR(150),
    gpu VARCHAR(150),
    monitor_brand VARCHAR(100),
    monitor_model VARCHAR(100),
    monitor_serial VARCHAR(100),
    peripheral_details TEXT, -- keyboard & mouse models
    
    condition device_condition_enum NOT NULL DEFAULT 'Baik',
    status device_status_enum NOT NULL DEFAULT 'Aktif',
    lifecycle_status asset_lifecycle_enum NOT NULL DEFAULT 'Installed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE computer_component_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    computer_id UUID NOT NULL REFERENCES computers(id) ON DELETE CASCADE,
    component_type VARCHAR(50) NOT NULL, -- e.g., CPU, RAM, Storage, GPU, Monitor, Peripherals
    previous_model VARCHAR(150),
    new_model VARCHAR(150) NOT NULL,
    serial_number_removed VARCHAR(100),
    serial_number_added VARCHAR(100),
    change_date DATE NOT NULL DEFAULT CURRENT_DATE,
    technician_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    change_reason TEXT NOT NULL, -- e.g., Upgrade, Replacement, Faulty swap
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================================================
-- 6. NETWORKING & ISP TABLES
-- =========================================================================
CREATE TABLE internet_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name VARCHAR(100) UNIQUE NOT NULL,
    bandwidth_speed_mbps INTEGER NOT NULL,
    contact_number VARCHAR(20),
    provider_status device_status_enum NOT NULL DEFAULT 'Aktif',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE network_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_name VARCHAR(100) NOT NULL,
    device_type network_device_type_enum NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) UNIQUE,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    internet_provider_id UUID REFERENCES internet_providers(id) ON DELETE SET NULL,
    condition device_condition_enum NOT NULL DEFAULT 'Baik',
    status device_status_enum NOT NULL DEFAULT 'Aktif',
    lifecycle_status asset_lifecycle_enum NOT NULL DEFAULT 'Installed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE rack_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rack_id UUID NOT NULL REFERENCES racks(id) ON DELETE CASCADE,
    slot_number INTEGER NOT NULL CHECK (slot_number >= 1 AND slot_number <= 42), -- U elevation
    u_height INTEGER NOT NULL DEFAULT 1,
    network_device_id UUID REFERENCES network_devices(id) ON DELETE SET NULL,
    patch_panel_id UUID REFERENCES patch_panels(id) ON DELETE SET NULL,
    slot_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT unique_rack_slot UNIQUE (rack_id, slot_number)
);

CREATE TABLE switch_ports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    network_device_id UUID NOT NULL REFERENCES network_devices(id) ON DELETE CASCADE,
    port_name VARCHAR(30) NOT NULL, -- e.g., 'ether1', 'Gi0/24'
    port_speed VARCHAR(30) NOT NULL DEFAULT '1 Gbps',
    vlan_id INTEGER DEFAULT 1,
    poe_supported BOOLEAN DEFAULT FALSE,
    poe_enabled BOOLEAN DEFAULT FALSE,
    port_status VARCHAR(20) NOT NULL DEFAULT 'Down' CHECK (port_status IN ('Up', 'Down', 'Disabled')),
    connected_device_type VARCHAR(30) NOT NULL DEFAULT 'None' CHECK (connected_device_type IN ('Computer', 'Network Device', 'Access Point', 'Server', 'UPS', 'None')),
    connected_computer_id UUID REFERENCES computers(id) ON DELETE SET NULL,
    connected_network_device_id UUID REFERENCES network_devices(id) ON DELETE SET NULL,
    connected_patch_panel_port VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT unique_device_port UNIQUE (network_device_id, port_name)
);

-- =========================================================================
-- 7. IP ADDRESS MANAGEMENT (IPAM) & NETWORK DOCUMENTATION
-- =========================================================================
CREATE TABLE ip_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address VARCHAR(45) UNIQUE NOT NULL,
    subnet_mask VARCHAR(45) NOT NULL DEFAULT '255.255.255.0',
    gateway_address VARCHAR(45),
    dns_servers VARCHAR(255) DEFAULT '8.8.8.8, 1.1.1.1',
    ip_type ip_type_enum NOT NULL DEFAULT 'Static',
    allocation_status allocation_status_enum NOT NULL DEFAULT 'Available',
    computer_id UUID REFERENCES computers(id) ON DELETE SET NULL,
    network_device_id UUID REFERENCES network_devices(id) ON DELETE SET NULL,
    ip_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE network_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    network_device_id UUID UNIQUE NOT NULL REFERENCES network_devices(id) ON DELETE CASCADE,
    gateway_ip VARCHAR(45),
    dns_servers VARCHAR(255),
    dhcp_pools TEXT,
    vlans TEXT,
    ntp_servers VARCHAR(255),
    firewall_rules_summary TEXT,
    active_config_backup_url VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Network documentation tables
CREATE TABLE vlans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vlan_number INTEGER UNIQUE NOT NULL, -- e.g. 10
    vlan_name VARCHAR(100) NOT NULL,    -- e.g. 'VLAN_Lab_A'
    laboratory_id UUID REFERENCES laboratories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE subnets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subnet_cidr VARCHAR(45) UNIQUE NOT NULL, -- e.g., '192.168.10.0/24'
    vlan_id UUID REFERENCES vlans(id) ON DELETE CASCADE,
    gateway_ip VARCHAR(45),
    dns_servers VARCHAR(255) DEFAULT '8.8.8.8, 1.1.1.1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE dhcp_scopes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subnet_id UUID NOT NULL REFERENCES subnets(id) ON DELETE CASCADE,
    scope_name VARCHAR(100) NOT NULL, -- e.g. 'DHCP_LabA'
    ip_start VARCHAR(45) NOT NULL,
    ip_end VARCHAR(45) NOT NULL,
    lease_time_seconds INTEGER DEFAULT 86400,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE dns_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_name VARCHAR(255) NOT NULL, -- e.g. 'router.labnet.ac.id'
    record_type VARCHAR(10) NOT NULL,  -- A, AAAA, CNAME, MX, TXT
    record_value TEXT NOT NULL,
    ttl INTEGER DEFAULT 3600,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- 8. NETWORK MAP NODES & LINKS (DYNAMIC AUTO-MAP TOPOLOGY)
-- =========================================================================
CREATE TABLE network_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_label VARCHAR(100) UNIQUE NOT NULL, -- Router-Utama, Switch-LabA, PC-01
    node_type VARCHAR(30) NOT NULL CHECK (node_type IN ('Router', 'Switch', 'AP', 'Computer', 'Server', 'ISP')),
    computer_id UUID UNIQUE REFERENCES computers(id) ON DELETE CASCADE,
    network_device_id UUID UNIQUE REFERENCES network_devices(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE network_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_node_id UUID NOT NULL REFERENCES network_nodes(id) ON DELETE CASCADE,
    target_node_id UUID NOT NULL REFERENCES network_nodes(id) ON DELETE CASCADE,
    link_type link_type_enum NOT NULL DEFAULT 'Ethernet',
    bandwidth_speed VARCHAR(50) DEFAULT '1 Gbps',
    source_port_id UUID REFERENCES switch_ports(id) ON DELETE SET NULL,
    target_port_id UUID REFERENCES switch_ports(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- 9. SOFTWARE LICENSE CATALOG & WORKSTATION MAPPINGS
-- =========================================================================
CREATE TABLE software (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    software_name VARCHAR(150) UNIQUE NOT NULL,
    version VARCHAR(30) NOT NULL,
    license_key VARCHAR(255),
    license_type VARCHAR(100) NOT NULL, -- KMS, OEM, Retail, Subscription
    max_install_limit INTEGER,
    expiry_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE software_installations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    computer_id UUID NOT NULL REFERENCES computers(id) ON DELETE CASCADE,
    software_id UUID NOT NULL REFERENCES software(id) ON DELETE RESTRICT,
    installed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_software_computer UNIQUE (computer_id, software_id)
);

-- =========================================================================
-- 10. COMPLAINT TICKETS & INCIDENT MANAGEMENT SYSTEM
-- =========================================================================
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(30) UNIQUE NOT NULL, -- e.g., 'TCK-20260806-001'
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reporter_name VARCHAR(100) NOT NULL,
    reporter_phone VARCHAR(20),
    laboratory_id UUID NOT NULL REFERENCES laboratories(id) ON DELETE RESTRICT,
    computer_id UUID REFERENCES computers(id) ON DELETE SET NULL,
    network_device_id UUID REFERENCES network_devices(id) ON DELETE SET NULL,
    complaint_details TEXT NOT NULL,
    ticket_status ticket_status_enum NOT NULL DEFAULT 'Open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_number VARCHAR(30) UNIQUE NOT NULL, -- e.g., 'INC-20260806-001'
    ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
    incident_title VARCHAR(150) NOT NULL,
    incident_description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'Medium' CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    incident_status VARCHAR(20) NOT NULL DEFAULT 'Open' CHECK (incident_status IN ('Open', 'Investigating', 'Workaround', 'Resolved', 'Closed', 'Escalated')),
    resolution_details TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================================================
-- 11. MAINTENANCE TICKETS & PREVENTIVE SCHEDULES
-- =========================================================================
CREATE TABLE maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    computer_id UUID REFERENCES computers(id) ON DELETE CASCADE,
    network_device_id UUID REFERENCES network_devices(id) ON DELETE CASCADE,
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL, -- Linked incident
    technician_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    ticket_title VARCHAR(150) NOT NULL,
    maintenance_status maintenance_status_enum NOT NULL DEFAULT 'Pending',
    scheduled_date DATE NOT NULL,
    completion_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE maintenance_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maintenance_id UUID NOT NULL REFERENCES maintenance(id) ON DELETE CASCADE,
    action_taken TEXT NOT NULL,
    spareparts_replaced TEXT,
    maintenance_cost NUMERIC(12,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE maintenance_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maintenance_id UUID NOT NULL REFERENCES maintenance(id) ON DELETE CASCADE,
    photo_url VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_title VARCHAR(150) NOT NULL, -- e.g., 'Pembersihan Debu Triwulan'
    schedule_type VARCHAR(50) NOT NULL,  -- Preventive, Inspection, Backup
    target_laboratory_id UUID REFERENCES laboratories(id) ON DELETE SET NULL,
    target_computer_id UUID REFERENCES computers(id) ON DELETE SET NULL,
    target_network_device_id UUID REFERENCES network_devices(id) ON DELETE SET NULL,
    interval_months INTEGER NOT NULL DEFAULT 3,
    last_run_date DATE,
    next_due_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================================================
-- 12. WARRANTIES & BACKUP HISTORY TABLES
-- =========================================================================
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_name VARCHAR(150) UNIQUE NOT NULL,
    contact_person VARCHAR(100),
    phone_number VARCHAR(20) NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE procurement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    procurement_title VARCHAR(150) NOT NULL,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    purchase_date DATE NOT NULL,
    total_cost NUMERIC(15,2) NOT NULL,
    procurement_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name VARCHAR(150) NOT NULL,
    brand VARCHAR(100),
    total_quantity INTEGER NOT NULL DEFAULT 0,
    available_quantity INTEGER NOT NULL DEFAULT 0,
    item_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE warranties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    warranty_number VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pic_name VARCHAR(100) NOT NULL,
    computer_id UUID REFERENCES computers(id) ON DELETE CASCADE,
    network_device_id UUID REFERENCES network_devices(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE network_backup_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    network_device_id UUID NOT NULL REFERENCES network_devices(id) ON DELETE CASCADE,
    backup_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    backup_file_url VARCHAR(255) NOT NULL,
    restore_status VARCHAR(20) NOT NULL DEFAULT 'Success' CHECK (restore_status IN ('Success', 'Failed')),
    operator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    checksum VARCHAR(64) NOT NULL, -- SHA-256 hash checksum
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- 13. BORROWING & CONSUMABLES MANAGEMENT
-- =========================================================================
CREATE TABLE borrowing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    borrower_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    borrow_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    actual_return_date DATE,
    borrowing_status borrowing_status_enum NOT NULL DEFAULT 'Dipinjam',
    purpose_description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE borrowing_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    borrowing_id UUID NOT NULL REFERENCES borrowing(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,
    item_condition_out device_condition_enum NOT NULL DEFAULT 'Baik',
    item_condition_in device_condition_enum,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE consumable_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name VARCHAR(150) UNIQUE NOT NULL,
    item_brand VARCHAR(100),
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    min_stock_alert INTEGER NOT NULL DEFAULT 10,
    unit_type VARCHAR(50) NOT NULL DEFAULT 'pcs',
    item_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE consumable_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consumable_item_id UUID NOT NULL REFERENCES consumable_items(id) ON DELETE RESTRICT,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('Stock In', 'Stock Out')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    recipient_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    computer_id UUID REFERENCES computers(id) ON DELETE SET NULL,
    network_device_id UUID REFERENCES network_devices(id) ON DELETE SET NULL,
    transaction_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================================================
-- 14. SNMP INTEGRATION MONITORING TABLES (FUTURE NOC WORKFLOW)
-- =========================================================================
CREATE TABLE snmp_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    network_device_id UUID UNIQUE NOT NULL REFERENCES network_devices(id) ON DELETE CASCADE,
    snmp_version VARCHAR(10) NOT NULL DEFAULT 'v2c',
    snmp_community VARCHAR(100) NOT NULL DEFAULT 'public',
    snmp_port INTEGER NOT NULL DEFAULT 161,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE snmp_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snmp_device_id UUID NOT NULL REFERENCES snmp_devices(id) ON DELETE CASCADE,
    cpu_utilization_percent NUMERIC(5,2),
    memory_utilization_percent NUMERIC(5,2),
    uptime_seconds BIGINT,
    traffic_in_kbps NUMERIC(12,2),
    traffic_out_kbps NUMERIC(12,2),
    logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- 15. SYSTEM UTILITIES (QR, ATTACHMENTS, LOGS, NOTIFICATIONS & SETTINGS)
-- =========================================================================
CREATE TABLE qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_payload VARCHAR(255) UNIQUE NOT NULL,
    computer_id UUID UNIQUE REFERENCES computers(id) ON DELETE CASCADE,
    network_device_id UUID UNIQUE REFERENCES network_devices(id) ON DELETE CASCADE,
    inventory_item_id UUID UNIQUE REFERENCES inventory_items(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    computer_id UUID REFERENCES computers(id) ON DELETE CASCADE,
    network_device_id UUID REFERENCES network_devices(id) ON DELETE CASCADE,
    maintenance_id UUID REFERENCES maintenance(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    procurement_id UUID REFERENCES procurement(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action_type VARCHAR(50) NOT NULL,
    target_table VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action_description TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient VARCHAR(150) NOT NULL,
    notification_type VARCHAR(20) NOT NULL CHECK (notification_type IN ('WhatsApp', 'Telegram', 'Email')),
    message_payload TEXT NOT NULL,
    delivery_status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (delivery_status IN ('Pending', 'Sent', 'Failed')),
    attempts INTEGER NOT NULL DEFAULT 0,
    next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- 16. PERFORMANCE OPTIMIZATION INDEXES
-- =========================================================================
CREATE INDEX idx_computers_laboratory ON computers(laboratory_id);
CREATE INDEX idx_computer_component_history_comp ON computer_component_history(computer_id);
CREATE INDEX idx_rack_slots_rack ON rack_slots(rack_id);
CREATE INDEX idx_patch_panels_rack ON patch_panels(rack_id);
CREATE INDEX idx_switch_ports_device ON switch_ports(network_device_id);
CREATE INDEX idx_switch_ports_connected_comp ON switch_ports(connected_computer_id);
CREATE INDEX idx_ip_addresses_computer ON ip_addresses(computer_id);
CREATE INDEX idx_ip_addresses_device ON ip_addresses(network_device_id);
CREATE INDEX idx_network_configs_device ON network_configs(network_device_id);
CREATE INDEX idx_network_links_source ON network_links(source_node_id);
CREATE INDEX idx_network_links_target ON network_links(target_node_id);
CREATE INDEX idx_software_installations_comp ON software_installations(computer_id);
CREATE INDEX idx_software_installations_soft ON software_installations(software_id);
CREATE INDEX idx_tickets_laboratory ON tickets(laboratory_id);
CREATE INDEX idx_incidents_ticket ON incidents(ticket_id);
CREATE INDEX idx_maintenance_computer ON maintenance(computer_id);
CREATE INDEX idx_maintenance_schedules_lab ON maintenance_schedules(target_laboratory_id);
CREATE INDEX idx_warranties_supplier ON warranties(supplier_id);
CREATE INDEX idx_network_backup_history_device ON network_backup_history(network_device_id);
CREATE INDEX idx_borrowing_borrower ON borrowing(borrower_id);
CREATE INDEX idx_borrowing_details_borrowing ON borrowing_details(borrowing_id);
CREATE INDEX idx_consumable_transactions_item ON consumable_transactions(consumable_item_id);
CREATE INDEX idx_snmp_metrics_device ON snmp_metrics(snmp_device_id);

-- Partial filter indexes
CREATE INDEX idx_computers_lifecycle ON computers(lifecycle_status);
CREATE INDEX idx_network_devices_lifecycle ON network_devices(lifecycle_status);
CREATE INDEX idx_computers_status_cond ON computers(status, condition);
CREATE INDEX idx_network_devices_status_cond ON network_devices(status, condition);
CREATE INDEX idx_switch_ports_status ON switch_ports(port_status);
CREATE INDEX idx_ip_addresses_allocation ON ip_addresses(allocation_status);
CREATE INDEX idx_incidents_status ON incidents(incident_status);
CREATE INDEX idx_maintenance_status ON maintenance(maintenance_status);
CREATE INDEX idx_consumable_items_stock_alert ON consumable_items(stock_quantity, min_stock_alert);

-- =========================================================================
-- 17. DATABASE TRIGGERS
-- =========================================================================
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_roles_modtime BEFORE UPDATE ON roles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_rooms_modtime BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_laboratories_modtime BEFORE UPDATE ON laboratories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_racks_modtime BEFORE UPDATE ON racks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_patch_panels_modtime BEFORE UPDATE ON patch_panels FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_computers_modtime BEFORE UPDATE ON computers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_computer_component_history_modtime BEFORE UPDATE ON computer_component_history FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_internet_providers_modtime BEFORE UPDATE ON internet_providers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_network_devices_modtime BEFORE UPDATE ON network_devices FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_rack_slots_modtime BEFORE UPDATE ON rack_slots FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_switch_ports_modtime BEFORE UPDATE ON switch_ports FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ip_addresses_modtime BEFORE UPDATE ON ip_addresses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_network_configs_modtime BEFORE UPDATE ON network_configs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_vlans_modtime BEFORE UPDATE ON vlans FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_subnets_modtime BEFORE UPDATE ON subnets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_dhcp_scopes_modtime BEFORE UPDATE ON dhcp_scopes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_dns_records_modtime BEFORE UPDATE ON dns_records FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_software_modtime BEFORE UPDATE ON software FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tickets_modtime BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_incidents_modtime BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_maintenance_modtime BEFORE UPDATE ON maintenance FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_maintenance_schedules_modtime BEFORE UPDATE ON maintenance_schedules FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_inventory_items_modtime BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_borrowing_modtime BEFORE UPDATE ON borrowing FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_consumable_items_modtime BEFORE UPDATE ON consumable_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_procurement_modtime BEFORE UPDATE ON procurement FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_suppliers_modtime BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_attachments_modtime BEFORE UPDATE ON attachments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Consumable items transaction trigger
CREATE TRIGGER trigger_consumable_transaction
AFTER INSERT ON consumable_transactions
FOR EACH ROW EXECUTE PROCEDURE process_consumable_transaction();

-- =========================================================================
-- 18. SQL VIEWS FOR THE DASHBOARD (AGREGASI DATA EFEKTIF UNTUK FRONTEND)
-- =========================================================================
-- View 1: Ringkasan Kesehatan Komputer
CREATE VIEW computer_health_view AS
SELECT
    COUNT(*) AS total_computers,
    COUNT(*) FILTER (WHERE condition = 'Baik' AND status = 'Aktif') AS healthy_active_count,
    COUNT(*) FILTER (WHERE condition = 'Rusak Ringan') AS slight_damage_count,
    COUNT(*) FILTER (WHERE condition = 'Rusak Berat') AS severe_damage_count,
    COUNT(*) FILTER (WHERE condition = 'Maintenance') AS maintenance_count,
    -- OS breakdown
    COUNT(*) FILTER (WHERE operating_system = 'Windows 11') AS os_windows11,
    COUNT(*) FILTER (WHERE operating_system = 'Windows 10') AS os_windows10,
    COUNT(*) FILTER (WHERE operating_system = 'Ubuntu') AS os_ubuntu,
    COUNT(*) FILTER (WHERE operating_system = 'Debian') AS os_debian
FROM computers WHERE deleted_at IS NULL;

-- View 2: Ringkasan Kesehatan Jaringan
CREATE VIEW network_health_view AS
SELECT
    COUNT(*) AS total_network_devices,
    COUNT(*) FILTER (WHERE status = 'Aktif' AND condition = 'Baik') AS healthy_active_devices,
    COUNT(*) FILTER (WHERE status = 'Nonaktif') AS inactive_devices,
    COUNT(*) FILTER (WHERE condition = 'Maintenance') AS maintenance_devices,
    -- Count devices lacking backup config files within last 30 days
    (SELECT COUNT(*) FROM network_devices nd 
     LEFT JOIN network_backup_history nbh ON nd.id = nbh.network_device_id AND nbh.backup_date > now() - INTERVAL '30 days'
     WHERE nd.deleted_at IS NULL AND nd.device_type IN ('Router', 'Switch', 'Firewall') AND nbh.id IS NULL) AS devices_without_recent_backup
FROM network_devices WHERE deleted_at IS NULL;

-- View 3: Ringkasan Aset & Nilai (ITAM Summary)
CREATE VIEW asset_summary_view AS
SELECT
    (SELECT COALESCE(SUM(total_cost), 0.00) FROM procurement WHERE deleted_at IS NULL) AS total_procurement_value,
    -- Group counts by lifecycle
    COUNT(*) FILTER (WHERE lifecycle_status = 'Planning') AS lifecycle_planning,
    COUNT(*) FILTER (WHERE lifecycle_status = 'Procurement') AS lifecycle_procurement,
    COUNT(*) FILTER (WHERE lifecycle_status = 'Installed') AS lifecycle_installed,
    COUNT(*) FILTER (WHERE lifecycle_status = 'Active') AS lifecycle_active,
    COUNT(*) FILTER (WHERE lifecycle_status = 'Maintenance') AS lifecycle_maintenance,
    COUNT(*) FILTER (WHERE lifecycle_status = 'Retired') AS lifecycle_retired,
    COUNT(*) FILTER (WHERE lifecycle_status = 'Disposed') AS lifecycle_disposed
FROM (
    SELECT lifecycle_status FROM computers WHERE deleted_at IS NULL
    UNION ALL
    SELECT lifecycle_status FROM network_devices WHERE deleted_at IS NULL
) AS unified_assets;

-- View 4: Ringkasan Software Terpasang
CREATE VIEW software_summary_view AS
SELECT 
    s.id AS software_id,
    s.software_name,
    s.version,
    s.max_install_limit,
    COUNT(si.id) AS active_installations,
    CASE 
        WHEN s.max_install_limit IS NULL THEN 'Unlimited'
        WHEN COUNT(si.id) >= s.max_install_limit THEN 'Full'
        ELSE 'Available'
    END AS installation_status,
    s.expiry_date
FROM software s
LEFT JOIN software_installations si ON s.id = si.software_id
WHERE s.deleted_at IS NULL
GROUP BY s.id, s.software_name, s.version, s.max_install_limit, s.expiry_date;

-- View 5: Ringkasan Tiket Komplain
CREATE VIEW ticket_summary_view AS
SELECT
    COUNT(*) AS total_tickets,
    COUNT(*) FILTER (WHERE ticket_status = 'Open') AS open_tickets,
    COUNT(*) FILTER (WHERE ticket_status = 'In Review') AS review_tickets,
    COUNT(*) FILTER (WHERE ticket_status = 'Resolved') AS resolved_tickets,
    COUNT(*) FILTER (WHERE ticket_status = 'Closed') AS closed_tickets,
    COUNT(*) FILTER (WHERE ticket_status = 'Escalated') AS escalated_tickets
FROM tickets WHERE deleted_at IS NULL;

-- View 6: Ringkasan Maintenance (CMMS Summary)
CREATE VIEW maintenance_summary_view AS
SELECT
    COUNT(*) AS total_maintenance_jobs,
    COUNT(*) FILTER (WHERE maintenance_status = 'Pending') AS pending_jobs,
    COUNT(*) FILTER (WHERE maintenance_status = 'In Progress') AS in_progress_jobs,
    COUNT(*) FILTER (WHERE maintenance_status = 'Resolved') AS resolved_jobs,
    COUNT(*) FILTER (WHERE maintenance_status = 'Cancelled') AS cancelled_jobs,
    COALESCE(SUM(md.maintenance_cost), 0.00) AS total_maintenance_costs
FROM maintenance m
LEFT JOIN maintenance_details md ON m.id = md.maintenance_id
WHERE m.deleted_at IS NULL;

-- View 7: Linimasa Aktivitas Terkini
CREATE VIEW recent_activity_view AS
SELECT 
    al.created_at AS event_time,
    u.full_name AS user_name,
    al.action_type,
    al.target_table,
    al.action_description
FROM activity_logs al
JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC
LIMIT 30;

-- =========================================================================
-- 19. SUPABASE ROW LEVEL SECURITY (RLS) Setup
-- =========================================================================
-- Mengaktifkan RLS
ALTER TABLE computers ENABLE ROW LEVEL SECURITY;
ALTER TABLE computer_component_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE switch_ports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumable_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- 1. computers
CREATE POLICY select_computers ON computers FOR SELECT TO authenticated USING (true);
CREATE POLICY modify_computers ON computers FOR ALL TO authenticated 
    USING (check_user_role('Admin') OR check_user_role('Laboran'));

-- 2. computer_component_history
CREATE POLICY select_history ON computer_component_history FOR SELECT TO authenticated USING (true);
CREATE POLICY modify_history ON computer_component_history FOR ALL TO authenticated 
    USING (check_user_role('Admin') OR check_user_role('Teknisi'));

-- 3. switch_ports
CREATE POLICY select_switch_ports ON switch_ports FOR SELECT TO authenticated USING (true);
CREATE POLICY modify_switch_ports ON switch_ports FOR ALL TO authenticated 
    USING (check_user_role('Admin') OR check_user_role('Laboran') OR check_user_role('Teknisi'));

-- 4. ip_addresses
CREATE POLICY select_ip_addresses ON ip_addresses FOR SELECT TO authenticated USING (true);
CREATE POLICY modify_ip_addresses ON ip_addresses FOR ALL TO authenticated 
    USING (check_user_role('Admin') OR check_user_role('Laboran'));

-- 5. network_configs
CREATE POLICY select_network_configs ON network_configs FOR SELECT TO authenticated USING (check_user_role('Admin') OR check_user_role('Laboran') OR check_user_role('Teknisi'));
CREATE POLICY modify_network_configs ON network_configs FOR ALL TO authenticated USING (check_user_role('Admin'));

-- 6. tickets
CREATE POLICY select_tickets ON tickets FOR SELECT TO authenticated USING (true);
CREATE POLICY insert_tickets ON tickets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY modify_tickets ON tickets FOR UPDATE TO authenticated 
    USING (check_user_role('Admin') OR check_user_role('Laboran') OR check_user_role('Teknisi'));

-- 7. incidents
CREATE POLICY select_incidents ON incidents FOR SELECT TO authenticated USING (true);
CREATE POLICY modify_incidents ON incidents FOR ALL TO authenticated 
    USING (check_user_role('Admin') OR check_user_role('Teknisi'));

-- 8. maintenance
CREATE POLICY select_maintenance ON maintenance FOR SELECT TO authenticated USING (true);
CREATE POLICY modify_maintenance ON maintenance FOR ALL TO authenticated 
    USING (check_user_role('Admin') OR check_user_role('Teknisi'));

-- 9. consumable_items
CREATE POLICY select_consumable_items ON consumable_items FOR SELECT TO authenticated USING (true);
CREATE POLICY modify_consumable_items ON consumable_items FOR ALL TO authenticated 
    USING (check_user_role('Admin') OR check_user_role('Laboran'));

-- 10. activity_logs
CREATE POLICY select_activity_logs ON activity_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY insert_activity_logs ON activity_logs FOR INSERT TO authenticated WITH CHECK (true);
