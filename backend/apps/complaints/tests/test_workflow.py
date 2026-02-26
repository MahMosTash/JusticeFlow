"""
Tests for complaint approval workflow.
"""
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token as AuthToken
from apps.accounts.models import User, Role
from apps.complaints.models import Complaint
from apps.cases.models import Case


class ComplaintWorkflowTest(TestCase):
    """Tests for complaint approval workflow."""
    
    def setUp(self):
        self.client = APIClient()
        
        # Create roles
        self.intern_role = Role.objects.create(name='Intern (Cadet)')
        self.officer_role = Role.objects.create(name='Police Officer')
        self.basic_user_role = Role.objects.create(name='Basic User')
        
        # Create users
        self.complainant = User.objects.create_user(
            username='complainant',
            email='complainant@example.com',
            password='testpass123',
            phone_number='1111111111',
            national_id='111111111'
        )
        self.complainant.assign_role(self.basic_user_role)
        
        self.intern = User.objects.create_user(
            username='intern',
            email='intern@example.com',
            password='testpass123',
            phone_number='2222222222',
            national_id='222222222'
        )
        self.intern.assign_role(self.intern_role)
        self.intern_token = AuthToken.objects.create(user=self.intern)
        
        self.officer = User.objects.create_user(
            username='officer',
            email='officer@example.com',
            password='testpass123',
            phone_number='3333333333',
            national_id='333333333'
        )
        self.officer.assign_role(self.officer_role)
        self.officer_token = AuthToken.objects.create(user=self.officer)
    
    def test_complaint_submission(self):
        """Test complaint submission by basic user."""
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + AuthToken.objects.create(user=self.complainant).key)
        data = {
            'title': 'Test Complaint',
            'description': 'Test description'
        }
        response = self.client.post('/api/complaints/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Complaint.objects.count(), 1)
    
    def test_intern_review_forward(self):
        """Test intern forwarding complaint to officer."""
        complaint = Complaint.objects.create(
            title='Test Complaint',
            description='Test description',
            submitted_by=self.complainant
        )
        
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.intern_token.key)
        response = self.client.post(
            f'/api/complaints/{complaint.id}/review_as_intern/',
            {'action': 'forward', 'comments': 'Looks good'},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        complaint.refresh_from_db()
        self.assertEqual(complaint.status, 'Under Review')
        self.assertEqual(complaint.reviewed_by_intern, self.intern)
    
    def test_officer_approve_creates_case(self):
        """Test officer approval creates case."""
        complaint = Complaint.objects.create(
            title='Test Complaint',
            description='Test description',
            submitted_by=self.complainant,
            status='Under Review',
            reviewed_by_intern=self.intern
        )
        
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.officer_token.key)
        response = self.client.post(
            f'/api/complaints/{complaint.id}/review_as_officer/',
            {'action': 'approve', 'comments': 'Approved'},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        complaint.refresh_from_db()
        self.assertEqual(complaint.status, 'Approved')
        self.assertIsNotNone(complaint.case)
        self.assertEqual(Case.objects.count(), 1)
    
    def test_three_strikes_permanent_rejection(self):
        """Test that 3 invalid submissions result in permanent rejection."""
        complaint = Complaint.objects.create(
            title='Test Complaint',
            description='Test description',
            submitted_by=self.complainant,
            submission_count=3
        )
        
        complaint.increment_submission_count()
        self.assertEqual(complaint.submission_count, 4)
        self.assertEqual(complaint.status, 'Permanently Rejected')

    def test_officer_approve_creates_case_with_incident_details(self):
        """Test officer approval creates case with incident date, time, and location."""
        complaint = Complaint.objects.create(
            title='Test Complaint',
            description='Test description',
            submitted_by=self.complainant,
            status='Under Review',
            reviewed_by_intern=self.intern
        )
        
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.officer_token.key)
        response = self.client.post(
            f'/api/complaints/{complaint.id}/review_as_officer/',
            {
                'action': 'approve',
                'comments': 'Approved',
                'case_title': 'Special Case',
                'case_description': 'Special Description',
                'case_severity': 'Level 2',
                'case_incident_date': '2025-01-01',
                'case_incident_time': '14:30:00',
                'case_incident_location': '123 Main St'
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        complaint.refresh_from_db()
        self.assertEqual(complaint.status, 'Approved')
        self.assertIsNotNone(complaint.case)
        
        case = complaint.case
        self.assertEqual(case.title, 'Special Case')
        self.assertEqual(case.description, 'Special Description')
        self.assertEqual(case.severity, 'Level 2')
        self.assertEqual(str(case.incident_date), '2025-01-01')
        self.assertEqual(str(case.incident_time), '14:30:00')
        self.assertEqual(case.incident_location, '123 Main St')

