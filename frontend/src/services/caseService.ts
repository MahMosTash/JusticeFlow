/**
 * Case service
 */
import api from './api';
import { Case, PaginatedResponse } from '@/types/api';

export const caseService = {
  /**
   * Get all cases
   */
  getCases: async (params?: {
    status?: string;
    severity?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Case>> => {
    const response = await api.get<PaginatedResponse<Case>>('/cases/', { params });
    return response.data;
  },

  /**
   * Get case by ID
   */
  getCase: async (id: number): Promise<Case> => {
    const response = await api.get<Case>(`/cases/${id}/`);
    return response.data;
  },

  /**
   * Create case
   */
  createCase: async (data: Partial<Case>): Promise<Case> => {
    const response = await api.post<Case>('/cases/', data);
    return response.data;
  },

  /**
   * Update case
   */
  updateCase: async (id: number, data: Partial<Case>): Promise<Case> => {
    const response = await api.patch<Case>(`/cases/${id}/`, data);
    return response.data;
  },

  /**
   * Assign detective to case
   */
  assignDetective: async (id: number, detectiveId: number): Promise<Case> => {
    const response = await api.post<Case>(`/cases/${id}/assign_detective/`, {
      detective_id: detectiveId,
    });
    return response.data;
  },

  /**
   * Assign sergeant to case
   */
  assignSergeant: async (id: number, sergeantId: number): Promise<Case> => {
    const response = await api.post<Case>(`/cases/${id}/assign_sergeant/`, {
      sergeant_id: sergeantId,
    });
    return response.data;
  },

  /**
   * Add complainant to case
   */
  addComplainant: async (id: number, complainantId: number, notes?: string): Promise<Case> => {
    const response = await api.post<Case>(`/cases/${id}/add_complainant/`, {
      complainant_id: complainantId,
      notes,
    });
    return response.data;
  },

  /**
   * Add witness to case
   */
  addWitness: async (
    id: number,
    data: {
      witness_id?: number;
      witness_national_id?: string;
      witness_phone?: string;
      notes?: string;
    }
  ): Promise<Case> => {
    const response = await api.post<Case>(`/cases/${id}/add_witness/`, data);
    return response.data;
  },

  /**
   * Update case status
   */
  updateStatus: async (id: number, status: string): Promise<Case> => {
    const response = await api.post<Case>(`/cases/${id}/update_status/`, { status });
    return response.data;
  },
};

