"""
Tests for accounts models (User, Role, RoleAssignment).
"""
from django.test import TestCase
from django.core.exceptions import ValidationError
from apps.accounts.models import User, Role, RoleAssignment


class RoleModelTest(TestCase):
    """Tests for Role model."""
    
    def setUp(self):
        self.role = Role.objects.create(
            name='Test Role',
            description='Test description',
            is_active=True
        )
    
    def test_role_creation(self):
        """Test role creation."""
        self.assertEqual(self.role.name, 'Test Role')
        self.assertTrue(self.role.is_active)
    
    def test_role_str(self):
        """Test role string representation."""
        self.assertEqual(str(self.role), 'Test Role')


class UserModelTest(TestCase):
    """Tests for User model."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            phone_number='1234567890',
            national_id='123456789',
            first_name='Test',
            last_name='User'
        )
        self.role = Role.objects.create(name='Test Role')
    
    def test_user_creation(self):
        """Test user creation."""
        self.assertEqual(self.user.username, 'testuser')
        self.assertEqual(self.user.email, 'test@example.com')
        self.assertTrue(self.user.check_password('testpass123'))
    
    def test_user_has_role(self):
        """Test user has_role method."""
        self.assertFalse(self.user.has_role('Test Role'))
        self.user.assign_role(self.role)
        self.assertTrue(self.user.has_role('Test Role'))
    
    def test_user_assign_role(self):
        """Test user assign_role method."""
        assignment = self.user.assign_role(self.role)
        self.assertIsNotNone(assignment)
        self.assertTrue(assignment.is_active)
        self.assertTrue(self.user.has_role('Test Role'))
    
    def test_user_remove_role(self):
        """Test user remove_role method."""
        self.user.assign_role(self.role)
        self.assertTrue(self.user.has_role('Test Role'))
        self.user.remove_role(self.role)
        self.assertFalse(self.user.has_role('Test Role'))
    
    def test_user_get_full_name(self):
        """Test user get_full_name method."""
        self.assertEqual(self.user.get_full_name(), 'Test User')


class RoleAssignmentModelTest(TestCase):
    """Tests for RoleAssignment model."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            phone_number='1234567890',
            national_id='123456789'
        )
        self.role = Role.objects.create(name='Test Role')
        self.assigned_by = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='adminpass123',
            phone_number='0987654321',
            national_id='987654321'
        )
    
    def test_role_assignment_creation(self):
        """Test role assignment creation."""
        assignment = RoleAssignment.objects.create(
            user=self.user,
            role=self.role,
            assigned_by=self.assigned_by
        )
        self.assertEqual(assignment.user, self.user)
        self.assertEqual(assignment.role, self.role)
        self.assertTrue(assignment.is_active)

