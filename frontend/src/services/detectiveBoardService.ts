import api from './api';

export interface BoardData {
  nodes: any[];
  edges: any[];
}

export interface DetectiveBoard {
  id?: number;
  case: number;
  board_data: BoardData;
  last_modified?: string;
}

export interface BoardConnection {
  id?: number;
  board: number;
  source_evidence_id: number;
  target_evidence_id: number;
  connection_type: string;
  notes?: string;
}

export const detectiveBoardService = {
  async getDetectiveBoard(caseId: number): Promise<DetectiveBoard> {
    const response = await api.get(`/detective-board/?case=${caseId}`);
    const results = response.data.results ?? response.data;
    if (Array.isArray(results) && results.length > 0) return results[0];
    throw new Error('No board found');
  },

  async saveDetectiveBoard(data: DetectiveBoard): Promise<DetectiveBoard> {
    // Try to get existing board first
    try {
      const response = await api.get(`/detective-board/?case=${data.case}`);
      const results = response.data.results ?? response.data;
      if (Array.isArray(results) && results.length > 0) {
        const existing = results[0];
        const updateResponse = await api.patch(`/detective-board/${existing.id}/`, {
          board_data: data.board_data,
        });
        return updateResponse.data;
      }
    } catch {
      // Board doesn't exist, create it
    }
    const createResponse = await api.post('/detective-board/', data);
    return createResponse.data;
  },

  async addConnection(boardId: number, connection: Omit<BoardConnection, 'id' | 'board'>): Promise<any> {
    const response = await api.post(`/detective-board/${boardId}/add_connection/`, connection);
    return response.data;
  },
};
