import api from './api';
import { Role } from '@/types/api';

export interface CreateRoleData {
    name: string;
    description: string;
}

export const roleService = {
    /**
     * Get all roles
     */
    getRoles: async (): Promise<Role[]> => {
        const response = await api.get<{ results: Role[] }>('/auth/roles/');
        return response.data.results;
    },

    /**
     * Create a new role
     */
    createRole: async (data: CreateRoleData): Promise<Role> => {
        const response = await api.post<Role>('/auth/roles/', data);
        return response.data;
    },

    /**
     * Delete a role
     */
    deleteRole: async (id: number): Promise<void> => {
        await api.delete(`/auth/roles/${id}/`);
    },
};
