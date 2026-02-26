/**
 * Case list page tests
 */
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { CaseListPage } from '@/pages/Cases/CaseListPage';
import authSlice from '@/store/slices/authSlice';
import caseSlice from '@/store/slices/caseSlice';
import uiSlice from '@/store/slices/uiSlice';
import * as caseService from '@/services/caseService';
import { Case, PaginatedResponse } from '@/types/api';

jest.mock('@/services/caseService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: authSlice,
      cases: caseSlice,
      ui: uiSlice,
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          phone_number: '1234567890',
          national_id: '123456789',
          first_name: 'Test',
          last_name: 'User',
          full_name: 'Test User',
          is_active: true,
          date_joined: '2024-01-01',
          last_login: null,
          roles: [{ id: 1, name: 'Police Officer', description: '', is_active: true, created_at: '', updated_at: '' }],
        },
        token: 'test-token',
        isLoading: false,
        error: null,
      },
    },
  });
};

const mockCase: Case = {
  id: 1,
  title: 'Test Case',
  description: 'Test Description',
  severity: 'Level 2',
  status: 'Open',
  created_by: {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    phone_number: '1234567890',
    national_id: '123456789',
    first_name: 'Test',
    last_name: 'User',
    full_name: 'Test User',
    is_active: true,
    date_joined: '2024-01-01',
    last_login: null,
    roles: [],
  },
  incident_date: null,
  incident_time: null,
  incident_location: null,
  assigned_detective: null,
  assigned_sergeant: null,
  resolution_date: null,
  resolution_notes: '',
  created_date: '2024-01-01',
  updated_date: '2024-01-01',
};

const renderWithProviders = (component: React.ReactElement) => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe('CaseListPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders case list page with title and create button', () => {
    (caseService.caseService.getCases as jest.Mock).mockResolvedValue({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });

    renderWithProviders(<CaseListPage />);

    expect(screen.getByText(/Cases/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Case/i })).toBeInTheDocument();
  });

  it('displays cases in table', async () => {
    const mockResponse: PaginatedResponse<Case> = {
      count: 1,
      next: null,
      previous: null,
      results: [mockCase],
    };

    (caseService.caseService.getCases as jest.Mock).mockResolvedValue(mockResponse);

    renderWithProviders(<CaseListPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Case')).toBeInTheDocument();
      expect(screen.getByText('Level 2')).toBeInTheDocument();
      expect(screen.getByText('Open')).toBeInTheDocument();
    });
  });

  it('shows empty state when no cases', async () => {
    (caseService.caseService.getCases as jest.Mock).mockResolvedValue({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });

    renderWithProviders(<CaseListPage />);

    await waitFor(() => {
      expect(screen.getByText(/No cases found/i)).toBeInTheDocument();
    });
  });


});

