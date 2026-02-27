/**
 * Evidence service
 */
import api from './api';
import { Evidence, PaginatedResponse } from '@/types/api';

export const evidenceService = {
  /**
   * Get all evidence
   */
  getEvidence: async (params?: {
    case?: number;
    evidence_type?: string;
    verified?: boolean;
    detailed?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Evidence>> => {
    const response = await api.get<PaginatedResponse<Evidence>>('/evidence/', { params });
    return response.data;
  },

  /**
   * Get evidence by ID
   */
  getEvidenceById: async (id: number): Promise<Evidence> => {
    const response = await api.get<Evidence>(`/evidence/${id}/`);
    return response.data;
  },

  /**
   * Create evidence
   */
  createEvidence: async (data: FormData): Promise<Evidence> => {
    const response = await api.post<Evidence>('/evidence/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Update evidence
   */
  updateEvidence: async (id: number, data: Partial<Evidence> | FormData): Promise<Evidence> => {
    const headers: Record<string, string> = {};
    if (data instanceof FormData) {
      headers['Content-Type'] = 'multipart/form-data';
    }
    const response = await api.patch<Evidence>(`/evidence/${id}/`, data, { headers });
    return response.data;
  },

  /**
   * Verify biological evidence
   */
  verifyEvidence: async (
    id: number,
    data: {
      verified_by_national_id?: string;
      verification_notes?: string;
      is_valid: boolean;
    }
  ): Promise<Evidence> => {
    const response = await api.post<Evidence>(`/evidence/${id}/verify/`, data);
    return response.data;
  },

  /**
   * Get evidence by type
   */
  getEvidenceByType: async (): Promise<Record<string, { display_name: string; count: number }>> => {
    const response = await api.get<Record<string, { display_name: string; count: number }>>(
      '/evidence/by_type/'
    );
    return response.data;
  },
};

