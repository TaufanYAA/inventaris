import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consumablesService } from './service';
import { QueryOptions } from '../../lib/base.repository';

export const consumableKeys = {
  all: ['consumables'] as const,
  items: () => [...consumableKeys.all, 'items'] as const,
  itemList: (options: QueryOptions) => [...consumableKeys.items(), { options }] as const,
  itemDetail: (id: string) => [...consumableKeys.all, 'item', id] as const,
  transactions: (itemId?: string) => [...consumableKeys.all, 'transactions', { itemId }] as const,
  loans: (filters: Record<string, any>) => [...consumableKeys.all, 'loans', { filters }] as const,
};

// Hook: Get consumable inventory items
export function useConsumableItems(options: QueryOptions = {}) {
  return useQuery({
    queryKey: consumableKeys.itemList(options),
    queryFn: () => consumablesService.getActiveItems(options),
  });
}

// Hook: Get item details
export function useConsumableItem(id: string) {
  return useQuery({
    queryKey: consumableKeys.itemDetail(id),
    queryFn: () => consumablesService.getById(id),
    enabled: !!id,
  });
}

// Hook: Create consumable catalog item
export function useCreateConsumableItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => consumablesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: consumableKeys.items() });
    },
  });
}

// Hook: Update item catalog
export function useUpdateConsumableItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => consumablesService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: consumableKeys.items() });
      queryClient.invalidateQueries({ queryKey: consumableKeys.itemDetail(variables.id) });
    },
  });
}

// Hook: Get transactions logs
export function useConsumableTransactions(itemId?: string) {
  return useQuery({
    queryKey: consumableKeys.transactions(itemId),
    queryFn: () => consumablesService.getTransactions(itemId),
  });
}

// Hook: Log transaction (stock mutation)
export function useRecordTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => consumablesService.recordTransaction(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: consumableKeys.items() });
      queryClient.invalidateQueries({ queryKey: consumableKeys.transactions(variables.consumable_item_id) });
    },
  });
}

// Hook: Get borrowings list
export function useLoans(filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: consumableKeys.loans(filters),
    queryFn: () => consumablesService.getLoans(filters),
  });
}

// Hook: Borrow items loan
export function useRequestLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      borrowingData,
      items,
    }: {
      borrowingData: any;
      items: Array<{ inventory_item_id: string; quantity: number; item_condition_out: string }>;
    }) => consumablesService.requestLoan(borrowingData, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consumables', 'loans'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] }); // Available quantities mutated
    },
  });
}

// Hook: Return items loan
export function useReturnLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      borrowingId,
      itemsReturn,
    }: {
      borrowingId: string;
      itemsReturn: Array<{ detail_id: string; inventory_item_id: string; quantity: number; condition_in: string }>;
    }) => consumablesService.processReturn(borrowingId, itemsReturn),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consumables', 'loans'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}
