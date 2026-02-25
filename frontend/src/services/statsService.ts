/**
 * Statistics service for home page
 */
import api from './api';
import { PaginatedResponse, Case } from '@/types/api';

export interface HomeStats {
  total_cases: number;
  solved_cases: number;
  total_police_staff: number;
}

export const statsService = {
  /**
   * Get home page statistics
   */
  getHomeStats: async (): Promise<HomeStats> => {
    try {
      // Use the dedicated stats endpoint
      const response = await api.get<HomeStats>('/cases/stats/');
      return response.data;
    } catch (err) {
      // Fallback to individual API calls if stats endpoint fails
      const casesResponse = await api.get<PaginatedResponse<Case>>('/cases/');
      const totalCases = casesResponse.data.count;
      
      const solvedResponse = await api.get<PaginatedResponse<Case>>('/cases/', {
        params: { status: 'Resolved' },
      });
      const solvedCases = solvedResponse.data.count;
      
      return {
        total_cases: totalCases,
        solved_cases: solvedCases,
        total_police_staff: 0, // Fallback value
      };
    }
  },
};

