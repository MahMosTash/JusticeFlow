/**
 * Login edge-case tests
 *
 * Covers: different identifier types, wrong credentials, no-token response,
 * network failure, and localStorage persistence
 */
import { authService } from '@/services/authService';
import api from '@/services/api';

jest.mock('@/services/api');

const mockLoginResponse = {
    user: {
        id: 1,
        username: 'officer1',
        email: 'officer@police.ir',
        phone_number: '09121234567',
        national_id: '0012345678',
        first_name: 'Reza',
        last_name: 'Ahmadi',
        full_name: 'Reza Ahmadi',
        is_active: true,
        date_joined: '2024-01-01',
        last_login: null,
        roles: [{ id: 6, name: 'Police Officer', description: '', is_active: true, created_at: '', updated_at: '' }],
    },
    token: 'tok_abc123',
};

describe('authService.login – edge cases', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    // ─── 1: Login with email as identifier ─────────────────────────────
    it('accepts an email address as the identifier field', async () => {
        (api.post as jest.Mock).mockResolvedValue({ data: mockLoginResponse });

        const result = await authService.login({
            identifier: 'officer@police.ir',
            password: 'SecurePass1!',
        });

        expect(api.post).toHaveBeenCalledWith('/auth/users/login/', {
            identifier: 'officer@police.ir',
            password: 'SecurePass1!',
        });
        expect(result.user.email).toBe('officer@police.ir');
        expect(localStorage.getItem('auth_token')).toBe('tok_abc123');
    });

    // ─── 2: Login with wrong credentials returns 401 ──────────────────
    it('rejects with 401 when credentials are invalid and does NOT store a token', async () => {
        const error401 = {
            response: { status: 401, data: { detail: 'Invalid credentials.' } },
        };
        (api.post as jest.Mock).mockRejectedValue(error401);

        await expect(
            authService.login({ identifier: 'officer1', password: 'wrongpass' })
        ).rejects.toEqual(error401);

        // No token should have been stored
        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
    });

    // ─── 3: Backend returns response without token (deactivated user) ──
    it('does not persist anything to localStorage when the response has no token', async () => {
        const noTokenResponse = {
            user: mockLoginResponse.user,
            token: '',
        };
        (api.post as jest.Mock).mockResolvedValue({ data: noTokenResponse });

        const result = await authService.login({ identifier: 'officer1', password: 'SecurePass1!' });

        // The service checks `if (response.data.token)` – empty string is falsy
        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
        expect(result.token).toBe('');
    });

    // ─── 4: Network failure (no response object) ──────────────────────
    it('propagates a network error when the server is unreachable', async () => {
        const networkError = new Error('Network Error');
        (api.post as jest.Mock).mockRejectedValue(networkError);

        await expect(
            authService.login({ identifier: 'officer1', password: 'SecurePass1!' })
        ).rejects.toThrow('Network Error');

        expect(localStorage.getItem('auth_token')).toBeNull();
    });

    // ─── 5: Login with national_id as identifier ──────────────────────
    it('accepts a national ID as the identifier and persists user to localStorage', async () => {
        (api.post as jest.Mock).mockResolvedValue({ data: mockLoginResponse });

        await authService.login({ identifier: '0012345678', password: 'SecurePass1!' });

        expect(api.post).toHaveBeenCalledWith('/auth/users/login/', {
            identifier: '0012345678',
            password: 'SecurePass1!',
        });

        const storedUser = JSON.parse(localStorage.getItem('user')!);
        expect(storedUser.national_id).toBe('0012345678');
        expect(storedUser.roles).toHaveLength(1);
        expect(storedUser.roles[0].name).toBe('Police Officer');
    });
});
