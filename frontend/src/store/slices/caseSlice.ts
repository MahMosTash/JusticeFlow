/**
 * Case slice for state management
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Case } from '@/types/api';

interface CaseState {
  cases: Case[];
  currentCase: Case | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: string;
    severity?: string;
  };
}

const initialState: CaseState = {
  cases: [],
  currentCase: null,
  isLoading: false,
  error: null,
  filters: {},
};

const caseSlice = createSlice({
  name: 'cases',
  initialState,
  reducers: {
    setCases: (state, action: PayloadAction<Case[]>) => {
      state.cases = action.payload;
    },
    addCase: (state, action: PayloadAction<Case>) => {
      state.cases.unshift(action.payload);
    },
    updateCase: (state, action: PayloadAction<Case>) => {
      const index = state.cases.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.cases[index] = action.payload;
      }
      if (state.currentCase?.id === action.payload.id) {
        state.currentCase = action.payload;
      }
    },
    setCurrentCase: (state, action: PayloadAction<Case | null>) => {
      state.currentCase = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setFilters: (state, action: PayloadAction<{ status?: string; severity?: string }>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const {
  setCases,
  addCase,
  updateCase,
  setCurrentCase,
  setLoading,
  setError,
  setFilters,
} = caseSlice.actions;
export default caseSlice.reducer;

