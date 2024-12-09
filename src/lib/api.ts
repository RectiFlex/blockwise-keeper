import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';

interface ApiError extends Error {
  status?: number;
  code?: string;
}

class ApiService {
  private static handleError(error: any): ApiError {
    logger.error('API Error:', { error });
    
    const apiError: ApiError = new Error(
      error.message || 'An unexpected error occurred'
    );
    
    apiError.status = error.status || 500;
    apiError.code = error.code;
    
    return apiError;
  }

  static async get<T>(endpoint: string, options = {}): Promise<T> {
    try {
      const { data, error } = await supabase
        .from(endpoint)
        .select()
        .single();

      if (error) throw error;
      return data as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async post<T>(endpoint: string, payload: any): Promise<T> {
    try {
      const { data, error } = await supabase
        .from(endpoint)
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async update<T>(endpoint: string, id: string, payload: any): Promise<T> {
    try {
      const { data, error } = await supabase
        .from(endpoint)
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async delete(endpoint: string, id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(endpoint)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}