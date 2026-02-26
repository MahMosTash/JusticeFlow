from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User, Role
from apps.cases.models import Case

class ChiefApprovalTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create roles
        Role.objects.get_or_create(name='Police Officer')
        Role.objects.get_or_create(name='Police Chief')
        
        # Create users
        self.officer = User.objects.create_user(
            username='test_officer', email='officer@test.com', password='password',
            phone_number='1234567890', national_id='1234567890'
        )
        self.officer.assign_role('Police Officer')
        
        self.chief = User.objects.create_user(
            username='test_chief', email='chief@test.com', password='password',
            phone_number='0987654321', national_id='0987654321'
        )
        self.chief.assign_role('Police Chief')
        
        # Create a pending case created by the officer
        self.pending_case = Case.objects.create(
            title="Pending Case",
            description="Created from complaint",
            severity="Level 2",
            status="Pending",
            created_by=self.officer
        )

    def test_chief_can_see_pending_case(self):
        """Chief should be able to list and see the Pending case in the queryset."""
        self.client.force_authenticate(user=self.chief)
        response = self.client.get('/api/cases/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check if pending case is returned in list
        self.assertTrue(any(c['id'] == self.pending_case.id for c in response.data['results']))

    def test_chief_can_approve_pending_case(self):
        """Chief should be able to approve a pending case and change its status to Open."""
        self.client.force_authenticate(user=self.chief)
        response = self.client.post(f'/api/cases/{self.pending_case.id}/approve/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check database update
        self.pending_case.refresh_from_db()
        self.assertEqual(self.pending_case.status, 'Open')

    def test_officer_cannot_approve_case(self):
        """Officer should be blocked from using the approve endpoints."""
        self.client.force_authenticate(user=self.officer)
        response = self.client.post(f'/api/cases/{self.pending_case.id}/approve/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
