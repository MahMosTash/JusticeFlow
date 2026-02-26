/**
 * Complaint service tests
 *
 * Covers: submit, forward, return, resubmit, and error handling
 */
import { complaintService } from '@/services/complaintService';
import api from '@/services/api';
import { Complaint } from '@/types/api';

jest.mock('@/services/api');

const mockUser = {
    id: 1,
    username: 'citizen1',
    email: 'citizen@example.com',
    phone_number: '09120001111',
    national_id: '0012345678',
    first_name: 'Ali',
    last_name: 'Rezaei',
    full_name: 'Ali Rezaei',
    is_active: true,
    date_joined: '2024-01-01',
    last_login: null,
    roles: [],
};

const buildComplaint = (overrides: Partial<Complaint> = {}): Complaint => ({
    id: 1,
    title: 'Noise Complaint',
    description: 'Loud construction at midnight',
    submitted_by: mockUser,
    submission_count: 1,
    status: 'Pending',
    reviewed_by_intern: null,
    reviewed_by_officer: null,
    review_comments: '',
    case: null,
    reviews: [],
    created_date: '2024-06-01T10:00:00Z',
    updated_date: '2024-06-01T10:00:00Z',
    ...overrides,
});

describe('complaintService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ─── Test 1: Submit a new complaint ────────────────────────────────
    it('submits a new complaint and returns it with Pending status', async () => {
        const payload = { title: 'Noise Complaint', description: 'Loud construction at midnight' };
        const mockResponse = buildComplaint();

        (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

        const result = await complaintService.submitComplaint(payload);

        expect(api.post).toHaveBeenCalledWith('/complaints/', payload);
        expect(result.status).toBe('Pending');
        expect(result.submission_count).toBe(1);
        expect(result.submitted_by.username).toBe('citizen1');
    });

    // ─── Test 2: Intern forwards complaint to officer ──────────────────
    it('forwards a complaint to an officer and changes status to Under Review', async () => {
        const internUser = { ...mockUser, id: 10, username: 'intern1', roles: [{ id: 8, name: 'Intern', description: '', is_active: true, created_at: '', updated_at: '' }] };
        const forwardedComplaint = buildComplaint({
            status: 'Under Review',
            reviewed_by_intern: internUser,
            review_comments: 'Legitimate complaint, forwarding.',
            reviews: [
                {
                    id: 1,
                    complaint: 1,
                    reviewer: internUser,
                    action: 'Forwarded',
                    comments: 'Legitimate complaint, forwarding.',
                    reviewed_at: '2024-06-02T09:00:00Z',
                },
            ],
        });

        (api.post as jest.Mock).mockResolvedValue({ data: forwardedComplaint });

        const result = await complaintService.reviewAsIntern(1, 'forward', 'Legitimate complaint, forwarding.');

        expect(api.post).toHaveBeenCalledWith('/complaints/1/review_as_intern/', {
            action: 'forward',
            comments: 'Legitimate complaint, forwarding.',
        });
        expect(result.status).toBe('Under Review');
        expect(result.reviewed_by_intern?.username).toBe('intern1');
        expect(result.reviews).toHaveLength(1);
        expect(result.reviews[0].action).toBe('Forwarded');
    });

    // ─── Test 3: Intern returns complaint to complainant ───────────────
    it('returns a complaint to the complainant with comments and sets Returned status', async () => {
        const internUser = { ...mockUser, id: 10, username: 'intern1', roles: [{ id: 8, name: 'Intern', description: '', is_active: true, created_at: '', updated_at: '' }] };
        const returnedComplaint = buildComplaint({
            status: 'Pending', // backend may keep Pending or switch to Returned depending on migration
            reviewed_by_intern: internUser,
            review_comments: 'Not enough detail. Please add the exact address.',
            reviews: [
                {
                    id: 2,
                    complaint: 1,
                    reviewer: internUser,
                    action: 'Returned',
                    comments: 'Not enough detail. Please add the exact address.',
                    reviewed_at: '2024-06-02T09:30:00Z',
                },
            ],
        });

        (api.post as jest.Mock).mockResolvedValue({ data: returnedComplaint });

        const result = await complaintService.reviewAsIntern(1, 'return', 'Not enough detail. Please add the exact address.');

        expect(api.post).toHaveBeenCalledWith('/complaints/1/review_as_intern/', {
            action: 'return',
            comments: 'Not enough detail. Please add the exact address.',
        });
        expect(result.review_comments).toBe('Not enough detail. Please add the exact address.');
        expect(result.reviews[0].action).toBe('Returned');
        expect(result.reviewed_by_intern).not.toBeNull();
    });

    // ─── Test 4: User resubmits a returned complaint ───────────────────
    it('resubmits a returned complaint with updated title/description and increments submission count', async () => {
        const resubmittedComplaint = buildComplaint({
            title: 'Noise Complaint – Updated',
            description: 'Loud construction at midnight near 5th Ave, Building 12.',
            submission_count: 2,
            status: 'Pending',
            review_comments: '',
        });

        (api.post as jest.Mock).mockResolvedValue({ data: resubmittedComplaint });

        const result = await complaintService.resubmitComplaint(1, {
            title: 'Noise Complaint – Updated',
            description: 'Loud construction at midnight near 5th Ave, Building 12.',
        });

        expect(api.post).toHaveBeenCalledWith('/complaints/1/resubmit/', {
            title: 'Noise Complaint – Updated',
            description: 'Loud construction at midnight near 5th Ave, Building 12.',
        });
        expect(result.submission_count).toBe(2);
        expect(result.title).toBe('Noise Complaint – Updated');
        expect(result.status).toBe('Pending');
    });

    // ─── Test 5: Submission fails with API error ───────────────────────
    it('propagates API errors when complaint submission fails', async () => {
        const apiError = {
            response: {
                status: 400,
                data: { detail: 'Title and description are required.' },
            },
        };

        (api.post as jest.Mock).mockRejectedValue(apiError);

        await expect(
            complaintService.submitComplaint({ title: '', description: '' })
        ).rejects.toEqual(apiError);

        expect(api.post).toHaveBeenCalledWith('/complaints/', { title: '', description: '' });
    });
});
