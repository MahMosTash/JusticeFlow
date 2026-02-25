/**
 * Home page tests
 */
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authSlice from '@/store/slices/authSlice';
import caseSlice from '@/store/slices/caseSlice';
import uiSlice from '@/store/slices/uiSlice';
import { HomePage } from '@/pages/Home/HomePage';
import * as statsService from '@/services/statsService';

// Mock the stats service
jest.mock('@/services/statsService');

const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: authSlice,
      cases: caseSlice,
      ui: uiSlice,
    },
  });
};

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders home page title', async () => {
    (statsService.statsService.getHomeStats as jest.Mock).mockResolvedValue({
      total_cases: 0,
      solved_cases: 0,
      total_police_staff: 0,
    });

    render(
      <Provider store={createMockStore()}>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </Provider>
    );

    expect(await screen.findByText(/Dashboard/i)).toBeInTheDocument();
  });

  it('displays statistics cards', async () => {
    (statsService.statsService.getHomeStats as jest.Mock).mockResolvedValue({
      total_cases: 100,
      solved_cases: 75,
      total_police_staff: 50,
    });

    render(
      <Provider store={createMockStore()}>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText(/Total Cases/i)).toBeInTheDocument();
      expect(screen.getByText(/Solved Cases/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Police Staff/i)).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    (statsService.statsService.getHomeStats as jest.Mock).mockImplementation(
      () => new Promise(() => { }) // Never resolves
    );

    render(
      <Provider store={createMockStore()}>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </Provider>
    );

    // Should show skeleton loaders
    expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
  });
});

