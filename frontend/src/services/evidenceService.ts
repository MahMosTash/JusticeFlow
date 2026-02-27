// src/services/evidenceService.ts
import api from './api';
import { Evidence, PaginatedResponse } from '@/types/api';

export const evidenceService = {
  /** Get all evidence (filterable) */
  getEvidence: async (params?: {
    case?: number;
    evidence_type?: string;
    verified?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Evidence>> => {
    const response = await api.get<PaginatedResponse<Evidence>>('/evidence/', { params });
    return response.data;
  },

  /** Get single evidence item */
  getEvidenceById: async (id: number): Promise<Evidence> => {
    const response = await api.get<Evidence>(`/evidence/${id}/`);
    return response.data;
  },

  /** Create evidence (multipart) */
  createEvidence: async (data: FormData): Promise<Evidence> => {
    const response = await api.post<Evidence>('/evidence/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /** Update evidence */
  updateEvidence: async (id: number, data: Partial<Evidence> | FormData): Promise<Evidence> => {
    const headers: Record<string, string> = {};
    if (data instanceof FormData) {
      headers['Content-Type'] = 'multipart/form-data';
    }
    const response = await api.patch<Evidence>(`/evidence/${id}/`, data, { headers });
    return response.data;
  },

  /**
   * Verify / update review of biological evidence.
   * Doctors can call this multiple times to refine comments.
   */
  verifyEvidence: async (
    id: number,
    data: {
      verified_by_national_id?: string;
      verification_notes?: string;
    }
  ): Promise<Evidence> => {
    const response = await api.post<Evidence>(`/evidence/${id}/verify/`, data);
    return response.data;
  },

  /**
   * Forensic Doctor work queue —
   * biological evidence that has NOT been reviewed yet.
   */
  getUnansweredBiological: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Evidence>> => {
    const response = await api.get<PaginatedResponse<Evidence>>(
      '/evidence/unanswered_biological/',
      { params }
    );
    return response.data;
  },

  /** Evidence count broken down by type */
  getEvidenceByType: async (): Promise<
    Record<string, { display_name: string; count: number }>
  > => {
    const response = await api.get<Record<string, { display_name: string; count: number }>>(
      '/evidence/by_type/'
    );
    return response.data;
  },
};
