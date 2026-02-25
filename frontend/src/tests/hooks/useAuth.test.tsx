/**
 * useAuth hook tests
 */
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import authSlice from '@/store/slices/authSlice';
import caseSlice from '@/store/slices/caseSlice';
import uiSlice from '@/store/slices/uiSlice';
import * as authService from '@/services/authService';

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

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const store = createMockStore();
  return (
    <Provider store={store}>
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  );
};

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('returns initial auth state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Initial state may be undefined or false depending on localStorage
    expect(result.current.isAuthenticated === false || result.current.isAuthenticated === undefined).toBe(true);
    expect(result.current.user === null || result.current.user === undefined).toBe(true);
    expect(result.current.token === null || result.current.token === undefined).toBe(true);
  });

  it('hasRole returns true when user has the role', () => {
    const store = createMockStore();
    store.dispatch({
      type: 'auth/setCredentials',
      payload: {
        user: {
          id: 1,
          username: 'testuser',
          roles: [{ id: 1, name: 'Detective' }],
        },
        token: 'test-token',
      },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      ),
    });

    expect(result.current.hasRole('Detective')).toBe(true);
    expect(result.current.hasRole('Sergeant')).toBe(false);
  });

  it('hasAnyRole returns true when user has any of the roles', () => {
    const store = createMockStore();
    store.dispatch({
      type: 'auth/setCredentials',
      payload: {
        user: {
          id: 1,
          username: 'testuser',
          roles: [{ id: 1, name: 'Detective' }],
        },
        token: 'test-token',
      },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      ),
    });

    expect(result.current.hasAnyRole(['Detective', 'Sergeant'])).toBe(true);
    expect(result.current.hasAnyRole(['Captain', 'Sergeant'])).toBe(false);
  });
});

