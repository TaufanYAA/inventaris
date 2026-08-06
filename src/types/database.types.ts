// TypeScript Type Declarations mapped from Supabase PostgreSQL Schema

export type DeviceCondition = 'Baik' | 'Maintenance' | 'Rusak Ringan' | 'Rusak Berat';
export type DeviceStatus = 'Aktif' | 'Nonaktif' | 'Cadangan';
export type NetworkDeviceType = 'Router' | 'Switch' | 'Access Point' | 'Firewall' | 'Server' | 'UPS' | 'ONU';
export type OperatingSystem = 'Windows 11' | 'Windows 10' | 'Ubuntu' | 'Debian';
export type MaintenanceStatus = 'Pending' | 'In Progress' | 'Resolved' | 'Cancelled';
export type BorrowingStatus = 'Dipinjam' | 'Kembali' | 'Terlambat';
export type TicketStatus = 'Open' | 'In Review' | 'Resolved' | 'Closed' | 'Escalated';
export type LinkType = 'Ethernet' | 'Fiber' | 'Wireless';
export type IpType = 'Static' | 'DHCP Pool' | 'Network Address' | 'Broadcast Address';
export type AllocationStatus = 'Available' | 'Reserved' | 'Allocated';
export type AssetLifecycle = 'Planning' | 'Procurement' | 'Installed' | 'Active' | 'Maintenance' | 'Retired' | 'Disposed';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          email: string;
          password_hash: string;
          full_name: string;
          phone_number: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Row']>;
      };
      roles: {
        Row: {
          id: string;
          role_name: string;
          role_description: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['roles']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['roles']['Row']>;
      };
      user_roles: {
        Row: {
          user_id: string;
          role_id: string;
        };
        Insert: Database['public']['Tables']['user_roles']['Row'];
        Update: Partial<Database['public']['Tables']['user_roles']['Row']>;
      };
      rooms: {
        Row: {
          id: string;
          room_name: string;
          location_floor: number;
          room_description: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['rooms']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['rooms']['Row']>;
      };
      laboratories: {
        Row: {
          id: string;
          lab_name: string;
          room_id: string;
          lab_description: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['laboratories']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['laboratories']['Row']>;
      };
      racks: {
        Row: {
          id: string;
          rack_name: string;
          room_id: string;
          total_units: number;
          rack_description: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['racks']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['racks']['Row']>;
      };
      rack_slots: {
        Row: {
          id: string;
          rack_id: string;
          slot_number: number;
          u_height: number;
          network_device_id: string | null;
          patch_panel_id: string | null;
          slot_description: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['rack_slots']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['rack_slots']['Row']>;
      };
      patch_panels: {
        Row: {
          id: string;
          panel_name: string;
          rack_id: string;
          total_ports: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['patch_panels']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['patch_panels']['Row']>;
      };
      computers: {
        Row: {
          id: string;
          computer_name: string;
          laboratory_id: string;
          operating_system: OperatingSystem;
          processor: string | null;
          motherboard: string | null;
          ram: string | null;
          storage: string | null;
          gpu: string | null;
          monitor_brand: string | null;
          monitor_model: string | null;
          monitor_serial: string | null;
          peripheral_details: string | null;
          condition: DeviceCondition;
          status: DeviceStatus;
          lifecycle_status: AssetLifecycle;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['computers']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['computers']['Row']>;
      };
      computer_component_history: {
        Row: {
          id: string;
          computer_id: string;
          component_type: string;
          previous_model: string | null;
          new_model: string;
          serial_number_removed: string | null;
          serial_number_added: string | null;
          change_date: string;
          technician_id: string;
          change_reason: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['computer_component_history']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['computer_component_history']['Row']>;
      };
      internet_providers: {
        Row: {
          id: string;
          provider_name: string;
          bandwidth_speed_mbps: number;
          contact_number: string | null;
          provider_status: DeviceStatus;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['internet_providers']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['internet_providers']['Row']>;
      };
      network_devices: {
        Row: {
          id: string;
          device_name: string;
          device_type: NetworkDeviceType;
          brand: string;
          model_name: string;
          serial_number: string | null;
          room_id: string;
          internet_provider_id: string | null;
          condition: DeviceCondition;
          status: DeviceStatus;
          lifecycle_status: AssetLifecycle;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['network_devices']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['network_devices']['Row']>;
      };
      switch_ports: {
        Row: {
          id: string;
          network_device_id: string;
          port_name: string;
          port_speed: string;
          vlan_id: number | null;
          poe_supported: boolean;
          poe_enabled: boolean;
          port_status: 'Up' | 'Down' | 'Disabled';
          connected_device_type: 'Computer' | 'Network Device' | 'Access Point' | 'Server' | 'UPS' | 'None';
          connected_computer_id: string | null;
          connected_network_device_id: string | null;
          connected_patch_panel_port: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['switch_ports']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['switch_ports']['Row']>;
      };
      ip_addresses: {
        Row: {
          id: string;
          ip_address: string;
          subnet_mask: string;
          gateway_address: string | null;
          dns_servers: string | null;
          ip_type: IpType;
          allocation_status: AllocationStatus;
          computer_id: string | null;
          network_device_id: string | null;
          ip_description: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['ip_addresses']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['ip_addresses']['Row']>;
      };
      network_configs: {
        Row: {
          id: string;
          network_device_id: string;
          gateway_ip: string | null;
          dns_servers: string | null;
          dhcp_pools: string | null;
          vlans: string | null;
          ntp_servers: string | null;
          firewall_rules_summary: string | null;
          active_config_backup_url: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['network_configs']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['network_configs']['Row']>;
      };
      vlans: {
        Row: {
          id: string;
          vlan_number: number;
          vlan_name: string;
          laboratory_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vlans']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['vlans']['Row']>;
      };
      subnets: {
        Row: {
          id: string;
          subnet_cidr: string;
          vlan_id: string | null;
          gateway_ip: string | null;
          dns_servers: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subnets']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['subnets']['Row']>;
      };
      dhcp_scopes: {
        Row: {
          id: string;
          subnet_id: string;
          scope_name: string;
          ip_start: string;
          ip_end: string;
          lease_time_seconds: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['dhcp_scopes']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['dhcp_scopes']['Row']>;
      };
      dns_records: {
        Row: {
          id: string;
          domain_name: string;
          record_type: string;
          record_value: string;
          ttl: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['dns_records']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['dns_records']['Row']>;
      };
      network_nodes: {
        Row: {
          id: string;
          node_label: string;
          node_type: 'Router' | 'Switch' | 'AP' | 'Computer' | 'Server' | 'ISP';
          computer_id: string | null;
          network_device_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['network_nodes']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['network_nodes']['Row']>;
      };
      network_links: {
        Row: {
          id: string;
          source_node_id: string;
          target_node_id: string;
          link_type: LinkType;
          bandwidth_speed: string | null;
          source_port_id: string | null;
          target_port_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['network_links']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['network_links']['Row']>;
      };
      software: {
        Row: {
          id: string;
          software_name: string;
          version: string;
          license_key: string | null;
          license_type: string;
          max_install_limit: number | null;
          expiry_date: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['software']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['software']['Row']>;
      };
      software_installations: {
        Row: {
          id: string;
          computer_id: string;
          software_id: string;
          installed_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['software_installations']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['software_installations']['Row']>;
      };
      tickets: {
        Row: {
          id: string;
          ticket_number: string;
          reporter_id: string | null;
          reporter_name: string;
          reporter_phone: string | null;
          laboratory_id: string;
          computer_id: string | null;
          network_device_id: string | null;
          complaint_details: string;
          ticket_status: TicketStatus;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['tickets']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['tickets']['Row']>;
      };
      incidents: {
        Row: {
          id: string;
          incident_number: string;
          ticket_id: string | null;
          incident_title: string;
          incident_description: string;
          severity: 'Low' | 'Medium' | 'High' | 'Critical';
          incident_status: 'Open' | 'Investigating' | 'Workaround' | 'Resolved' | 'Closed' | 'Escalated';
          resolution_details: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['incidents']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['incidents']['Row']>;
      };
      maintenance: {
        Row: {
          id: string;
          computer_id: string | null;
          network_device_id: string | null;
          incident_id: string | null;
          technician_id: string;
          ticket_title: string;
          maintenance_status: MaintenanceStatus;
          scheduled_date: string;
          completion_date: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['maintenance']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['maintenance']['Row']>;
      };
      maintenance_details: {
        Row: {
          id: string;
          maintenance_id: string;
          action_taken: string;
          spareparts_replaced: string | null;
          maintenance_cost: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['maintenance_details']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['maintenance_details']['Row']>;
      };
      maintenance_photos: {
        Row: {
          id: string;
          maintenance_id: string;
          photo_url: string;
          caption: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['maintenance_photos']['Row'], 'id' | 'created_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['maintenance_photos']['Row']>;
      };
      maintenance_schedules: {
        Row: {
          id: string;
          schedule_title: string;
          schedule_type: string;
          target_laboratory_id: string | null;
          target_computer_id: string | null;
          target_network_device_id: string | null;
          interval_months: number;
          last_run_date: string | null;
          next_due_date: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['maintenance_schedules']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['maintenance_schedules']['Row']>;
      };
      suppliers: {
        Row: {
          id: string;
          supplier_name: string;
          contact_person: string | null;
          phone_number: string;
          address: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['suppliers']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['suppliers']['Row']>;
      };
      procurement: {
        Row: {
          id: string;
          supplier_id: string;
          procurement_title: string;
          invoice_number: string;
          purchase_date: string;
          total_cost: number;
          procurement_notes: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['procurement']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['procurement']['Row']>;
      };
      inventory_items: {
        Row: {
          id: string;
          item_name: string;
          brand: string | null;
          total_quantity: number;
          available_quantity: number;
          item_description: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['inventory_items']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['inventory_items']['Row']>;
      };
      warranties: {
        Row: {
          id: string;
          supplier_id: string;
          warranty_number: string;
          start_date: string;
          end_date: string;
          pic_name: string;
          computer_id: string | null;
          network_device_id: string | null;
          inventory_item_id: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['warranties']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['warranties']['Row']>;
      };
      network_backup_history: {
        Row: {
          id: string;
          network_device_id: string;
          backup_date: string;
          backup_file_url: string;
          restore_status: 'Success' | 'Failed';
          operator_id: string | null;
          checksum: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['network_backup_history']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['network_backup_history']['Row']>;
      };
      borrowing: {
        Row: {
          id: string;
          borrower_id: string;
          borrow_date: string;
          due_date: string;
          actual_return_date: string | null;
          borrowing_status: BorrowingStatus;
          purpose_description: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['borrowing']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['borrowing']['Row']>;
      };
      borrowing_details: {
        Row: {
          id: string;
          borrowing_id: string;
          inventory_item_id: string;
          quantity: number;
          item_condition_out: DeviceCondition;
          item_condition_in: DeviceCondition | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['borrowing_details']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['borrowing_details']['Row']>;
      };
      consumable_items: {
        Row: {
          id: string;
          item_name: string;
          item_brand: string | null;
          stock_quantity: number;
          min_stock_alert: number;
          unit_type: string;
          item_description: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['consumable_items']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['consumable_items']['Row']>;
      };
      consumable_transactions: {
        Row: {
          id: string;
          consumable_item_id: string;
          transaction_type: 'Stock In' | 'Stock Out';
          quantity: number;
          transaction_date: string;
          recipient_user_id: string | null;
          computer_id: string | null;
          network_device_id: string | null;
          transaction_notes: string | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['consumable_transactions']['Row'], 'id' | 'created_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['consumable_transactions']['Row']>;
      };
      snmp_devices: {
        Row: {
          id: string;
          network_device_id: string;
          snmp_version: string;
          snmp_community: string;
          snmp_port: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['snmp_devices']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['snmp_devices']['Row']>;
      };
      snmp_metrics: {
        Row: {
          id: string;
          snmp_device_id: string;
          cpu_utilization_percent: number | null;
          memory_utilization_percent: number | null;
          uptime_seconds: number | null;
          traffic_in_kbps: number | null;
          traffic_out_kbps: number | null;
          logged_at: string;
        };
        Insert: Omit<Database['public']['Tables']['snmp_metrics']['Row'], 'id' | 'logged_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['snmp_metrics']['Row']>;
      };
      qr_codes: {
        Row: {
          id: string;
          qr_payload: string;
          computer_id: string | null;
          network_device_id: string | null;
          inventory_item_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['qr_codes']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['qr_codes']['Row']>;
      };
      attachments: {
        Row: {
          id: string;
          file_name: string;
          file_path: string;
          file_type: string;
          file_size_bytes: number;
          computer_id: string | null;
          network_device_id: string | null;
          maintenance_id: string | null;
          inventory_item_id: string | null;
          procurement_id: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['attachments']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['attachments']['Row']>;
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string;
          action_type: string;
          target_table: string;
          record_id: string;
          action_description: string;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['activity_logs']['Row'], 'id' | 'created_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['activity_logs']['Row']>;
      };
      system_settings: {
        Row: {
          id: string;
          setting_key: string;
          setting_value: string;
          setting_description: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['system_settings']['Row'], 'id' | 'updated_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['system_settings']['Row']>;
      };
      notification_queue: {
        Row: {
          id: string;
          recipient: string;
          notification_type: 'WhatsApp' | 'Telegram' | 'Email';
          message_payload: string;
          delivery_status: 'Pending' | 'Sent' | 'Failed';
          attempts: number;
          next_attempt_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notification_queue']['Row'], 'id' | 'created_at'> & {
          id?: string;
        };
        Update: Partial<Database['public']['Tables']['notification_queue']['Row']>;
      };
    };
  };
}
