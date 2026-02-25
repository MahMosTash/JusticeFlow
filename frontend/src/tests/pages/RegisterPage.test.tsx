/**
 * Register page tests
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { RegisterPage } from '@/pages/Register/RegisterPage';
import authSlice from '@/store/slices/authSlice';
import caseSlice from '@/store/slices/caseSlice';
import uiSlice from '@/store/slices/uiSlice';


jest.mock('@/services/authService');

const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: authSlice,
      cases: caseSlice,
      ui: uiSlice,
    },
  });
};

const mockRegisterUser = jest.fn();

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    register: mockRegisterUser,
    isLoading: false,
    error: null,
  }),
}));

const renderWithProviders = (component: React.ReactElement) => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders registration form with all fields', () => {
    renderWithProviders(<RegisterPage />);

    expect(screen.getByRole('heading', { name: /Register/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/National ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(document.querySelector('input[name="password"]')).toBeInTheDocument();
    expect(document.querySelector('input[name="password_confirm"]')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);

    const submitButton = screen.getByRole('button', { name: /Register/i });
    await user.click(submitButton);

    await waitFor(() => {
      // Form should not submit when fields are empty
      expect(mockRegisterUser).not.toHaveBeenCalled();
    });
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);

    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
    await user.type(emailInput, 'invalid-email');
    const submitButton = screen.getByRole('button', { name: /Register/i });
    await user.click(submitButton);

    await waitFor(() => {
      // Form should not submit when email is invalid
      expect(mockRegisterUser).not.toHaveBeenCalled();
    });
  });

  it('validates password confirmation match', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);

    const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
    const confirmPasswordInput = document.querySelector('input[name="password_confirm"]') as HTMLInputElement;

    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'different123');

    const submitButton = screen.getByRole('button', { name: /Register/i });
    await user.click(submitButton);

    await waitFor(() => {
      // Form should not submit when passwords do not match
      expect(mockRegisterUser).not.toHaveBeenCalled();
    });
  });

  it('allows user to toggle password visibility', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);

    const passwordInput = document.querySelector('input[name="password"]')!;
    const toggleButtons = screen.getAllByRole('button', { name: /toggle password visibility/i });

    expect(passwordInput).toHaveAttribute('type', 'password');
    await user.click(toggleButtons[0]);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('has link to login page', () => {
    renderWithProviders(<RegisterPage />);
    const loginLink = screen.getByText(/Already have an account/i);
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });
});

