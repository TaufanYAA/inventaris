import { BaseService } from '../../lib/base.service';
import { NetworkRepository } from './repository';
import { 
  networkDeviceCreateSchema, 
  networkDeviceUpdateSchema, 
  ipAddressCreateSchema,
  switchPortUpdateSchema
} from './schemas';
import { supabase } from '../../lib/supabase';

export class NetworkService extends BaseService<'network_devices'> {
  protected networkRepository: NetworkRepository;

  constructor(repository: NetworkRepository) {
    super(repository, networkDeviceCreateSchema, networkDeviceUpdateSchema);
    this.networkRepository = repository;
  }

  // Get active devices (excluding soft deleted)
  async getActiveDevices(options = {}) {
    try {
      return await this.networkRepository.findActive(options);
    } catch (err) {
      this.handleError(err);
    }
  }

  // Get ports on switch
  async getSwitchPorts(deviceId: string) {
    try {
      return await this.networkRepository.getPortsForDevice(deviceId);
    } catch (err) {
      this.handleError(err);
    }
  }

  // Get IP Address space
  async getIpPool(filters = {}) {
    try {
      return await this.networkRepository.getIpAddresses(filters);
    } catch (err) {
      this.handleError(err);
    }
  }

  // Allocate IP Address
  async allocateIpAddress(ipData: any) {
    try {
      ipAddressCreateSchema.parse(ipData);
      
      const { data, error } = await supabase
        .from('ip_addresses')
        .insert(ipData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      this.handleError(err);
    }
  }

  // Fetch SNMP Uptime/Resource stats
  async getDeviceSnmp(deviceId: string, limit = 50) {
    try {
      return await this.networkRepository.getDeviceSnmpMetrics(deviceId, limit);
    } catch (err) {
      this.handleError(err);
    }
  }

  // Get dynamic network topology map data
  async getNetworkMap() {
    try {
      return await this.networkRepository.getTopologyData();
    } catch (err) {
      this.handleError(err);
    }
  }

  // Record configuration backup
  async saveConfigBackup(deviceId: string, fileUrl: string, operatorId: string, checksum: string) {
    try {
      const { data, error } = await supabase
        .from('network_backup_history')
        .insert({
          network_device_id: deviceId,
          backup_file_url: fileUrl,
          operator_id: operatorId,
          checksum: checksum,
          restore_status: 'Success'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      this.handleError(err);
    }
  }

  // Get VLANs
  async getVlans(filters: Record<string, any> = {}) {
    try {
      return await this.networkRepository.getVlans(filters);
    } catch (err) {
      this.handleError(err);
    }
  }

  // Get DHCP Scopes
  async getDhcpScopes(filters: Record<string, any> = {}) {
    try {
      return await this.networkRepository.getDhcpScopes(filters);
    } catch (err) {
      this.handleError(err);
    }
  }

  // Get DNS Records
  async getDnsRecords(filters: Record<string, any> = {}) {
    try {
      return await this.networkRepository.getDnsRecords(filters);
    } catch (err) {
      this.handleError(err);
    }
  }
}

// Export single instance
export const networkService = new NetworkService(new NetworkRepository());
