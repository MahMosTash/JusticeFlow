/**
 * Case creation service tests — 4 edge-case tests
 *
 * Covers: successful creation, critical severity, validation failure,
 * and default status.
 */
import { caseService } from '@/services/caseService';
import api from '@/services/api';
import { Case } from '@/types/api';

jest.mock('@/services/api');

const mockUser = {
    id: 1,
    username: 'officer1',
    email: 'officer@police.ir',
    phone_number: '09121234567',
    national_id: '1234567890',
    first_name: 'Reza',
    last_name: 'Ahmadi',
    full_name: 'Reza Ahmadi',
    is_active: true,
    date_joined: '2024-01-01',
    last_login: null,
    roles: [{ id: 6, name: 'Police Officer', description: '', is_active: true, created_at: '', updated_at: '' }],
};

const buildCase = (overrides: Partial<Case> = {}): Case => ({
    id: 1,
    title: 'Test Case',
    description: 'Test description',
    severity: 'Level 3',
    status: 'Open',
    created_by: mockUser,
    incident_date: null,
    incident_time: null,
    incident_location: null,
    assigned_detective: null,
    assigned_sergeant: null,
    resolution_date: null,
    resolution_notes: '',
    created_date: '2024-06-01T10:00:00Z',
    updated_date: '2024-06-01T10:00:00Z',
    ...overrides,
});

describe('caseService – case creation edge cases', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ─── 1: Create case with all required fields ──────────────────────
    it('creates a case with title, description, and severity, returning Open status', async () => {
        const payload = { title: 'Robbery at Market', description: 'Armed robbery report', severity: 'Level 2' as const };
        const mockResponse = buildCase({ ...payload, id: 10 });
        (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

        const result = await caseService.createCase(payload);

        expect(api.post).toHaveBeenCalledWith('/cases/', payload);
        expect(result.title).toBe('Robbery at Market');
        expect(result.severity).toBe('Level 2');
        expect(result.status).toBe('Open');
    });

    // ─── 2: Create case with Critical severity ────────────────────────
    it('creates a Critical severity case that requires chief approval', async () => {
        const payload = { title: 'Terrorism Threat', description: 'Bomb threat at station', severity: 'Critical' as const };
        const mockResponse = buildCase({ ...payload, id: 11 });
        (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

        const result = await caseService.createCase(payload);

        expect(result.severity).toBe('Critical');
        // Backend model method requires_chief_approval() returns true for Critical
        expect(result.status).toBe('Open');
    });

    // ─── 3: API error when required fields are missing ─────────────────
    it('rejects case creation when title or description is missing', async () => {
        const validationError = {
            response: {
                status: 400,
                data: {
                    title: ['This field is required.'],
                    description: ['This field is required.'],
                },
            },
        };
        (api.post as jest.Mock).mockRejectedValue(validationError);

        await expect(
            caseService.createCase({ severity: 'Level 3' })
        ).rejects.toEqual(validationError);

        expect(api.post).toHaveBeenCalledWith('/cases/', { severity: 'Level 3' });
    });

    // ─── 4: Default status is Open, no detective/sergeant assigned ─────
    it('returns case with default Open status and null assignments', async () => {
        const mockResponse = buildCase({ id: 12, title: 'Petty Theft', severity: 'Level 3' });
        (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

        const result = await caseService.createCase({
            title: 'Petty Theft',
            description: 'Stolen wallet',
            severity: 'Level 3',
        });

        expect(result.status).toBe('Open');
        expect(result.assigned_detective).toBeNull();
        expect(result.assigned_sergeant).toBeNull();
        expect(result.resolution_date).toBeNull();
        expect(result.incident_date).toBeNull();
    });
});
