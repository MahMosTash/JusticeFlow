/**
 * Suspect service
 */
import api from './api';
import { Suspect, PaginatedResponse } from '@/types/api';

export const suspectService = {
    /**
     * Get suspects list
     */
    getSuspects: async (params?: {
        case?: number;
        status?: string;
        most_wanted?: boolean;
        page?: number;
        page_size?: number;
    }): Promise<PaginatedResponse<Suspect>> => {
        const response = await api.get<PaginatedResponse<Suspect>>('/investigations/suspects/', { params });
        return response.data;
    },

    /**
     * Get suspect by ID
     */
    getSuspect: async (id: number): Promise<Suspect> => {
        const response = await api.get<Suspect>(`/investigations/suspects/${id}/`);
        return response.data;
    },

    /**
     * Create new suspect
     */
    createSuspect: async (data: Partial<Suspect>): Promise<Suspect> => {
        const response = await api.post<Suspect>('/investigations/suspects/', data);
        return response.data;
    },

    /**
     * Update suspect status
     */
    updateStatus: async (id: number, status: string): Promise<Suspect> => {
        const response = await api.post<Suspect>(`/investigations/suspects/${id}/update_status/`, { status });
        return response.data;
    },
};
