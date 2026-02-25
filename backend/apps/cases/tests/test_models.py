"""
Tests for cases models.
"""
from django.test import TestCase
from apps.cases.models import Case
from apps.accounts.models import User, Role


class CaseModelTest(TestCase):
    """Tests for Case model."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            phone_number='1234567890',
            national_id='123456789'
        )
        self.case = Case.objects.create(
            title='Test Case',
            description='Test description',
            severity='Level 2',
            status='Open',
            created_by=self.user
        )
    
    def test_case_creation(self):
        """Test case creation."""
        self.assertEqual(self.case.title, 'Test Case')
        self.assertEqual(self.case.severity, 'Level 2')
        self.assertEqual(self.case.status, 'Open')
    
    def test_case_is_critical(self):
        """Test is_critical method."""
        self.assertFalse(self.case.is_critical())
        self.case.severity = 'Critical'
        self.assertTrue(self.case.is_critical())
    
    def test_case_requires_chief_approval(self):
        """Test requires_chief_approval method."""
        self.assertFalse(self.case.requires_chief_approval())
        self.case.severity = 'Critical'
        self.assertTrue(self.case.requires_chief_approval())

