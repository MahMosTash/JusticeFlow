/**
 * Frontend service tests for investigationService
 *
 * 10 tests covering:
 *  - Guilt score listing, creation, and edge cases (duplicate, out-of-range)
 *  - Interrogation listing and creation
 *  - Captain decision listing, creation (including Critical case flag)
 *  - Police Chief approval action
 */
import { investigationService } from '@/services/investigationService';
import api from '@/services/api';

jest.mock('@/services/api');

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------
const mockUser = {
    id: 1,
    username: 'sergeant1',
    email: 'sgt@police.ir',
    phone_number: '09121234567',
    national_id: '1234567890',
    first_name: 'Ahmad',
    last_name: 'Karimi',
    full_name: 'Ahmad Karimi',
    is_active: true,
    date_joined: '2024-01-01',
    last_login: null,
    roles: [{ id: 2, name: 'Sergeant', description: '', is_active: true, created_at: '', updated_at: '' }],
};

const buildGuiltScore = (overrides = {}) => ({
    id: 1,
    suspect: 10,
    case: 5,
    assigned_by: mockUser,
    score: 7,
    justification: 'Strong alibi failure.',
    assigned_date: '2024-06-01T10:00:00Z',
    ...overrides,
});

const buildCaptainDecision = (overrides = {}) => ({
    id: 1,
    case: 5,
    suspect: 10,
    decision: 'Approve Arrest' as const,
    comments: 'Evidence is conclusive.',
    requires_chief_approval: false,
    chief_approval: null,
    chief_approved_by: null,
    chief_approval_date: null,
    decided_at: '2024-06-02T08:00:00Z',
    decided_by: mockUser,
    ...overrides,
});

// ---------------------------------------------------------------------------

describe('investigationService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ─────────────────────────────────────────────────────────────────────────
    //  GUILT SCORES (4 tests)
    // ─────────────────────────────────────────────────────────────────────────
    describe('Guilt Scores', () => {

        it('TEST 1 — getGuiltScores returns paginated list filtered by suspect', async () => {
            const mockResponse = { count: 2, next: null, previous: null, results: [buildGuiltScore({ id: 1 }), buildGuiltScore({ id: 2, score: 9, assigned_by: { ...mockUser, username: 'detective1' } })] };
            (api.get as jest.Mock).mockResolvedValue({ data: mockResponse });

            const result = await investigationService.getGuiltScores({ suspect: 10 });

            expect(api.get).toHaveBeenCalledWith('/investigations/guilt-scores/', { params: { suspect: 10 } });
            expect(result.count).toBe(2);
            expect(result.results[0].score).toBe(7);
            expect(result.results[1].assigned_by.username).toBe('detective1');
        });

        it('TEST 2 — createGuiltScore returns the created score with assigned_by from backend', async () => {
            const created = buildGuiltScore({ score: 8, justification: 'Fingerprint match.' });
            (api.post as jest.Mock).mockResolvedValue({ data: created });

            const result = await investigationService.createGuiltScore({
                suspect: 10,
                case: 5,
                score: 8,
                justification: 'Fingerprint match.',
            });

            expect(api.post).toHaveBeenCalledWith('/investigations/guilt-scores/', {
                suspect: 10,
                case: 5,
                score: 8,
                justification: 'Fingerprint match.',
            });
            expect(result.score).toBe(8);
            expect(result.assigned_by.username).toBe('sergeant1');
        });

        it('TEST 3 — createGuiltScore propagates 400 when score is out of range', async () => {
            const validationError = {
                response: { status: 400, data: { score: ['Guilt score must be between 1 and 10.'] } },
            };
            (api.post as jest.Mock).mockRejectedValue(validationError);

            await expect(
                investigationService.createGuiltScore({ suspect: 10, case: 5, score: 11, justification: 'Too high.' })
            ).rejects.toEqual(validationError);
        });

        it('TEST 4 — createGuiltScore propagates 400 on duplicate submission (unique_together)', async () => {
            const duplicateError = {
                response: {
                    status: 400,
                    data: { non_field_errors: ['The fields suspect, assigned_by must make a unique set.'] },
                },
            };
            (api.post as jest.Mock).mockRejectedValue(duplicateError);

            await expect(
                investigationService.createGuiltScore({ suspect: 10, case: 5, score: 5, justification: 'Second attempt.' })
            ).rejects.toEqual(duplicateError);
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    //  INTERROGATIONS (2 tests)
    // ─────────────────────────────────────────────────────────────────────────
    describe('Interrogations', () => {

        it('TEST 5 — getInterrogations returns paginated list filtered by suspect and case', async () => {
            const mockInterrogation = {
                id: 1,
                suspect: 10,
                case: 5,
                interrogator: mockUser,
                interrogation_date: '2024-06-01T09:00:00Z',
                duration: '01:30:00',
                transcript: 'Suspect denied involvement.',
                notes: 'Remained calm throughout.',
            };
            const mockResponse = { count: 1, next: null, previous: null, results: [mockInterrogation] };
            (api.get as jest.Mock).mockResolvedValue({ data: mockResponse });

            const result = await investigationService.getInterrogations({ suspect: 10, case: 5 });

            expect(api.get).toHaveBeenCalledWith('/investigations/interrogations/', { params: { suspect: 10, case: 5 } });
            expect(result.count).toBe(1);
            expect(result.results[0].transcript).toBe('Suspect denied involvement.');
        });

        it('TEST 6 — createInterrogation sets interrogator from backend (not from payload)', async () => {
            const created = {
                id: 2,
                suspect: 10,
                case: 5,
                interrogator: mockUser,
                interrogation_date: '2024-06-02T11:00:00Z',
                duration: null,
                transcript: 'Suspect provided alibi.',
                notes: '',
            };
            (api.post as jest.Mock).mockResolvedValue({ data: created });

            const result = await investigationService.createInterrogation({
                suspect: 10,
                case: 5,
                transcript: 'Suspect provided alibi.',
            });

            expect(api.post).toHaveBeenCalledWith('/investigations/interrogations/', {
                suspect: 10,
                case: 5,
                transcript: 'Suspect provided alibi.',
            });
            // interrogator is set server-side to the authenticated user
            expect(result.interrogator.username).toBe('sergeant1');
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    //  CAPTAIN DECISIONS (3 tests)
    // ─────────────────────────────────────────────────────────────────────────
    describe('Captain Decisions', () => {

        it('TEST 7 — getCaptainDecisions returns list filtered by case', async () => {
            const mockResponse = { count: 1, next: null, previous: null, results: [buildCaptainDecision()] };
            (api.get as jest.Mock).mockResolvedValue({ data: mockResponse });

            const result = await investigationService.getCaptainDecisions({ case: 5 });

            expect(api.get).toHaveBeenCalledWith('/investigations/captain-decisions/', { params: { case: 5 } });
            expect(result.results[0].decision).toBe('Approve Arrest');
        });

        it('TEST 8 — createCaptainDecision returns decision for a normal case, requires_chief_approval=false', async () => {
            const created = buildCaptainDecision({ requires_chief_approval: false, chief_approval: null });
            (api.post as jest.Mock).mockResolvedValue({ data: created });

            const result = await investigationService.createCaptainDecision({
                case: 5,
                suspect: 10,
                decision: 'Approve Arrest',
                comments: 'Evidence is conclusive.',
            });

            expect(api.post).toHaveBeenCalledWith('/investigations/captain-decisions/', {
                case: 5,
                suspect: 10,
                decision: 'Approve Arrest',
                comments: 'Evidence is conclusive.',
            });
            expect(result.requires_chief_approval).toBe(false);
            expect(result.chief_approval).toBeNull();
        });

        it('TEST 9 — createCaptainDecision for Critical case returns requires_chief_approval=true', async () => {
            // The backend serializer detects Critical severity and sets the flag
            const criticalDecision = buildCaptainDecision({
                case: 99,
                requires_chief_approval: true,
                chief_approval: null,
            });
            (api.post as jest.Mock).mockResolvedValue({ data: criticalDecision });

            const result = await investigationService.createCaptainDecision({
                case: 99,
                suspect: 20,
                decision: 'Approve Arrest',
                comments: 'Critical crime — needs chief sign-off.',
            });

            expect(result.requires_chief_approval).toBe(true);
            expect(result.chief_approval).toBeNull();
        });
    });

    // ─────────────────────────────────────────────────────────────────────────
    //  POLICE CHIEF APPROVAL (1 test)
    // ─────────────────────────────────────────────────────────────────────────
    describe('Police Chief approval', () => {

        it('TEST 10 — approveChiefDecision calls approve_chief/ and returns updated decision', async () => {
            const chiefUser = { ...mockUser, id: 5, username: 'chief1', roles: [{ id: 5, name: 'Police Chief', description: '', is_active: true, created_at: '', updated_at: '' }] };
            const approved = buildCaptainDecision({
                requires_chief_approval: true,
                chief_approval: true,
                chief_approved_by: chiefUser,
                chief_approval_date: '2024-06-05T12:00:00Z',
            });
            (api.post as jest.Mock).mockResolvedValue({ data: approved });

            const result = await investigationService.approveChiefDecision(1, true);

            expect(api.post).toHaveBeenCalledWith(
                '/investigations/captain-decisions/1/approve_chief/',
                { approval: true }
            );
            expect(result.chief_approval).toBe(true);
            expect(result.chief_approved_by?.username).toBe('chief1');
            expect(result.chief_approval_date).not.toBeNull();
        });
    });
});
