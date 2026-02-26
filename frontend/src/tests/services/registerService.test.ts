/**
 * Registration (sign-up) edge-case tests
 *
 * Covers: successful registration with token storage, duplicate username,
 * field-level validation errors, network failure, and no-token response
 */
import { authService, RegisterData } from '@/services/authService';
import api from '@/services/api';

jest.mock('@/services/api');

const validRegisterData: RegisterData = {
    username: 'newuser',
    email: 'newuser@example.com',
    phone_number: '09121112233',
    national_id: '1234567890',
    first_name: 'Sara',
    last_name: 'Karimi',
    password: 'StrongPass1!',
    password_confirm: 'StrongPass1!',
};

const mockRegisterResponse = {
    user: {
        id: 5,
        username: 'newuser',
        email: 'newuser@example.com',
        phone_number: '09121112233',
        national_id: '1234567890',
        first_name: 'Sara',
        last_name: 'Karimi',
        full_name: 'Sara Karimi',
        is_active: true,
        date_joined: '2024-06-10',
        last_login: null,
        roles: [{ id: 11, name: 'Basic User', description: '', is_active: true, created_at: '', updated_at: '' }],
    },
    token: 'tok_new_user_abc',
};

describe('authService.register – edge cases', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    // ─── 1: Successful registration persists token + user ──────────────
    it('stores both auth_token and user in localStorage on successful registration', async () => {
        (api.post as jest.Mock).mockResolvedValue({ data: mockRegisterResponse });

        const result = await authService.register(validRegisterData);

        expect(api.post).toHaveBeenCalledWith('/auth/users/register/', validRegisterData);
        expect(result.token).toBe('tok_new_user_abc');
        expect(localStorage.getItem('auth_token')).toBe('tok_new_user_abc');

        const storedUser = JSON.parse(localStorage.getItem('user')!);
        expect(storedUser.username).toBe('newuser');
        expect(storedUser.roles[0].name).toBe('Basic User');
    });

    // ─── 2: Duplicate username returns 400 with field error ────────────
    it('rejects with a field-level error when username is already taken', async () => {
        const duplicateError = {
            response: {
                status: 400,
                data: { username: ['A user with that username already exists.'] },
            },
        };
        (api.post as jest.Mock).mockRejectedValue(duplicateError);

        await expect(authService.register(validRegisterData)).rejects.toEqual(duplicateError);

        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
    });

    // ─── 3: Duplicate email + phone returns multiple field errors ──────
    it('rejects with multiple field errors when email and phone are already registered', async () => {
        const multiFieldError = {
            response: {
                status: 400,
                data: {
                    email: ['A user with that email already exists.'],
                    phone_number: ['A user with that phone number already exists.'],
                },
            },
        };
        (api.post as jest.Mock).mockRejectedValue(multiFieldError);

        await expect(authService.register(validRegisterData)).rejects.toEqual(multiFieldError);

        // Verify the error shape is preserved for the UI to parse
        const rejected = await authService.register(validRegisterData).catch((e) => e);
        expect(rejected.response.data).toHaveProperty('email');
        expect(rejected.response.data).toHaveProperty('phone_number');
    });

    // ─── 4: Network failure during registration ───────────────────────
    it('propagates a network error and does not modify localStorage', async () => {
        const networkError = new Error('Network Error');
        (api.post as jest.Mock).mockRejectedValue(networkError);

        await expect(authService.register(validRegisterData)).rejects.toThrow('Network Error');

        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
    });

    // ─── 5: Response without token (e.g. email verification required) ──
    it('does not store credentials when the server omits the token', async () => {
        const pendingVerification = {
            user: mockRegisterResponse.user,
            token: '',
        };
        (api.post as jest.Mock).mockResolvedValue({ data: pendingVerification });

        const result = await authService.register(validRegisterData);

        expect(result.user.username).toBe('newuser');
        expect(result.token).toBe('');
        // Empty string is falsy → service should skip storage
        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
    });
});
