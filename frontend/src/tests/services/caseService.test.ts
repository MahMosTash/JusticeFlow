/**
 * Case service tests
 */
import { caseService } from '@/services/caseService';
import api from '@/services/api';
import { Case, PaginatedResponse } from '@/types/api';

jest.mock('@/services/api');

describe('caseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getCases fetches cases with pagination', async () => {
    const mockResponse: PaginatedResponse<Case> = {
      count: 10,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          title: 'Test Case',
          description: 'Test Description',
          severity: 'Level 2',
          status: 'Open',
          created_by: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            phone_number: '1234567890',
            national_id: '123456789',
            first_name: 'Test',
            last_name: 'User',
            full_name: 'Test User',
            is_active: true,
            date_joined: '2024-01-01',
            last_login: null,
            roles: [],
          },
          incident_date: null,
          incident_time: null,
          incident_location: null,
          assigned_detective: null,
          assigned_sergeant: null,
          resolution_date: null,
          resolution_notes: '',
          created_date: '2024-01-01',
          updated_date: '2024-01-01',
        },
      ],
    };

    (api.get as jest.Mock).mockResolvedValue({ data: mockResponse });

    const result = await caseService.getCases({ page: 1, page_size: 20 });

    expect(api.get).toHaveBeenCalledWith('/cases/', {
      params: { page: 1, page_size: 20 },
    });
    expect(result).toEqual(mockResponse);
    expect(result.results).toHaveLength(1);
  });

  it('getCase fetches a single case by ID', async () => {
    const mockCase: Case = {
      id: 1,
      title: 'Test Case',
      description: 'Test Description',
      severity: 'Level 2',
      status: 'Open',
      created_by: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        phone_number: '1234567890',
        national_id: '123456789',
        first_name: 'Test',
        last_name: 'User',
        full_name: 'Test User',
        is_active: true,
        date_joined: '2024-01-01',
        last_login: null,
        roles: [],
      },
      incident_date: null,
      incident_time: null,
      incident_location: null,
      assigned_detective: null,
      assigned_sergeant: null,
      resolution_date: null,
      resolution_notes: '',
      created_date: '2024-01-01',
      updated_date: '2024-01-01',
    };

    (api.get as jest.Mock).mockResolvedValue({ data: mockCase });

    const result = await caseService.getCase(1);

    expect(api.get).toHaveBeenCalledWith('/cases/1/');
    expect(result).toEqual(mockCase);
  });

  it('createCase creates a new case', async () => {
    const newCaseData = {
      title: 'New Case',
      description: 'New Description',
      severity: 'Level 1' as const,
    };

    const mockCreatedCase: Case = {
      id: 2,
      ...newCaseData,
      status: 'Open',
      created_by: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        phone_number: '1234567890',
        national_id: '123456789',
        first_name: 'Test',
        last_name: 'User',
        full_name: 'Test User',
        is_active: true,
        date_joined: '2024-01-01',
        last_login: null,
        roles: [],
      },
      incident_date: null,
      incident_time: null,
      incident_location: null,
      assigned_detective: null,
      assigned_sergeant: null,
      resolution_date: null,
      resolution_notes: '',
      created_date: '2024-01-01',
      updated_date: '2024-01-01',
    };

    (api.post as jest.Mock).mockResolvedValue({ data: mockCreatedCase });

    const result = await caseService.createCase(newCaseData);

    expect(api.post).toHaveBeenCalledWith('/cases/', newCaseData);
    expect(result).toEqual(mockCreatedCase);
  });
});

