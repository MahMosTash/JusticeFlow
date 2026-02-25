/**
 * Complaint service
 */
import api from './api';
import { Complaint, PaginatedResponse } from '@/types/api';

export const complaintService = {
  /**
   * Get all complaints
   */
  getComplaints: async (params?: {
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Complaint>> => {
    const response = await api.get<PaginatedResponse<Complaint>>('/complaints/', { params });
    return response.data;
  },

  /**
   * Get complaint by ID
   */
  getComplaint: async (id: number): Promise<Complaint> => {
    const response = await api.get<Complaint>(`/complaints/${id}/`);
    return response.data;
  },

  /**
   * Submit complaint
   */
  submitComplaint: async (data: { title: string; description: string }): Promise<Complaint> => {
    const response = await api.post<Complaint>('/complaints/', data);
    return response.data;
  },

  /**
   * Resubmit complaint
   */
  resubmitComplaint: async (
    id: number,
    data: { title: string; description: string }
  ): Promise<Complaint> => {
    const response = await api.post<Complaint>(`/complaints/${id}/resubmit/`, data);
    return response.data;
  },

  /**
   * Intern review complaint
   */
  reviewAsIntern: async (
    id: number,
    action: 'return' | 'forward',
    comments: string
  ): Promise<Complaint> => {
    const response = await api.post<Complaint>(`/complaints/${id}/review_as_intern/`, {
      action,
      comments,
    });
    return response.data;
  },

  /**
   * Police Officer review complaint
   */
  reviewAsOfficer: async (
    id: number,
    action: 'approve' | 'reject',
    comments: string
  ): Promise<Complaint> => {
    const response = await api.post<Complaint>(`/complaints/${id}/review_as_officer/`, {
      action,
      comments,
    });
    return response.data;
  },
};

