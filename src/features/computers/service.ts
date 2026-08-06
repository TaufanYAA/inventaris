import { BaseService } from '../../lib/base.service';
import { ComputersRepository } from './repository';
import { computerCreateSchema, computerUpdateSchema, componentHistorySchema } from './schemas';
import { Database } from '../../types/database.types';

export class ComputersService extends BaseService<'computers'> {
  protected computersRepository: ComputersRepository;

  constructor(repository: ComputersRepository) {
    super(repository, computerCreateSchema, computerUpdateSchema);
    this.computersRepository = repository;
  }

  // Get active workstations (excluding soft deleted)
  async getActiveComputers(options = {}) {
    try {
      return await this.computersRepository.findActive(options);
    } catch (err) {
      this.handleError(err);
    }
  }

  // Retrieve hardware history
  async getHardwareHistory(computerId: string) {
    try {
      return await this.computersRepository.getComponentHistory(computerId);
    } catch (err) {
      this.handleError(err);
    }
  }

  // Process hardware change (with Zod validation)
  async swapHardware(
    computerId: string,
    historyData: Database['public']['Tables']['computer_component_history']['Insert'],
    specField: 'processor' | 'motherboard' | 'ram' | 'storage' | 'gpu' | 'monitor_model'
  ) {
    try {
      // Validate inputs
      componentHistorySchema.parse(historyData);
      
      return await this.computersRepository.swapHardware(
        computerId,
        historyData,
        specField
      );
    } catch (err) {
      this.handleError(err);
    }
  }
}

// Export single instance
export const computersService = new ComputersService(new ComputersRepository());
