import { BaseRepository, QueryOptions } from './base.repository';
import { Database } from '../types/database.types';
import { ZodSchema, ZodError } from 'zod';

export class BaseService<TTable extends keyof Database['public']['Tables']> {
  protected repository: BaseRepository<TTable>;
  protected createSchema?: ZodSchema;
  protected updateSchema?: ZodSchema;

  constructor(
    repository: BaseRepository<TTable>,
    createSchema?: ZodSchema,
    updateSchema?: ZodSchema
  ) {
    this.repository = repository;
    this.createSchema = createSchema;
    this.updateSchema = updateSchema;
  }

  protected handleError(error: any): never {
    if (error instanceof ZodError) {
      const errorMessage = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      throw new Error(`Validasi Data Gagal: ${errorMessage}`);
    }
    
    // Log error for internal tracking
    console.error(`[Service Error - ${this.constructor.name}]:`, error);
    
    // Propagate friendly error message
    throw new Error(error.message || 'Terjadi kesalahan sistem di database server.');
  }

  async getAll(options: QueryOptions = {}) {
    try {
      return await this.repository.findMany(options);
    } catch (err) {
      this.handleError(err);
    }
  }

  async getById(id: string, select = '*') {
    try {
      return await this.repository.findById(id, select);
    } catch (err) {
      this.handleError(err);
    }
  }

  async create(data: Database['public']['Tables'][TTable]['Insert'], select = '*') {
    try {
      if (this.createSchema) {
        this.createSchema.parse(data);
      }
      return await this.repository.create(data, select);
    } catch (err) {
      this.handleError(err);
    }
  }

  async update(id: string, data: Database['public']['Tables'][TTable]['Update'], select = '*') {
    try {
      if (this.updateSchema) {
        // Run validation against partial values (for updates)
        this.updateSchema.parse(data);
      }
      return await this.repository.update(id, data, select);
    } catch (err) {
      this.handleError(err);
    }
  }

  async delete(id: string, softDelete = false, deletedBy?: string) {
    try {
      if (softDelete && deletedBy) {
        return await this.repository.softDelete(id, deletedBy);
      }
      return await this.repository.delete(id);
    } catch (err) {
      this.handleError(err);
    }
  }
}
