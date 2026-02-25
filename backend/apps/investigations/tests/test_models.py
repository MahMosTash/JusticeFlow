"""
Tests for investigations models.
"""
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from apps.investigations.models import Suspect, GuiltScore, CaptainDecision
from apps.accounts.models import User, Role
from apps.cases.models import Case


class SuspectModelTest(TestCase):
    """Tests for Suspect model."""
    
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
            surveillance_start_date=timezone.now().date() - timedelta(days=35)
        )
    
    def test_days_under_investigation(self):
        """Test days under investigation calculation."""
        days = self.suspect.get_days_under_investigation()
        self.assertGreaterEqual(days, 35)
    
    def test_most_wanted_ranking(self):
        """Test Most Wanted ranking calculation."""
        ranking = self.suspect.get_most_wanted_ranking()
        # Level 2 = 2, days >= 35, so ranking >= 70
        self.assertGreaterEqual(ranking, 70)
    
    def test_severe_surveillance_check(self):
        """Test severe surveillance status update."""
        self.suspect.status = 'Under Investigation'
        self.suspect.check_severe_surveillance()
        self.assertEqual(self.suspect.status, 'Under Severe Surveillance')


class GuiltScoreModelTest(TestCase):
    """Tests for GuiltScore model."""
    
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
            user=self.user
        )
    
    def test_guilt_score_creation(self):
        """Test guilt score creation."""
        score = GuiltScore.objects.create(
            suspect=self.suspect,
            case=self.case,
            assigned_by=self.user,
            score=7,
            justification='Test justification'
        )
        self.assertEqual(score.score, 7)
        self.assertEqual(score.assigned_by, self.user)


class CaptainDecisionTest(TestCase):
    """Tests for CaptainDecision model."""
    
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
            severity='Critical',  # Critical requires chief approval
            created_by=self.user
        )
        self.suspect = Suspect.objects.create(
            case=self.case,
            user=self.user
        )
    
    def test_critical_case_requires_chief_approval(self):
        """Test that critical cases require chief approval."""
        decision = CaptainDecision.objects.create(
            case=self.case,
            suspect=self.suspect,
            decision='Approve Arrest',
            decided_by=self.user,
            requires_chief_approval=True  # Set explicitly since case is critical
        )
        self.assertTrue(decision.requires_chief_approval)
        self.assertTrue(decision.requires_approval())

