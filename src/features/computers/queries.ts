import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { computersService } from './service';
import { QueryOptions } from '../../lib/base.repository';
import { Database } from '../../types/database.types';

// Query keys namespaces
export const computerKeys = {
  all: ['computers'] as const,
  lists: () => [...computerKeys.all, 'list'] as const,
  list: (options: QueryOptions) => [...computerKeys.lists(), { options }] as const,
  details: () => [...computerKeys.all, 'detail'] as const,
  detail: (id: string) => [...computerKeys.details(), id] as const,
  history: (id: string) => [...computerKeys.all, 'history', id] as const,
};

// Hook: Get list of computers with filters, search, sorting, and paging
export function useComputers(options: QueryOptions = {}) {
  return useQuery({
    queryKey: computerKeys.list(options),
    queryFn: () => computersService.getActiveComputers(options),
  });
}

// Hook: Get single computer detail
export function useComputer(id: string) {
  return useQuery({
    queryKey: computerKeys.detail(id),
    queryFn: () => computersService.getById(id),
    enabled: !!id,
  });
}

// Hook: Get computer hardware swap history
export function useComputerHistory(computerId: string) {
  return useQuery({
    queryKey: computerKeys.history(computerId),
    queryFn: () => computersService.getHardwareHistory(computerId),
    enabled: !!computerId,
  });
}

// Hook: Create computer mutation
export function useCreateComputer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Database['public']['Tables']['computers']['Insert']) =>
      computersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: computerKeys.lists() });
    },
  });
}

// Hook: Update computer mutation
export function useUpdateComputer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Database['public']['Tables']['computers']['Update'] }) =>
      computersService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: computerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: computerKeys.detail(variables.id) });
    },
  });
}

// Hook: Soft delete computer mutation
export function useDeleteComputer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, deletedBy }: { id: string; deletedBy: string }) =>
      computersService.delete(id, true, deletedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: computerKeys.lists() });
    },
  });
}

// Hook: Swap component mutation (upgrade / replacement)
export function useSwapHardware() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      computerId,
      historyData,
      specField,
    }: {
      computerId: string;
      historyData: Database['public']['Tables']['computer_component_history']['Insert'];
      specField: 'processor' | 'motherboard' | 'ram' | 'storage' | 'gpu' | 'monitor_model';
    }) => computersService.swapHardware(computerId, historyData, specField),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: computerKeys.detail(variables.computerId) });
      queryClient.invalidateQueries({ queryKey: computerKeys.history(variables.computerId) });
    },
  });
}
