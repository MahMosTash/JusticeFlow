/**
 * Trial service — judge dossier and verdict recording
 */
import api from './api';
import { Trial, PaginatedResponse } from '@/types/api';

export const trialService = {
    getTrials: async (params?: {
        case?: number;
        verdict?: string;
        page?: number;
    }): Promise<PaginatedResponse<Trial>> => {
        const response = await api.get<PaginatedResponse<Trial>>('/trials/', { params });
        return response.data;
    },

    getTrial: async (id: number): Promise<Trial> => {
        const response = await api.get<Trial>(`/trials/${id}/`);
        return response.data;
    },

    getTrialByCase: async (caseId: number): Promise<Trial | null> => {
        const response = await api.get<PaginatedResponse<Trial>>('/trials/', {
            params: { case: caseId },
        });
        return response.data.results[0] ?? null;
    },

    createTrial: async (data: { case: number; trial_date?: string; notes?: string }): Promise<Trial> => {
        const response = await api.post<Trial>('/trials/', data);
        return response.data;
    },

    recordVerdict: async (
        id: number,
        data: {
            verdict: 'Guilty' | 'Not Guilty';
            punishment_title?: string;
            punishment_description?: string;
            notes?: string;
        }
    ): Promise<Trial> => {
        const response = await api.post<Trial>(`/trials/${id}/record_verdict/`, data);
        return response.data;
    },
};
