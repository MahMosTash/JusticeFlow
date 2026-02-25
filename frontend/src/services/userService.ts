import api from './api';
import { User } from '@/types/api';

export interface AssignRoleData {
    role_id: number;
}

export const userService = {
    /**
     * Get all users
     */
    getUsers: async (): Promise<User[]> => {
        const response = await api.get<{ results: User[] }>('/auth/users/');
        return response.data.results;
    },

    /**
     * Get user abstract by ID
     */
    getUser: async (id: number): Promise<User> => {
        const response = await api.get<User>(`/auth/users/${id}/`);
        return response.data;
    },

    /**
     * Assign a role to a user
     */
    assignRole: async (userId: number, roleId: number): Promise<any> => {
        const response = await api.post(`/auth/users/${userId}/assign_role/`, { role_id: roleId });
        return response.data;
    },

    /**
     * Remove a role from a user
     */
    removeRole: async (userId: number, roleId: number): Promise<any> => {
        const response = await api.post(`/auth/users/${userId}/remove_role/`, { role_id: roleId });
        return response.data;
    },
};
