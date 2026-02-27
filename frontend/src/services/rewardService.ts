import api from './api';
import { User, Case } from '@/types/api';

export interface RewardSubmission {
  id: number;
  submitted_by: User;
  case: Case | null;
  information: string;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  reviewed_by_officer?: User | null;
  reviewed_by_detective?: User | null;
  review_comments?: string;
  submitted_date: string;
  updated_date: string;
}

export interface Reward {
  id: number;
  submission: RewardSubmission;
  case: Case | null;
  amount: number;
  reward_code: string;
  status: 'Pending' | 'Claimed';
  claimed_date?: string | null;
  claimed_at_location?: string;
  created_date: string;
  created_by: User;
}

export interface RewardList {
  id: number;
  reward_code: string;
  amount: number;
  status: string;
  submitted_by: string;
  created_date: string;
}

export const rewardService = {
  // Submissions
  getSubmissions: async () => {
    const response = await api.get('/rewards/submissions/');
    return response.data;
  },

  submitInformation: async (payload: { case?: number; information: string }) => {
    const response = await api.post('/rewards/submissions/', payload);
    return response.data;
  },

  reviewAsOfficer: async (id: number, payload: { action: 'approve' | 'reject'; comments?: string }) => {
    const response = await api.post(`/rewards/submissions/${id}/review_as_officer/`, payload);
    return response.data;
  },

  reviewAsDetective: async (id: number, payload: { action: 'approve' | 'reject'; comments?: string }) => {
    const response = await api.post(`/rewards/submissions/${id}/review_as_detective/`, payload);
    return response.data;
  },

  // Rewards
  getRewards: async (params?: { status?: string; reward_code?: string }) => {
    const response = await api.get('/rewards/', { params });
    return response.data;
  },

  verifyRewardCode: async (payload: { reward_code: string; national_id: string }) => {
    const response = await api.post('/rewards/verify/', payload);
    return response.data;
  },

  claimReward: async (id: number, payload: { reward_code: string; location: string }) => {
    const response = await api.post(`/rewards/${id}/claim/`, payload);
    return response.data;
  }
};
