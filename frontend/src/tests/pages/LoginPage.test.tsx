/**
 * Login page tests
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { LoginPage } from '@/pages/Login/LoginPage';
import authSlice from '@/store/slices/authSlice';
import caseSlice from '@/store/slices/caseSlice';
import uiSlice from '@/store/slices/uiSlice';

const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: authSlice,
      cases: caseSlice,
      ui: uiSlice,
    },
  });
};

const renderWithProviders = (component: React.ReactElement) => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe('LoginPage', () => {
  it('renders login form', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByText(/Police Case Management System/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username, Email, Phone, or National ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /Login/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Username, email, phone, or national ID is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });
  });

  it('allows user to toggle password visibility', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const passwordInput = screen.getByLabelText(/Password/i);
    // Material-UI IconButton doesn't have accessible name, so we find it by its parent
    const toggleButton = passwordInput.parentElement?.querySelector('button[type="button"]');

    expect(passwordInput).toHaveAttribute('type', 'password');
    if (toggleButton) {
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });

  it('has link to register page', () => {
    renderWithProviders(<LoginPage />);
    const registerLink = screen.getByText(/Don't have an account/i);
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
  });
});

