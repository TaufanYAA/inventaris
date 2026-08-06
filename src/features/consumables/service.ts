import { BaseService } from '../../lib/base.service';
import { ConsumablesRepository } from './repository';
import { 
  consumableCreateSchema, 
  consumableTransactionSchema,
  borrowingCreateSchema,
  borrowingDetailSchema
} from './schemas';
import { supabase } from '../../lib/supabase';

export class ConsumablesService extends BaseService<'consumable_items'> {
  protected consumablesRepository: ConsumablesRepository;

  constructor(repository: ConsumablesRepository) {
    super(repository, consumableCreateSchema, consumableCreateSchema.partial());
    this.consumablesRepository = repository;
  }

  // Get active items (excluding soft deleted)
  async getActiveItems(options = {}) {
    try {
      return await this.consumablesRepository.findActive(options);
    } catch (err) {
      this.handleError(err);
    }
  }

  // Get transactions
  async getTransactions(itemId?: string) {
    try {
      return await this.consumablesRepository.getTransactionHistory(itemId);
    } catch (err) {
      this.handleError(err);
    }
  }

  // Post transaction (In or Out)
  async recordTransaction(transactionData: any) {
    try {
      consumableTransactionSchema.parse(transactionData);
      
      const { data, error } = await supabase
        .from('consumable_transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      this.handleError(err);
    }
  }

  // Get borrowings
  async getLoans(filters = {}) {
    try {
      return await this.consumablesRepository.getBorrowingsList(filters);
    } catch (err) {
      this.handleError(err);
    }
  }

  // Process loan borrowing (with validation)
  async requestLoan(
    borrowingData: any, 
    items: Array<{ inventory_item_id: string; quantity: number; item_condition_out: string }>
  ) {
    try {
      borrowingCreateSchema.parse(borrowingData);
      for (const item of items) {
        borrowingDetailSchema.parse(item);
      }

      return await this.consumablesRepository.createLoan(borrowingData, items);
    } catch (err) {
      this.handleError(err);
    }
  }

  // Process loan return
  async processReturn(
    borrowingId: string,
    itemsReturn: Array<{ detail_id: string; inventory_item_id: string; quantity: number; condition_in: string }>
  ) {
    try {
      if (!borrowingId) throw new Error('ID Peminjaman tidak boleh kosong');
      return await this.consumablesRepository.returnLoan(borrowingId, itemsReturn);
    } catch (err) {
      this.handleError(err);
    }
  }
}

// Export single instance
export const consumablesService = new ConsumablesService(new ConsumablesRepository());
