/**
 * Detective Board service
 */
import api from './api';
import { DetectiveBoard } from '@/types/api';

export const detectiveBoardService = {
  /**
   * Get detective board for a case
   */
  getDetectiveBoard: async (caseId: number): Promise<DetectiveBoard> => {
    const response = await api.get<DetectiveBoard>('/detective-board/', {
      params: { case: caseId },
    });
    return response.data.results[0] || null;
  },

  /**
   * Create or update detective board
   */
  saveDetectiveBoard: async (data: {
    case: number;
    board_data: Record<string, any>;
  }): Promise<DetectiveBoard> => {
    const existing = await detectiveBoardService.getDetectiveBoard(data.case);
    if (existing) {
      const response = await api.patch<DetectiveBoard>(`/detective-board/${existing.id}/`, data);
      return response.data;
    } else {
      const response = await api.post<DetectiveBoard>('/detective-board/', data);
      return response.data;
    }
  },

  /**
   * Add connection between evidence
   */
  addConnection: async (
    boardId: number,
    data: {
      source_evidence_id: number;
      target_evidence_id: number;
      connection_type: string;
      notes?: string;
    }
  ): Promise<DetectiveBoard> => {
    const response = await api.post<DetectiveBoard>(
      `/detective-board/${boardId}/add_connection/`,
      data
    );
    return response.data;
  },

  /**
   * Propose suspect from detective board
   */
  proposeSuspect: async (
    boardId: number,
    data: {
      suspect_id?: number;
      user_id?: number;
      name?: string;
      national_id?: string;
      phone_number?: string;
    }
  ): Promise<{ message: string; suspect_id: number }> => {
    const response = await api.post<{ message: string; suspect_id: number }>(
      `/detective-board/${boardId}/propose_suspect/`,
      data
    );
    return response.data;
  },

  /**
   * Sergeant review suspect proposal
   */
  reviewSuspect: async (
    boardId: number,
    data: {
      action: 'approve' | 'reject';
      suspect_id: number;
      comments?: string;
    }
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      `/detective-board/${boardId}/review/`,
      data
    );
    return response.data;
  },
};

