/**
 * Auth service tests
 */
import { authService } from '@/services/authService';
import api from '@/services/api';

jest.mock('@/services/api');

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('register', () => {
    it('registers user and stores token', async () => {
      const mockResponse = {
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          roles: [],
        },
        token: 'test-token',
      };

      (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const registerData = {
        username: 'testuser',
        email: 'test@example.com',
        phone_number: '1234567890',
        national_id: '123456789',
        first_name: 'Test',
        last_name: 'User',
        password: 'password123',
        password_confirm: 'password123',
      };

      const result = await authService.register(registerData);

      expect(api.post).toHaveBeenCalledWith('/auth/users/register/', registerData);
      expect(result).toEqual(mockResponse);
      expect(localStorage.getItem('auth_token')).toBe('test-token');
      expect(localStorage.getItem('user')).toBeTruthy();
    });
  });

  describe('login', () => {
    it('logs in user and stores token', async () => {
      const mockResponse = {
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          roles: [],
        },
        token: 'test-token',
      };

      (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const loginData = {
        identifier: 'testuser',
        password: 'password123',
      };

      const result = await authService.login(loginData);

      expect(api.post).toHaveBeenCalledWith('/auth/users/login/', loginData);
      expect(result).toEqual(mockResponse);
      expect(localStorage.getItem('auth_token')).toBe('test-token');
    });
  });

  describe('logout', () => {
    it('clears stored authentication data', () => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('user', '{"id": 1}');

      authService.logout();

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('fetches current user and updates localStorage', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        roles: [],
      };

      (api.get as jest.Mock).mockResolvedValue({ data: mockUser });

      const result = await authService.getCurrentUser();

      expect(api.get).toHaveBeenCalledWith('/auth/users/me/');
      expect(result).toEqual(mockUser);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
    });
  });

  describe('isAuthenticated', () => {
    it('returns true when token exists', () => {
      localStorage.setItem('auth_token', 'test-token');
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('returns false when token does not exist', () => {
      localStorage.removeItem('auth_token');
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('getStoredUser', () => {
    it('returns stored user from localStorage', () => {
      const mockUser = { id: 1, username: 'testuser' };
      localStorage.setItem('user', JSON.stringify(mockUser));

      const result = authService.getStoredUser();

      expect(result).toEqual(mockUser);
    });

    it('returns null when no user stored', () => {
      localStorage.removeItem('user');
      expect(authService.getStoredUser()).toBeNull();
    });

    it('handles invalid JSON gracefully', () => {
      localStorage.setItem('user', 'invalid-json');
      expect(authService.getStoredUser()).toBeNull();
    });
  });
});

