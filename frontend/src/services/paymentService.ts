import api from './api';
import { PaginatedResponse } from '@/types/api';

export interface BailFine {
    id: number;
    case: {
        id: number;
        title: string;
        severity: string;
    };
    suspect: {
        id: number;
        suspect_name: string;
        status?: string;
    };
    amount: string;
    type: 'Bail' | 'Fine';
    status: 'Pending' | 'Paid' | 'Overdue';
    due_date?: string;
    paid_date?: string;
    created_date: string;
}

export const paymentService = {
    getBailsFines: async (params?: {
        status?: string;
        case?: number;
        suspect?: number;
        page?: number;
    }): Promise<PaginatedResponse<BailFine>> => {
        const response = await api.get<PaginatedResponse<BailFine>>('/payments/', { params });
        return response.data;
    },

    requestPayment: async (bailFineId: number): Promise<{ track_id: number; redirect_url: string }> => {
        const response = await api.post<{ track_id: number; redirect_url: string }>(`/payments/${bailFineId}/request_payment/`);
        return response.data;
    },

    inquiryPayment: async (bailFineId: number): Promise<{ status_code: number; message: string }> => {
        const response = await api.post<{ status_code: number; message: string }>(`/payments/${bailFineId}/payment_inquiry/`);
        return response.data;
    },
};
