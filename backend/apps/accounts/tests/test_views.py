"""
Tests for accounts views (Authentication, User management).
"""
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token
from apps.accounts.models import User, Role


class UserRegistrationTest(TestCase):
    """Tests for user registration."""
    
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/auth/users/register/'
    
    def test_user_registration_success(self):
        """Test successful user registration."""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'phone_number': '1234567890',
            'national_id': '123456789',
            'first_name': 'New',
            'last_name': 'User',
            'password': 'testpass123',
            'password_confirm': 'testpass123'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)
    
    def test_user_registration_password_mismatch(self):
        """Test user registration with password mismatch."""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'phone_number': '1234567890',
            'national_id': '123456789',
            'first_name': 'New',
            'last_name': 'User',
            'password': 'testpass123',
            'password_confirm': 'differentpass'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserLoginTest(TestCase):
    """Tests for user login."""
    
    def setUp(self):
        self.client = APIClient()
        self.login_url = '/api/auth/users/login/'
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            phone_number='1234567890',
            national_id='123456789'
        )
    
    def test_login_with_username(self):
        """Test login with username."""
        data = {
            'identifier': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
    
    def test_login_with_email(self):
        """Test login with email."""
        data = {
            'identifier': 'test@example.com',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_login_with_national_id(self):
        """Test login with national ID."""
        data = {
            'identifier': '123456789',
            'password': 'testpass123'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials."""
        data = {
            'identifier': 'testuser',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserViewSetTest(TestCase):
    """Tests for UserViewSet."""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            phone_number='1234567890',
            national_id='123456789'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
    
    def test_get_current_user(self):
        """Test getting current user profile."""
        response = self.client.get('/api/auth/users/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')

