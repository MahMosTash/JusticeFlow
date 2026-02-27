/**
 * Investigation service
 */
import api from './api';
import {
  Suspect,
  Interrogation,
  GuiltScore,
  CaptainDecision,
  PaginatedResponse,
} from '@/types/api';

export const investigationService = {
  // Suspects
  getSuspects: async (params?: {
    case?: number;
    status?: string;
    most_wanted?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Suspect>> => {
    const response = await api.get<PaginatedResponse<Suspect>>('/investigations/suspects/', {
      params,
    });
    return response.data;
  },

  getSuspect: async (id: number): Promise<Suspect> => {
    const response = await api.get<Suspect>(`/investigations/suspects/${id}/`);
    return response.data;
  },

  createSuspect: async (data: Partial<Suspect>): Promise<Suspect> => {
    const response = await api.post<Suspect>('/investigations/suspects/', data);
    return response.data;
  },

  updateSuspectStatus: async (id: number, status: string): Promise<Suspect> => {
    const response = await api.post<Suspect>(`/investigations/suspects/${id}/update_status/`, {
      status,
    });
    return response.data;
  },

  getMostWanted: async (): Promise<Array<{ suspect: Suspect; ranking: number }>> => {
    const response = await api.get<Array<{ suspect: Suspect; ranking: number }>>(
      '/investigations/suspects/most_wanted/'
    );
    return response.data;
  },

  // Interrogations
  getInterrogations: async (params?: {
    suspect?: number;
    case?: number;
  }): Promise<PaginatedResponse<Interrogation>> => {
    const response = await api.get<PaginatedResponse<Interrogation>>(
      '/investigations/interrogations/',
      { params }
    );
    return response.data;
  },

  createInterrogation: async (data: Partial<Interrogation>): Promise<Interrogation> => {
    const response = await api.post<Interrogation>('/investigations/interrogations/', data);
    return response.data;
  },

  // Guilt Scores
  getGuiltScores: async (params?: {
    suspect?: number;
    case?: number;
  }): Promise<PaginatedResponse<GuiltScore>> => {
    const response = await api.get<PaginatedResponse<GuiltScore>>(
      '/investigations/guilt-scores/',
      { params }
    );
    return response.data;
  },

  createGuiltScore: async (data: Partial<GuiltScore>): Promise<GuiltScore> => {
    // Backend serializer uses suspect_id / case_id as write-only FK fields
    const { suspect, case: caseId, ...rest } = data as any;
    const payload = { ...rest, suspect_id: suspect, case_id: caseId };
    const response = await api.post<GuiltScore>('/investigations/guilt-scores/', payload);
    return response.data;
  },

  // Captain Decisions
  getCaptainDecisions: async (params?: {
    case?: number;
    suspect?: number;
  }): Promise<PaginatedResponse<CaptainDecision>> => {
    const response = await api.get<PaginatedResponse<CaptainDecision>>(
      '/investigations/captain-decisions/',
      { params }
    );
    return response.data;
  },

  createCaptainDecision: async (data: Partial<CaptainDecision>): Promise<CaptainDecision> => {
    const response = await api.post<CaptainDecision>('/investigations/captain-decisions/', data);
    return response.data;
  },

  approveChiefDecision: async (
    id: number,
    approval: boolean
  ): Promise<CaptainDecision> => {
    const response = await api.post<CaptainDecision>(
      `/investigations/captain-decisions/${id}/approve_chief/`,
      { approval }
    );
    return response.data;
  },
};

