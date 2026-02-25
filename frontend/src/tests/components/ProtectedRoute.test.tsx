/**
 * Protected route tests
 */
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import authSlice from '@/store/slices/authSlice';
import caseSlice from '@/store/slices/caseSlice';
import uiSlice from '@/store/slices/uiSlice';

const createMockStore = (initialAuthState?: any) => {
  return configureStore({
    reducer: {
      auth: authSlice,
      cases: caseSlice,
      ui: uiSlice,
    },
    preloadedState: initialAuthState
      ? {
          auth: {
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            ...initialAuthState,
          },
        }
      : undefined,
  });
};

describe('ProtectedRoute', () => {
  it('redirects to login when not authenticated', () => {
    const store = createMockStore({
      isAuthenticated: false,
      user: null,
      token: null,
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      </Provider>
    );

    // Should redirect to login
    expect(window.location.pathname).toBe('/login');
  });

  it('renders children when authenticated', () => {
    const store = createMockStore({
      isAuthenticated: true,
      user: { id: 1, username: 'testuser', roles: [] },
      token: 'test-token',
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('checks role permissions when requiredRoles provided', () => {
    const store = createMockStore({
      isAuthenticated: true,
      user: {
        id: 1,
        username: 'testuser',
        roles: [{ id: 1, name: 'Detective' }],
      },
      token: 'test-token',
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <ProtectedRoute requiredRoles={['Detective']}>
            <div>Detective Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Detective Content')).toBeInTheDocument();
  });
});

