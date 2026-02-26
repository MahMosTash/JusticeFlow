/**
 * Detective Board specific types (extends api.ts types)
 * These are React Flow node/edge types layered on top of existing API types
 */
import { Node, Edge } from 'reactflow';
import { Evidence, Suspect, DetectiveBoard, BoardEvidenceConnection } from './api';

// ─── React Flow Node Data Types ───────────────────────────────────────────────

export interface EvidenceNodeData {
  evidenceId: number;
  title: string;
  evidenceType: string;
  description: string;
  recordedBy: string;
  createdDate: string;
}

export interface SuspectNodeData {
  suspectId: number;
  name: string;
  nationalId: string;
  status: string;
  daysUnderInvestigation?: number;
}

export interface CaseNodeData {
  caseId: number;
  title: string;
  severity: string;
  status: string;
}

// ─── React Flow Node Types ─────────────────────────────────────────────────────

export type EvidenceFlowNode = Node<EvidenceNodeData, 'evidence'>;
export type SuspectFlowNode = Node<SuspectNodeData, 'suspect'>;
export type CaseFlowNode = Node<CaseNodeData, 'case'>;
export type BoardNode = EvidenceFlowNode | SuspectFlowNode | CaseFlowNode;
export type BoardEdge = Edge;

// ─── Board State Persisted to Django ──────────────────────────────────────────

export interface PersistedBoardData {
  nodes: BoardNode[];
  edges: BoardEdge[];
  viewport?: { x: number; y: number; zoom: number };
}

// ─── Sidebar Item (for dragging) ──────────────────────────────────────────────

export interface SidebarEvidenceItem {
  id: number;
  title: string;
  evidence_type: string;
  description: string;
  recorded_by: string;
  created_date: string;
}

export interface SidebarSuspectItem {
  id: number;
  name: string;
  national_id: string;
  status: string;
  days_under_investigation?: number;
}

// ─── Redux State ───────────────────────────────────────────────────────────────

export interface DetectiveBoardState {
  board: DetectiveBoard | null;
  nodes: BoardNode[];
  edges: BoardEdge[];
  evidenceItems: SidebarEvidenceItem[];
  suspects: SidebarSuspectItem[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  saveError: string | null;
  isDirty: boolean;
  lastSaved: string | null;
}

// ─── Proposed Suspect Payload ──────────────────────────────────────────────────

export interface ProposeSuspectPayload {
  caseId: number;
  suspectId: number;
  boardId: number;
}

export interface ConnectionPayload {
  boardId: number;
  sourceEvidenceId: number;
  targetEvidenceId: number;
  connectionType: string;
  notes?: string;
}
