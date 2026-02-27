"""
API-level tests for the interrogation scoring flow:
  - Sergeant / Detective submit guilt scores (1–10)
  - Captain makes a decision (scores visible to captain)
  - Police Chief approves critical-crime decisions

Run with:
    python manage.py test apps.investigations.tests.test_interrogation_api
"""
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from apps.accounts.models import User, Role
from apps.cases.models import Case
from apps.investigations.models import Suspect, GuiltScore, CaptainDecision


def make_user(username, role_name, **kwargs):
    """Helper: create a user with a given role."""
    user = User.objects.create_user(
        username=username,
        email=f'{username}@police.ir',
        password='testpass123',
        phone_number=f'091{username[:8]:0<8}',
        national_id=f'{username[:10]:0<10}',
        **kwargs
    )
    role, _ = Role.objects.get_or_create(name=role_name)
    user.roles.add(role)
    return user


class GuiltScoreAPITest(APITestCase):
    """Tests for POST /investigations/guilt-scores/ (sergeant & detective)."""

    def setUp(self):
        self.sergeant = make_user('sergeant1', 'Sergeant')
        self.detective = make_user('detective1', 'Detective')
        self.captain = make_user('captain1', 'Captain')

        # A standard (non-critical) open case
        self.case = Case.objects.create(
            title='Bank Robbery',
            description='Armed robbery at downtown branch.',
            severity='Level 1',
            created_by=self.captain,
        )
        self.suspect = Suspect.objects.create(
            case=self.case,
            name='Ali Rahmani',
            national_id='1234567890',
            status='Arrested',
        )
        self.url = reverse('guilt-score-list')

    def _auth(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

    # ------------------------------------------------------------------
    # Test 1: Sergeant can submit a guilt score
    # ------------------------------------------------------------------
    def test_sergeant_can_submit_guilt_score(self):
        """Sergeant submits a valid guilt score → 201 with correct fields."""
        self._auth(self.sergeant)
        payload = {
            'suspect': self.suspect.pk,
            'case': self.case.pk,
            'score': 7,
            'justification': 'Suspect had no alibi and was identified by two witnesses.',
        }
        response = self.client.post(self.url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['score'], 7)
        # assigned_by should be the authenticated sergeant
        self.assertEqual(response.data['assigned_by']['username'], 'sergeant1')

    # ------------------------------------------------------------------
    # Test 2: Detective can submit a guilt score independently
    # ------------------------------------------------------------------
    def test_detective_can_submit_guilt_score(self):
        """Detective submits a valid guilt score → 201."""
        self._auth(self.detective)
        payload = {
            'suspect': self.suspect.pk,
            'case': self.case.pk,
            'score': 9,
            'justification': 'Fingerprints matched at the scene.',
        }
        response = self.client.post(self.url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['score'], 9)
        self.assertEqual(response.data['assigned_by']['username'], 'detective1')

    # ------------------------------------------------------------------
    # Test 3: Duplicate guilt score (same user + same suspect) is rejected
    # ------------------------------------------------------------------
    def test_duplicate_guilt_score_rejected(self):
        """Same user cannot submit two scores for the same suspect → 400."""
        self._auth(self.sergeant)
        payload = {
            'suspect': self.suspect.pk,
            'case': self.case.pk,
            'score': 5,
            'justification': 'First score.',
        }
        # First submission should succeed
        first = self.client.post(self.url, payload, format='json')
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)

        # Second submission (same user, same suspect) must be rejected
        payload['score'] = 8
        payload['justification'] = 'Changed my mind.'
        second = self.client.post(self.url, payload, format='json')
        self.assertEqual(second.status_code, status.HTTP_400_BAD_REQUEST)

    # ------------------------------------------------------------------
    # Test 4: Score out of range (0 and 11) is rejected
    # ------------------------------------------------------------------
    def test_score_out_of_range_rejected(self):
        """Scores outside 1–10 must be rejected by the serializer → 400."""
        self._auth(self.detective)

        for bad_score in (0, 11, -1, 100):
            payload = {
                'suspect': self.suspect.pk,
                'case': self.case.pk,
                'score': bad_score,
                'justification': 'Testing boundary.',
            }
            response = self.client.post(self.url, payload, format='json')
            self.assertEqual(
                response.status_code,
                status.HTTP_400_BAD_REQUEST,
                msg=f'Expected 400 for score={bad_score}, got {response.status_code}'
            )

    # ------------------------------------------------------------------
    # Test 5: Captain decision on a Critical case auto-sets requires_chief_approval
    # ------------------------------------------------------------------
    def test_captain_decision_critical_case_requires_chief_approval(self):
        """
        Captain creates a decision on a Critical case.
        The serializer must set requires_chief_approval=True automatically.
        """
        critical_case = Case.objects.create(
            title='Assassination Plot',
            description='Critical severity crime.',
            severity='Critical',
            created_by=self.captain,
        )
        critical_suspect = Suspect.objects.create(
            case=critical_case,
            name='Hossein Moradi',
            national_id='9876543210',
            status='Arrested',
        )

        self._auth(self.captain)
        url = reverse('captain-decision-list')
        payload = {
            'case': critical_case.pk,
            'suspect': critical_suspect.pk,
            'decision': 'Approve Arrest',
            'comments': 'Strong evidence found. Recommending arrest.',
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # The serializer detect Critical severity → sets the flag
        self.assertTrue(
            response.data['requires_chief_approval'],
            'Critical case decision must require Police Chief approval'
        )
        # Chief has not approved yet → chief_approval should be null
        self.assertIsNone(response.data['chief_approval'])

    # ------------------------------------------------------------------
    # Test 6: Police Chief approves a critical decision
    # ------------------------------------------------------------------
    def test_police_chief_can_approve_critical_decision(self):
        """Police Chief calls approve_chief/ → 200, chief_approval=True."""
        chief = make_user('chief1', 'Police Chief')

        critical_case = Case.objects.create(
            title='Terrorism Case',
            description='Critical crime.',
            severity='Critical',
            created_by=self.captain,
        )
        critical_suspect = Suspect.objects.create(
            case=critical_case,
            name='Nader Ahmadi',
            national_id='1122334455',
            status='Arrested',
        )
        decision = CaptainDecision.objects.create(
            case=critical_case,
            suspect=critical_suspect,
            decision='Approve Arrest',
            decided_by=self.captain,
            requires_chief_approval=True,
            chief_approval=None,
        )

        self._auth(chief)
        url = reverse('captain-decision-approve-chief', kwargs={'pk': decision.pk})
        response = self.client.post(url, {'approval': True}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['chief_approval'])
        self.assertEqual(response.data['chief_approved_by']['username'], 'chief1')
        self.assertIsNotNone(response.data['chief_approval_date'])
