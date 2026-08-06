import { BaseService } from '../../lib/base.service';
import { SoftwareRepository } from './repository';
import { softwareCreateSchema, softwareUpdateSchema, softwareInstallationCreateSchema } from './schemas';
import { supabase } from '../../lib/supabase';

export class SoftwareService extends BaseService<'software'> {
  protected softwareRepository: SoftwareRepository;

  constructor(repository: SoftwareRepository) {
    super(repository, softwareCreateSchema, softwareUpdateSchema);
    this.softwareRepository = repository;
  }

  // Get active software catalog items
  async getActiveSoftware(options = {}) {
    try {
      return await this.softwareRepository.findActive(options);
    } catch (err) {
      this.handleError(err);
    }
  }

  // Get software installation logs
  async getInstallations(softwareId?: string) {
    try {
      return await this.softwareRepository.getInstallations(softwareId);
    } catch (err) {
      this.handleError(err);
    }
  }

  // Record software installation on computer
  async installSoftware(installationData: any) {
    try {
      softwareInstallationCreateSchema.parse(installationData);
      
      const { data, error } = await supabase
        .from('software_installations')
        .insert(installationData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      this.handleError(err);
    }
  }
}

// Export single instance
export const softwareService = new SoftwareService(new SoftwareRepository());
