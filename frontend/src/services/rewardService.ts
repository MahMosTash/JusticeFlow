/**
 * Reward service
 */
import api from './api';
import { RewardSubmission, Reward, PaginatedResponse } from '@/types/api';

export const rewardService = {
  /**
   * Get reward submissions
   */
  getSubmissions: async (params?: {
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<RewardSubmission>> => {
    const response = await api.get<PaginatedResponse<RewardSubmission>>(
      '/rewards/submissions/',
      { params }
    );
    return response.data;
  },

  /**
   * Submit reward information
   */
  submitInformation: async (data: {
    case?: number;
    information: string;
  }): Promise<RewardSubmission> => {
    const response = await api.post<RewardSubmission>('/rewards/submissions/', data);
    return response.data;
  },

  /**
   * Police Officer review submission
   */
  reviewAsOfficer: async (
    id: number,
    action: 'approve' | 'reject',
    comments: string
  ): Promise<RewardSubmission> => {
    const response = await api.post<RewardSubmission>(
      `/rewards/submissions/${id}/review_as_officer/`,
      { action, comments }
    );
    return response.data;
  },

  /**
   * Detective review and approve submission
   */
  reviewAsDetective: async (
    id: number,
    action: 'approve' | 'reject',
    comments: string
  ): Promise<{ submission: RewardSubmission; reward?: Reward }> => {
    const response = await api.post<{ submission: RewardSubmission; reward?: Reward }>(
      `/rewards/submissions/${id}/review_as_detective/`,
      { action, comments }
    );
    return response.data;
  },

  /**
   * Get rewards
   */
  getRewards: async (params?: {
    status?: string;
    reward_code?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Reward>> => {
    const response = await api.get<PaginatedResponse<Reward>>('/rewards/', { params });
    return response.data;
  },

  /**
   * Claim reward
   */
  claimReward: async (id: number, data: { reward_code: string; location: string }): Promise<Reward> => {
    const response = await api.post<Reward>(`/rewards/${id}/claim/`, data);
    return response.data;
  },
};

