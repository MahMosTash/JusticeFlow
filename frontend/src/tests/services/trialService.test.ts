/**
 * Frontend service tests for trialService
 *
 * 8 tests covering:
 *  - getTrials, getTrial, getTrialByCase
 *  - createTrial (judge-only in backend)
 *  - recordVerdict — Guilty (with punishment), Not Guilty (no punishment)
 *  - Validation errors propagated
 */
import { trialService } from '@/services/trialService';
import api from '@/services/api';

jest.mock('@/services/api');

const mockUser = {
    id: 10, username: 'judge1', email: 'judge@court.ir',
    phone_number: '09111111111', national_id: '9999999999',
    first_name: 'Test', last_name: 'Judge', full_name: 'Test Judge',
    is_active: true, date_joined: '2024-01-01', last_login: null,
    roles: [{ id: 9, name: 'Judge', description: '', is_active: true, created_at: '', updated_at: '' }],
};

const buildTrial = (overrides = {}): any => ({
    id: 1,
    case_id: 5,
    case_title: 'Bank Fraud',
    case_severity: 'Level 1',
    judge: mockUser,
    trial_date: '2024-07-01T09:00:00Z',
    verdict_date: null,
    verdict: null,
    punishment_title: '',
    punishment_description: '',
    notes: '',
    created_date: '2024-06-20T08:00:00Z',
    updated_date: '2024-06-20T08:00:00Z',
    is_complete: false,
    ...overrides,
});

describe('trialService', () => {
    beforeEach(() => jest.clearAllMocks());

    // ── getTrials ──────────────────────────────────────────────────────────────
    it('TEST 1 — getTrials returns paginated list filtered by case', async () => {
        const mockResp = { count: 1, next: null, previous: null, results: [buildTrial()] };
        (api.get as jest.Mock).mockResolvedValue({ data: mockResp });

        const result = await trialService.getTrials({ case: 5 });

        expect(api.get).toHaveBeenCalledWith('/trials/', { params: { case: 5 } });
        expect(result.count).toBe(1);
        expect(result.results[0].case_title).toBe('Bank Fraud');
    });

    // ── getTrial ───────────────────────────────────────────────────────────────
    it('TEST 2 — getTrial returns full dossier for a single trial', async () => {
        const full = buildTrial({ case: { id: 5, title: 'Bank Fraud', suspects: [], guilt_scores: [] } });
        (api.get as jest.Mock).mockResolvedValue({ data: full });

        const result = await trialService.getTrial(1);

        expect(api.get).toHaveBeenCalledWith('/trials/1/');
        expect((result.case as any).suspects).toBeDefined();
    });

    // ── getTrialByCase ─────────────────────────────────────────────────────────
    it('TEST 3 — getTrialByCase returns first result or null', async () => {
        (api.get as jest.Mock).mockResolvedValue({ data: { count: 1, results: [buildTrial()] } });
        const result = await trialService.getTrialByCase(5);
        expect(result).not.toBeNull();
        expect(result!.id).toBe(1);
    });

    it('TEST 4 — getTrialByCase returns null when no trial exists for case', async () => {
        (api.get as jest.Mock).mockResolvedValue({ data: { count: 0, results: [] } });
        const result = await trialService.getTrialByCase(99);
        expect(result).toBeNull();
    });

    // ── createTrial ────────────────────────────────────────────────────────────
    it('TEST 5 — createTrial posts to /trials/ and returns created trial', async () => {
        const created = buildTrial({ notes: 'Opening session.' });
        (api.post as jest.Mock).mockResolvedValue({ data: created });

        const result = await trialService.createTrial({ case: 5, notes: 'Opening session.' });

        expect(api.post).toHaveBeenCalledWith('/trials/', { case: 5, notes: 'Opening session.' });
        expect(result.is_complete).toBe(false);
    });

    // ── recordVerdict — Guilty ─────────────────────────────────────────────────
    it('TEST 6 — recordVerdict (Guilty) posts correct payload and returns complete trial', async () => {
        const completed = buildTrial({
            verdict: 'Guilty',
            punishment_title: '5 Years',
            punishment_description: 'Convicted of fraud.',
            verdict_date: '2024-07-10T14:00:00Z',
            is_complete: true,
        });
        (api.post as jest.Mock).mockResolvedValue({ data: completed });

        const result = await trialService.recordVerdict(1, {
            verdict: 'Guilty',
            punishment_title: '5 Years',
            punishment_description: 'Convicted of fraud.',
        });

        expect(api.post).toHaveBeenCalledWith('/trials/1/record_verdict/', {
            verdict: 'Guilty',
            punishment_title: '5 Years',
            punishment_description: 'Convicted of fraud.',
        });
        expect(result.verdict).toBe('Guilty');
        expect(result.is_complete).toBe(true);
    });

    // ── recordVerdict — Not Guilty ─────────────────────────────────────────────
    it('TEST 7 — recordVerdict (Not Guilty) requires no punishment', async () => {
        const completed = buildTrial({
            verdict: 'Not Guilty',
            verdict_date: '2024-07-10T14:00:00Z',
            is_complete: true,
        });
        (api.post as jest.Mock).mockResolvedValue({ data: completed });

        const result = await trialService.recordVerdict(1, { verdict: 'Not Guilty' });

        expect(result.verdict).toBe('Not Guilty');
        expect(result.punishment_title).toBe('');
    });

    // ── Validation error propagated ────────────────────────────────────────────
    it('TEST 8 — recordVerdict propagates 400 when Guilty verdict has no punishment', async () => {
        const err = {
            response: {
                status: 400,
                data: { non_field_errors: ['Punishment title and description are required for guilty verdict.'] },
            },
        };
        (api.post as jest.Mock).mockRejectedValue(err);

        await expect(
            trialService.recordVerdict(1, { verdict: 'Guilty' })
        ).rejects.toEqual(err);
    });
});
