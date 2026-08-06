import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { softwareService } from './service';
import { QueryOptions } from '../../lib/base.repository';

export const softwareKeys = {
  all: ['software'] as const,
  items: () => [...softwareKeys.all, 'items'] as const,
  itemList: (options: QueryOptions) => [...softwareKeys.items(), { options }] as const,
  installations: (softwareId?: string) => [...softwareKeys.all, 'installations', { softwareId }] as const,
};

// Hook: Get software catalog list
export function useSoftwareCatalog(options: QueryOptions = {}) {
  return useQuery({
    queryKey: softwareKeys.itemList(options),
    queryFn: () => softwareService.getActiveSoftware(options),
  });
}

// Hook: Create software catalog item
export function useCreateSoftware() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => softwareService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: softwareKeys.items() });
    },
  });
}

// Hook: Update software catalog item
export function useUpdateSoftware() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => softwareService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: softwareKeys.items() });
    },
  });
}

// Hook: Get software installations list
export function useSoftwareInstallations(softwareId?: string) {
  return useQuery({
    queryKey: softwareKeys.installations(softwareId),
    queryFn: () => softwareService.getInstallations(softwareId),
  });
}

// Hook: Install software on computer
export function useInstallSoftware() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => softwareService.installSoftware(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: softwareKeys.installations(variables.software_id) });
      queryClient.invalidateQueries({ queryKey: ['computers'] }); // Computer software list changes
    },
  });
}
