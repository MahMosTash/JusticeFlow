/**
 * Evidence service tests — 4 tests per evidence type (20 total)
 *
 * Covers all 5 types: witness_statement, biological, vehicle,
 * identification, other — with validation & edge cases.
 */
import { evidenceService } from '@/services/evidenceService';
import api from '@/services/api';
import { Evidence } from '@/types/api';

jest.mock('@/services/api');

const mockUser = {
    id: 1,
    username: 'detective1',
    email: 'det@police.ir',
    phone_number: '09121234567',
    national_id: '1234567890',
    first_name: 'Ali',
    last_name: 'Karimi',
    full_name: 'Ali Karimi',
    is_active: true,
    date_joined: '2024-01-01',
    last_login: null,
    roles: [],
};

const buildEvidence = (overrides: Partial<Evidence> = {}): Evidence => ({
    id: 1,
    title: 'Test Evidence',
    description: 'Test description',
    evidence_type: 'other',
    case: 1,
    recorded_by: mockUser,
    created_date: '2024-06-01T10:00:00Z',
    ...overrides,
});

describe('evidenceService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ═══════════════════════════════════════════════════════════════════
    //  WITNESS STATEMENT (4 tests)
    // ═══════════════════════════════════════════════════════════════════
    describe('Witness Statement evidence', () => {
        it('creates witness statement with transcript, name, and phone', async () => {
            const mockResponse = buildEvidence({
                evidence_type: 'witness_statement',
                title: 'Eyewitness Account',
                transcript: 'I saw the suspect at 10pm.',
                witness_name: 'Hassan Moradi',
                witness_phone: '09129998877',
            });

            (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

            const formData = new FormData();
            formData.append('title', 'Eyewitness Account');
            formData.append('description', 'Witness near the scene');
            formData.append('evidence_type', 'witness_statement');
            formData.append('case', '1');
            formData.append('transcript', 'I saw the suspect at 10pm.');
            formData.append('witness_name', 'Hassan Moradi');
            formData.append('witness_phone', '09129998877');

            const result = await evidenceService.createEvidence(formData);

            expect(api.post).toHaveBeenCalledWith('/evidence/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            expect(result.evidence_type).toBe('witness_statement');
            expect(result.transcript).toBe('I saw the suspect at 10pm.');
        });

        it('rejects witness statement when transcript is missing', async () => {
            const validationError = {
                response: {
                    status: 400,
                    data: { transcript: ['Transcript is required for witness statements.'] },
                },
            };
            (api.post as jest.Mock).mockRejectedValue(validationError);

            const formData = new FormData();
            formData.append('title', 'Missing Transcript');
            formData.append('description', 'desc');
            formData.append('evidence_type', 'witness_statement');
            formData.append('case', '1');

            await expect(evidenceService.createEvidence(formData)).rejects.toEqual(validationError);
        });

        it('creates witness statement with optional media file fields', async () => {
            const mockResponse = buildEvidence({
                evidence_type: 'witness_statement',
                transcript: 'Testimony recorded on camera.',
                image: '/media/evidence/witness_statements/images/photo.jpg',
                video: '/media/evidence/witness_statements/videos/clip.mp4',
                audio: '/media/evidence/witness_statements/audio/rec.mp3',
            });

            (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

            const formData = new FormData();
            formData.append('evidence_type', 'witness_statement');
            formData.append('title', 'Full media statement');
            formData.append('description', 'desc');
            formData.append('case', '1');
            formData.append('transcript', 'Testimony recorded on camera.');

            const result = await evidenceService.createEvidence(formData);

            expect(result.image).toContain('photo.jpg');
            expect(result.video).toContain('clip.mp4');
            expect(result.audio).toContain('rec.mp3');
        });

        it('returns evidence_type as witness_statement in the response', async () => {
            const mockResponse = buildEvidence({
                evidence_type: 'witness_statement',
                transcript: 'saw a car.',
                witness_national_id: '1122334455',
            });
            (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

            const formData = new FormData();
            formData.append('evidence_type', 'witness_statement');
            formData.append('title', 't');
            formData.append('description', 'd');
            formData.append('case', '1');
            formData.append('transcript', 'saw a car.');
            formData.append('witness_national_id', '1122334455');

            const result = await evidenceService.createEvidence(formData);
            expect(result.evidence_type).toBe('witness_statement');
            expect(result.witness_national_id).toBe('1122334455');
        });
    });

    // ═══════════════════════════════════════════════════════════════════
    //  BIOLOGICAL / MEDICAL (4 tests)
    // ═══════════════════════════════════════════════════════════════════
    describe('Biological / Medical evidence', () => {
        it('creates biological evidence with image1 and evidence_category', async () => {
            const mockResponse = buildEvidence({
                evidence_type: 'biological',
                title: 'Blood Sample',
                evidence_category: 'blood',
                image1: '/media/evidence/biological/images/blood_sample.jpg',
            });
            (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

            const formData = new FormData();
            formData.append('evidence_type', 'biological');
            formData.append('title', 'Blood Sample');
            formData.append('description', 'Found at scene');
            formData.append('case', '1');
            formData.append('evidence_category', 'blood');

            const result = await evidenceService.createEvidence(formData);

            expect(result.evidence_type).toBe('biological');
            expect(result.evidence_category).toBe('blood');
            expect(result.image1).toContain('blood_sample');
        });

        it('rejects biological evidence when image1 is missing', async () => {
            const validationError = {
                response: {
                    status: 400,
                    data: { image1: ['At least one image is required for biological evidence.'] },
                },
            };
            (api.post as jest.Mock).mockRejectedValue(validationError);

            const formData = new FormData();
            formData.append('evidence_type', 'biological');
            formData.append('title', 'No Image');
            formData.append('description', 'desc');
            formData.append('case', '1');

            await expect(evidenceService.createEvidence(formData)).rejects.toEqual(validationError);
        });

        it('verifies biological evidence via the /verify/ endpoint', async () => {
            const verifiedResponse = buildEvidence({
                evidence_type: 'biological',
                verified_by_forensic_doctor: mockUser,
                verification_date: '2024-06-05T14:00:00Z',
                verification_notes: 'Blood type matches suspect.',
            });
            (api.post as jest.Mock).mockResolvedValue({ data: verifiedResponse });

            const result = await evidenceService.verifyEvidence(1, {
                verified_by_national_id: '1234567890',
                verification_notes: 'Blood type matches suspect.',
            });

            expect(api.post).toHaveBeenCalledWith('/evidence/1/verify/', {
                verified_by_national_id: '1234567890',
                verification_notes: 'Blood type matches suspect.',
            });
            expect(result.verified_by_forensic_doctor).not.toBeNull();
            expect(result.verification_date).toBeTruthy();
        });

        it('rejects verification of already-verified biological evidence', async () => {
            const alreadyVerifiedError = {
                response: {
                    status: 400,
                    data: { error: 'Evidence is already verified' },
                },
            };
            (api.post as jest.Mock).mockRejectedValue(alreadyVerifiedError);

            await expect(
                evidenceService.verifyEvidence(1, { verification_notes: 'duplicate' })
            ).rejects.toEqual(alreadyVerifiedError);
        });
    });

    // ═══════════════════════════════════════════════════════════════════
    //  VEHICLE (4 tests)
    // ═══════════════════════════════════════════════════════════════════
    describe('Vehicle evidence', () => {
        it('creates vehicle evidence with license_plate, model, and color', async () => {
            const mockResponse = buildEvidence({
                evidence_type: 'vehicle',
                title: 'Suspect Vehicle',
                model: 'Peugeot 206',
                color: 'White',
                license_plate: '22-B-456-78',
            });
            (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

            const formData = new FormData();
            formData.append('evidence_type', 'vehicle');
            formData.append('title', 'Suspect Vehicle');
            formData.append('description', 'Seen leaving the scene');
            formData.append('case', '1');
            formData.append('model', 'Peugeot 206');
            formData.append('color', 'White');
            formData.append('license_plate', '22-B-456-78');

            const result = await evidenceService.createEvidence(formData);

            expect(result.evidence_type).toBe('vehicle');
            expect(result.license_plate).toBe('22-B-456-78');
            expect(result.serial_number).toBeUndefined();
        });

        it('creates vehicle evidence with serial_number when no license plate', async () => {
            const mockResponse = buildEvidence({
                evidence_type: 'vehicle',
                title: 'Unplated Motorcycle',
                model: 'Honda CG125',
                color: 'Red',
                serial_number: 'SN-9887766',
                license_plate: '',
            });
            (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

            const formData = new FormData();
            formData.append('evidence_type', 'vehicle');
            formData.append('title', 'Unplated Motorcycle');
            formData.append('description', 'No plate');
            formData.append('case', '1');
            formData.append('model', 'Honda CG125');
            formData.append('color', 'Red');
            formData.append('serial_number', 'SN-9887766');

            const result = await evidenceService.createEvidence(formData);

            expect(result.serial_number).toBe('SN-9887766');
            expect(result.license_plate).toBe('');
        });

        it('rejects vehicle with both license_plate AND serial_number', async () => {
            const validationError = {
                response: {
                    status: 400,
                    data: { non_field_errors: ['Cannot have both license_plate and serial_number.'] },
                },
            };
            (api.post as jest.Mock).mockRejectedValue(validationError);

            const formData = new FormData();
            formData.append('evidence_type', 'vehicle');
            formData.append('title', 'Both IDs');
            formData.append('description', 'desc');
            formData.append('case', '1');
            formData.append('model', 'Toyota Camry');
            formData.append('color', 'Black');
            formData.append('license_plate', '11-A-111-11');
            formData.append('serial_number', 'SN-1234');

            await expect(evidenceService.createEvidence(formData)).rejects.toEqual(validationError);
        });

        it('rejects vehicle with neither license_plate nor serial_number', async () => {
            const validationError = {
                response: {
                    status: 400,
                    data: { non_field_errors: ['Must have either license_plate or serial_number.'] },
                },
            };
            (api.post as jest.Mock).mockRejectedValue(validationError);

            const formData = new FormData();
            formData.append('evidence_type', 'vehicle');
            formData.append('title', 'No ID');
            formData.append('description', 'desc');
            formData.append('case', '1');
            formData.append('model', 'Saipa Pride');
            formData.append('color', 'Silver');

            await expect(evidenceService.createEvidence(formData)).rejects.toEqual(validationError);
        });
    });

    // ═══════════════════════════════════════════════════════════════════
    //  IDENTIFICATION DOCUMENT (4 tests)
    // ═══════════════════════════════════════════════════════════════════
    describe('Identification Document evidence', () => {
        it('creates identification evidence with full_name and metadata', async () => {
            const mockResponse = buildEvidence({
                evidence_type: 'identification',
                title: 'Suspect ID Card',
                full_name: 'Mohammad Hosseini',
                metadata: { card_type: 'National ID', issue_date: '2020-03-01' },
            });
            (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

            const formData = new FormData();
            formData.append('evidence_type', 'identification');
            formData.append('title', 'Suspect ID Card');
            formData.append('description', 'Found on suspect');
            formData.append('case', '1');
            formData.append('full_name', 'Mohammad Hosseini');
            formData.append('metadata', JSON.stringify({ card_type: 'National ID', issue_date: '2020-03-01' }));

            const result = await evidenceService.createEvidence(formData);

            expect(result.evidence_type).toBe('identification');
            expect(result.full_name).toBe('Mohammad Hosseini');
            expect(result.metadata).toHaveProperty('card_type', 'National ID');
        });

        it('rejects identification evidence when full_name is missing', async () => {
            const validationError = {
                response: {
                    status: 400,
                    data: { full_name: ['Full name is required for identification documents.'] },
                },
            };
            (api.post as jest.Mock).mockRejectedValue(validationError);

            const formData = new FormData();
            formData.append('evidence_type', 'identification');
            formData.append('title', 'No Name Card');
            formData.append('description', 'desc');
            formData.append('case', '1');

            await expect(evidenceService.createEvidence(formData)).rejects.toEqual(validationError);
        });

        it('accepts identification evidence with empty metadata', async () => {
            const mockResponse = buildEvidence({
                evidence_type: 'identification',
                full_name: 'Sara Karimzadeh',
                metadata: {},
            });
            (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

            const formData = new FormData();
            formData.append('evidence_type', 'identification');
            formData.append('title', 'Minimal ID');
            formData.append('description', 'Only name on card');
            formData.append('case', '1');
            formData.append('full_name', 'Sara Karimzadeh');

            const result = await evidenceService.createEvidence(formData);

            expect(result.full_name).toBe('Sara Karimzadeh');
            expect(result.metadata).toEqual({});
        });

        it('accepts identification evidence with complex nested metadata', async () => {
            const complexMetadata = {
                card_type: 'Passport',
                passport_number: 'A12345678',
                addresses: ['Tehran', 'Isfahan'],
            };
            const mockResponse = buildEvidence({
                evidence_type: 'identification',
                full_name: 'Reza Shahi',
                metadata: complexMetadata,
            });
            (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

            const formData = new FormData();
            formData.append('evidence_type', 'identification');
            formData.append('title', 'Passport');
            formData.append('description', 'Found passport');
            formData.append('case', '1');
            formData.append('full_name', 'Reza Shahi');
            formData.append('metadata', JSON.stringify(complexMetadata));

            const result = await evidenceService.createEvidence(formData);

            expect(result.metadata).toEqual(complexMetadata);
            expect((result.metadata as any).addresses).toHaveLength(2);
        });
    });

    // ═══════════════════════════════════════════════════════════════════
    //  OTHER (4 tests)
    // ═══════════════════════════════════════════════════════════════════
    describe('Other evidence', () => {
        it('creates other evidence with only title and description', async () => {
            const mockResponse = buildEvidence({
                evidence_type: 'other',
                title: 'Anonymous Tip Note',
                description: 'A handwritten note left at the station.',
            });
            (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

            const formData = new FormData();
            formData.append('evidence_type', 'other');
            formData.append('title', 'Anonymous Tip Note');
            formData.append('description', 'A handwritten note left at the station.');
            formData.append('case', '1');

            const result = await evidenceService.createEvidence(formData);

            expect(result.evidence_type).toBe('other');
            expect(result.title).toBe('Anonymous Tip Note');
        });

        it('confirms evidence_type is other in the response', async () => {
            const mockResponse = buildEvidence({ evidence_type: 'other' });
            (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

            const formData = new FormData();
            formData.append('evidence_type', 'other');
            formData.append('title', 't');
            formData.append('description', 'd');
            formData.append('case', '1');

            const result = await evidenceService.createEvidence(formData);
            expect(result.evidence_type).toBe('other');
        });

        it('updates existing other evidence via PATCH', async () => {
            const updatedEvidence = buildEvidence({
                id: 5,
                evidence_type: 'other',
                title: 'Updated Tip',
                description: 'Updated description with more detail.',
            });
            (api.patch as jest.Mock).mockResolvedValue({ data: updatedEvidence });

            const result = await evidenceService.updateEvidence(5, {
                title: 'Updated Tip',
                description: 'Updated description with more detail.',
            });

            expect(api.patch).toHaveBeenCalledWith('/evidence/5/', {
                title: 'Updated Tip',
                description: 'Updated description with more detail.',
            }, { headers: {} });
            expect(result.title).toBe('Updated Tip');
        });

        it('propagates API errors on failed evidence creation', async () => {
            const serverError = {
                response: { status: 500, data: { detail: 'Internal server error' } },
            };
            (api.post as jest.Mock).mockRejectedValue(serverError);

            const formData = new FormData();
            formData.append('evidence_type', 'other');
            formData.append('title', 't');
            formData.append('description', 'd');
            formData.append('case', '1');

            await expect(evidenceService.createEvidence(formData)).rejects.toEqual(serverError);
        });
    });
});
