"""
API-level tests for the trial / judge flow.

Run with:
    python manage.py test apps.trials.tests
"""
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from apps.accounts.models import User, Role
from apps.cases.models import Case
from apps.trials.models import Trial
from apps.investigations.models import Suspect, GuiltScore, CaptainDecision


def make_user(username, role_name):
    import uuid
    suffix = str(uuid.uuid4())[:8]
    user = User.objects.create_user(
        username=username,
        email=f'{username}_{suffix}@test.ir',
        password='testpass123',
        phone_number=f'09{suffix[:9]}',
        national_id=f'{suffix[:10]:0<10}',
    )
    role, _ = Role.objects.get_or_create(name=role_name)
    user.roles.add(role)
    return user


class TrialAPITest(APITestCase):

    def setUp(self):
        self.judge = make_user('judge1', 'Judge')
        self.captain = make_user('captain1', 'Captain')
        self.detective = make_user('detective1', 'Detective')

        self.case = Case.objects.create(
            title='Fraud Case',
            description='Corporate fraud.',
            severity='Level 1',
            created_by=self.captain,
        )
        self.suspect = Suspect.objects.create(
            case=self.case,
            name='Ali Ahmadi',
            national_id='1234567890',
            status='Arrested',
        )

    def _auth(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

    # ── 1. Judge can create a trial ──────────────────────────────────────────
    def test_judge_can_create_trial(self):
        self._auth(self.judge)
        url = reverse('trial-list')
        resp = self.client.post(url, {'case': self.case.pk}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['case'], self.case.pk)

    # ── 2. Non-judge cannot create a trial ──────────────────────────────────
    def test_non_judge_cannot_create_trial(self):
        self._auth(self.detective)
        url = reverse('trial-list')
        resp = self.client.post(url, {'case': self.case.pk}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    # ── 3. Judge sees full dossier on retrieve ───────────────────────────────
    def test_trial_detail_includes_dossier(self):
        trial = Trial.objects.create(case=self.case, judge=self.judge)
        self._auth(self.judge)
        url = reverse('trial-detail', kwargs={'pk': trial.pk})
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        # Case dossier fields present
        case_data = resp.data['case']
        self.assertIn('suspects', case_data)
        self.assertIn('guilt_scores', case_data)
        self.assertIn('captain_decisions', case_data)
        self.assertIn('evidence_items', case_data)

    # ── 4. Judge records Guilty verdict with punishment ─────────────────────
    def test_judge_records_guilty_verdict(self):
        trial = Trial.objects.create(case=self.case, judge=self.judge)
        self._auth(self.judge)
        url = reverse('trial-record-verdict', kwargs={'pk': trial.pk})
        payload = {
            'verdict': 'Guilty',
            'punishment_title': '5 Years Imprisonment',
            'punishment_description': 'Convicted of corporate fraud — 5 years.',
        }
        resp = self.client.post(url, payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['verdict'], 'Guilty')
        self.assertEqual(resp.data['punishment_title'], '5 Years Imprisonment')
        self.assertTrue(resp.data['is_complete'])
        # Case should be Resolved
        self.case.refresh_from_db()
        self.assertEqual(self.case.status, 'Resolved')

    # ── 5. Guilty verdict without punishment is rejected ────────────────────
    def test_guilty_verdict_without_punishment_rejected(self):
        trial = Trial.objects.create(case=self.case, judge=self.judge)
        self._auth(self.judge)
        url = reverse('trial-record-verdict', kwargs={'pk': trial.pk})
        resp = self.client.post(url, {'verdict': 'Guilty'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    # ── 6. Not Guilty verdict requires no punishment ────────────────────────
    def test_not_guilty_verdict_no_punishment_required(self):
        trial = Trial.objects.create(case=self.case, judge=self.judge)
        self._auth(self.judge)
        url = reverse('trial-record-verdict', kwargs={'pk': trial.pk})
        resp = self.client.post(url, {'verdict': 'Not Guilty'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.data['is_complete'])

    # ── 7. Cannot record verdict twice ──────────────────────────────────────
    def test_cannot_record_verdict_twice(self):
        import django.utils.timezone
        trial = Trial.objects.create(
            case=self.case,
            judge=self.judge,
            verdict='Not Guilty',
            verdict_date=django.utils.timezone.now(),
        )
        self._auth(self.judge)
        url = reverse('trial-record-verdict', kwargs={'pk': trial.pk})
        resp = self.client.post(url, {'verdict': 'Guilty',
                                       'punishment_title': 'X', 'punishment_description': 'Y'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    # ── 8. All authenticated users can list trials ───────────────────────────
    def test_authenticated_user_can_list_trials(self):
        Trial.objects.create(case=self.case, judge=self.judge)
        self._auth(self.detective)
        url = reverse('trial-list')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(resp.data['count'], 1)
