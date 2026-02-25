/**
 * Authentication hook
 */
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials, clearCredentials, setUser } from '@/store/slices/authSlice';
import { authService } from '@/services/authService';
import { User } from '@/types/api';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Sync with localStorage on mount
    const storedUser = authService.getStoredUser();
    const storedToken = authService.getToken();
    if (storedUser && storedToken && !user) {
      dispatch(setCredentials({ user: storedUser, token: storedToken }));
    }
  }, [dispatch, user]);

  const login = async (identifier: string, password: string) => {
    try {
      const response = await authService.login({ identifier, password });
      dispatch(setCredentials({ user: response.user, token: response.token }));
      return response;
    } catch (err: any) {
      throw err;
    }
  };

  const register = async (data: {
    username: string;
    email: string;
    phone_number: string;
    national_id: string;
    first_name: string;
    last_name: string;
    password: string;
    password_confirm: string;
  }) => {
    try {
      const response = await authService.register(data);
      dispatch(setCredentials({ user: response.user, token: response.token }));
      return response;
    } catch (err: any) {
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    dispatch(clearCredentials());
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      const updatedUser = await authService.updateCurrentUser(data);
      dispatch(setUser(updatedUser));
      return updatedUser;
    } catch (err: any) {
      throw err;
    }
  };

  const hasRole = (roleName: string): boolean => {
    if (!user) return false;
    return user.roles.some((role) => role.name === roleName);
  };

  const hasAnyRole = (roleNames: string[]): boolean => {
    if (!user) return false;
    return user.roles.some((role) => roleNames.includes(role.name));
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    hasAnyRole,
  };
};

