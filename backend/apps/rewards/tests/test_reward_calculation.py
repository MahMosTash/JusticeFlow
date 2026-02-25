"""
Tests for reward calculation.
"""
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from apps.rewards.models import Reward, RewardSubmission
from apps.accounts.models import User, Role
from apps.cases.models import Case
from apps.investigations.models import Suspect
from core.utils import calculate_reward_amount


class RewardCalculationTest(TestCase):
    """Tests for reward calculation."""
    
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
            created_by=self.user
        )
        self.suspect = Suspect.objects.create(
            case=self.case,
            user=self.user,
            surveillance_start_date=timezone.now().date() - timedelta(days=10)
        )
    
    def test_reward_amount_calculation(self):
        """Test reward amount calculation formula."""
        # Level 2 = 2, days = 10
        # Formula: max(Lj) × max(Di) × 20,000,000
        # = 2 × 10 × 20,000,000 = 400,000,000
        amount = calculate_reward_amount('Level 2', 10)
        self.assertEqual(amount, 400000000)
    
    def test_reward_creation_auto_calculates_amount(self):
        """Test that reward creation automatically calculates amount."""
        submission = RewardSubmission.objects.create(
            submitted_by=self.user,
            case=self.case,
            information='Test information',
            status='Approved'
        )
        
        reward = Reward.objects.create(
            submission=submission,
            case=self.case,
            created_by=self.user
        )
        
        # Amount should be calculated based on case severity and suspect days
        self.assertGreater(reward.amount, 0)
        self.assertIsNotNone(reward.reward_code)

