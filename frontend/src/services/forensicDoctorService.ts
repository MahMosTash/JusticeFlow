import api from './api';
import { Evidence, EvidenceComment } from '@/types/api';

export const forensicDoctorService = {
  // Get all biological evidence (optionally filter by case)
  getBiologicalEvidence: async (caseId?: number): Promise<Evidence[]> => {
    const params: Record<string, string> = { evidence_type: 'biological' };
    if (caseId) params.case = String(caseId);
    const response = await api.get('/evidence/', { params });
    return response.data;
  },

  // Get single evidence item (includes comments)
  getEvidenceDetail: async (evidenceId: number): Promise<Evidence> => {
    const response = await api.get(`/evidence/${evidenceId}/`);
    return response.data;
  },

  // Post a comment
  addComment: async (evidenceId: number, comment: string): Promise<EvidenceComment> => {
    const response = await api.post('/evidence-comments/', {
      evidence: evidenceId,
      comment,
    });
    return response.data;
  },

  // Edit own comment
  updateComment: async (commentId: number, comment: string): Promise<EvidenceComment> => {
    const response = await api.patch(`/evidence-comments/${commentId}/`, { comment });
    return response.data;
  },

  // Delete own comment
  deleteComment: async (commentId: number): Promise<void> => {
    await api.delete(`/evidence-comments/${commentId}/`);
  },

  // Verify evidence
  verifyEvidence: async (
    evidenceId: number,
    data: { verification_notes: string; verified_by_national_id: string }
  ): Promise<Evidence> => {
    const response = await api.post(`/evidence/${evidenceId}/verify/`, data);
    return response.data;
  },
};
