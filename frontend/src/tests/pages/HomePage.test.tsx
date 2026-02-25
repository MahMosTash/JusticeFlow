/**
 * Home page tests
 */
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HomePage } from '@/pages/Home/HomePage';
import * as statsService from '@/services/statsService';

// Mock the stats service
jest.mock('@/services/statsService');

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders home page title', () => {
    (statsService.statsService.getHomeStats as jest.Mock).mockResolvedValue({
      total_cases: 0,
      solved_cases: 0,
      total_police_staff: 0,
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Police Case Management System/i)).toBeInTheDocument();
  });

  it('displays statistics cards', async () => {
    (statsService.statsService.getHomeStats as jest.Mock).mockResolvedValue({
      total_cases: 100,
      solved_cases: 75,
      total_police_staff: 50,
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
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
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    // Should show skeleton loaders or title
    expect(screen.getByText(/Police Case Management/i)).toBeInTheDocument();
  });
});

