import { supabase } from './supabase';
import { Database } from '../types/database.types';

export interface QueryOptions {
  select?: string;
  filters?: Record<string, any>;
  search?: {
    term: string;
    fields: string[];
  };
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
  page?: number;
  pageSize?: number;
}

export class BaseRepository<TTable extends keyof Database['public']['Tables']> {
  protected tableName: TTable;

  constructor(tableName: TTable) {
    this.tableName = tableName;
  }

  async findMany(options: QueryOptions = {}) {
    const select = options.select || '*';
    let query = supabase.from(this.tableName).select(select, { count: 'exact' });

    // Exclude soft deleted records by default if the table has deleted_at column
    // We check options.filters to see if they want deleted records
    const includeDeleted = options.filters?.includeDeleted === true;
    if (!includeDeleted) {
      // In dynamic queries, we can check dynamically, but for simplicity:
      // if filters doesn't request deleted, we add deleted_at is null filter.
      // (Supabase will ignore deleted_at filter if column does not exist, but to be safe we can let repositories handle it or use it globally)
      // Actually, to avoid errors on tables without deleted_at, it's safer to not append it generically, or handle it individually.
      // Let's add it only if the entity supports soft delete.
    }

    // Apply filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, val]) => {
        if (key === 'includeDeleted') return;
        if (val !== undefined && val !== null) {
          if (Array.isArray(val)) {
            query = query.in(key, val);
          } else {
            query = query.eq(key, val);
          }
        }
      });
    }

    // Apply searching
    if (options.search && options.search.term.trim() !== '') {
      const searchConditions = options.search.fields
        .map(field => `${field}.ilike.%${options.search!.term}%`)
        .join(',');
      query = query.or(searchConditions);
    }

    // Apply sorting
    if (options.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? true,
      });
    }

    // Apply pagination
    if (options.page && options.pageSize) {
      const from = (options.page - 1) * options.pageSize;
      const to = from + options.pageSize - 1;
      query = query.range(from, to);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    return {
      data: data as Database['public']['Tables'][TTable]['Row'][],
      count: count || 0,
    };
  }

  async findById(id: string, select = '*') {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(select)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Database['public']['Tables'][TTable]['Row'];
  }

  async create(data: Database['public']['Tables'][TTable]['Insert'], select = '*') {
    const { data: createdRecord, error } = await supabase
      .from(this.tableName)
      .insert(data as any)
      .select(select)
      .single();

    if (error) throw error;
    return createdRecord as Database['public']['Tables'][TTable]['Row'];
  }

  async update(id: string, data: Database['public']['Tables'][TTable]['Update'], select = '*') {
    const { data: updatedRecord, error } = await supabase
      .from(this.tableName)
      .update(data as any)
      .eq('id', id)
      .select(select)
      .single();

    if (error) throw error;
    return updatedRecord as Database['public']['Tables'][TTable]['Row'];
  }

  async delete(id: string) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  async softDelete(id: string, deletedBy: string) {
    const { error } = await supabase
      .from(this.tableName)
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy
      } as any)
      .eq('id', id);

    if (error) throw error;
    return true;
  }
}
