import { BaseRepository } from '../../lib/base.repository';
import { supabase } from '../../lib/supabase';

export class NetworkRepository extends BaseRepository<'network_devices'> {
  constructor() {
    super('network_devices');
  }

  // Get active network devices
  async findActive(options: { select?: string; filters?: Record<string, any> } = {}) {
    const filters = { ...options.filters, deleted_at: null };
    return this.findMany({ ...options, filters });
  }

  // Get switch port mappings including joined names
  async getPortsForDevice(deviceId: string) {
    const { data, error } = await supabase
      .from('switch_ports')
      .select(`
        *,
        connected_computer:computers(id, computer_name),
        connected_network_device:network_devices!switch_ports_connected_network_device_id_fkey(id, device_name)
      `)
      .eq('network_device_id', deviceId)
      .eq('deleted_at', null)
      .order('port_name', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Get IP pool allocation list
  async getIpAddresses(filters = {}) {
    const { data, count, error } = await supabase
      .from('ip_addresses')
      .select(`
        *,
        computer:computers(id, computer_name),
        network_device:network_devices(id, device_name)
      `, { count: 'exact' })
      .match(filters)
      .order('ip_address', { ascending: true });

    if (error) throw error;
    return { data, count: count || 0 };
  }

  // Fetch SNMP metrics for a device
  async getDeviceSnmpMetrics(deviceId: string, limit = 50) {
    // 1. Get snmp_device_id
    const { data: snmpDevice, error: devError } = await supabase
      .from('snmp_devices')
      .select('id')
      .eq('network_device_id', deviceId)
      .single();

    if (devError) {
      if (devError.code === 'PGRST116') return []; // Device has no SNMP enabled
      throw devError;
    }

    // 2. Fetch logged time-series metrics
    const { data, error } = await supabase
      .from('snmp_metrics')
      .select('*')
      .eq('snmp_device_id', snmpDevice.id)
      .order('logged_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  // Fetch Network Topology nodes and links for graph maps
  async getTopologyData() {
    const { data: nodes, error: nodesError } = await supabase
      .from('network_nodes')
      .select('*');
    if (nodesError) throw nodesError;

    const { data: links, error: linksError } = await supabase
      .from('network_links')
      .select(`
        *,
        source_node:network_nodes!network_links_source_node_id_fkey(id, node_label, node_type),
        target_node:network_nodes!network_links_target_node_id_fkey(id, node_label, node_type)
      `);
    if (linksError) throw linksError;

    return { nodes, links };
  }
}
