"""
Tests for permission classes.
"""
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token as AuthToken
from apps.accounts.models import User, Role
from apps.cases.models import Case


class PermissionTest(TestCase):
    """Tests for role-based permissions."""
    
    def setUp(self):
        self.client = APIClient()
        
        # Create roles
        self.detective_role = Role.objects.create(name='Detective')
        self.officer_role = Role.objects.create(name='Police Officer')
        self.basic_user_role = Role.objects.create(name='Basic User')
        
        # Create users
        self.detective = User.objects.create_user(
            username='detective',
            email='detective@example.com',
            password='testpass123',
            phone_number='1111111111',
            national_id='111111111'
        )
        self.detective.assign_role(self.detective_role)
        self.detective_token = AuthToken.objects.create(user=self.detective)
        
        self.officer = User.objects.create_user(
            username='officer',
            email='officer@example.com',
            password='testpass123',
            phone_number='2222222222',
            national_id='222222222'
        )
        self.officer.assign_role(self.officer_role)
        self.officer_token = AuthToken.objects.create(user=self.officer)
        
        self.basic_user = User.objects.create_user(
            username='basic',
            email='basic@example.com',
            password='testpass123',
            phone_number='3333333333',
            national_id='333333333'
        )
        self.basic_user.assign_role(self.basic_user_role)
        self.basic_user_token = AuthToken.objects.create(user=self.basic_user)
    
    def test_detective_can_create_suspect(self):
        """Test that detective can create suspect."""
        case = Case.objects.create(
            title='Test Case',
            description='Test',
            severity='Level 2',
            created_by=self.officer
        )
        
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.detective_token.key)
        data = {
            'case_id': case.id,  # Use case_id for write
            'name': 'Test Suspect',
            'national_id': '999999999',
            'phone_number': '9999999999'
        }
        response = self.client.post('/api/investigations/suspects/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_basic_user_cannot_create_suspect(self):
        """Test that basic user cannot create suspect."""
        case = Case.objects.create(
            title='Test Case',
            description='Test',
            severity='Level 2',
            created_by=self.officer
        )
        
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.basic_user_token.key)
        data = {
            'case': case.id,
            'name': 'Test Suspect'
        }
        response = self.client.post('/api/investigations/suspects/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

