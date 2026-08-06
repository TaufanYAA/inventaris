import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { networkService } from './service';
import { QueryOptions } from '../../lib/base.repository';

export const networkKeys = {
  all: ['network'] as const,
  devices: () => [...networkKeys.all, 'devices'] as const,
  deviceList: (options: QueryOptions) => [...networkKeys.devices(), { options }] as const,
  deviceDetail: (id: string) => [...networkKeys.all, 'device', id] as const,
  ports: (deviceId: string) => [...networkKeys.all, 'ports', deviceId] as const,
  ipam: (filters: Record<string, any>) => [...networkKeys.all, 'ipam', { filters }] as const,
  snmp: (deviceId: string) => [...networkKeys.all, 'snmp', deviceId] as const,
  map: () => [...networkKeys.all, 'map'] as const,
};

// Hook: Get all active network devices
export function useNetworkDevices(options: QueryOptions = {}) {
  return useQuery({
    queryKey: networkKeys.deviceList(options),
    queryFn: () => networkService.getActiveDevices(options),
  });
}

// Hook: Get device detail
export function useNetworkDevice(id: string) {
  return useQuery({
    queryKey: networkKeys.deviceDetail(id),
    queryFn: () => networkService.getById(id),
    enabled: !!id,
  });
}

// Hook: Create device
export function useCreateNetworkDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => networkService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: networkKeys.devices() });
    },
  });
}

// Hook: Update device
export function useUpdateNetworkDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => networkService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: networkKeys.devices() });
      queryClient.invalidateQueries({ queryKey: networkKeys.deviceDetail(variables.id) });
    },
  });
}

// Hook: Get switch ports
export function useSwitchPorts(deviceId: string) {
  return useQuery({
    queryKey: networkKeys.ports(deviceId),
    queryFn: () => networkService.getSwitchPorts(deviceId),
    enabled: !!deviceId,
  });
}

// Hook: Update switch port
export function useUpdateSwitchPort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => networkService.updateSwitchPort(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['network'] });
    },
  });
}

// Hook: Get IP address allocation pool
export function useIpPool(filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: networkKeys.ipam(filters),
    queryFn: () => networkService.getIpPool(filters),
  });
}

// Hook: Allocate IP
export function useAllocateIp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => networkService.allocateIpAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network', 'ipam'] });
    },
  });
}

// Hook: Get SNMP Metrics
export function useDeviceSnmp(deviceId: string, limit = 50) {
  return useQuery({
    queryKey: networkKeys.snmp(deviceId),
    queryFn: () => networkService.getDeviceSnmp(deviceId, limit),
    enabled: !!deviceId,
  });
}

// Hook: Get topology network map
export function useNetworkMap() {
  return useQuery({
    queryKey: networkKeys.map(),
    queryFn: () => networkService.getNetworkMap(),
  });
}

// Hook: Save config backup
export function useSaveConfigBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      deviceId,
      fileUrl,
      operatorId,
      checksum,
    }: {
      deviceId: string;
      fileUrl: string;
      operatorId: string;
      checksum: string;
    }) => networkService.saveConfigBackup(deviceId, fileUrl, operatorId, checksum),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['network', 'backups', variables.deviceId] });
    },
  });
}

// Hook: Get VLANs
export function useVlans(filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: [...networkKeys.all, 'vlans', { filters }] as const,
    queryFn: () => networkService.getVlans(filters),
  });
}

// Hook: Create VLAN
export function useCreateVlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => networkService.createVlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...networkKeys.all, 'vlans'] });
    },
  });
}

// Hook: Get DHCP Scopes
export function useDhcpScopes(filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: [...networkKeys.all, 'dhcp', { filters }] as const,
    queryFn: () => networkService.getDhcpScopes(filters),
  });
}

// Hook: Create DHCP Scope
export function useCreateDhcpScope() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => networkService.createDhcpScope(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...networkKeys.all, 'dhcp'] });
    },
  });
}

// Hook: Get DNS Records
export function useDnsRecords(filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: [...networkKeys.all, 'dns', { filters }] as const,
    queryFn: () => networkService.getDnsRecords(filters),
  });
}

// Hook: Create DNS Record
export function useCreateDnsRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => networkService.createDnsRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...networkKeys.all, 'dns'] });
    },
  });
}

