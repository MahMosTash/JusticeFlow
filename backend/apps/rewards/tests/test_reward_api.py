from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.accounts.models import User, Role
from apps.cases.models import Case
from apps.rewards.models import RewardSubmission, Reward

class RewardAPITest(APITestCase):
    def setUp(self):
        # Create roles
        self.basic_role = Role.objects.create(name='Basic User')
        self.officer_role = Role.objects.create(name='Police Officer')
        self.detective_role = Role.objects.create(name='Detective')
        
        # Create users
        self.basic_user = User.objects.create_user(
            username='user1', password='password123',
            email='user1@example.com',
            phone_number='1111111111',
            national_id='1234567890'
        )
        self.basic_user.roles.add(self.basic_role)
        
        self.officer = User.objects.create_user(
            username='officer1', password='password123',
            email='officer1@example.com',
            phone_number='2222222222',
            national_id='2222222222'
        )
        self.officer.roles.add(self.officer_role)
        
        self.detective = User.objects.create_user(
            username='detective1', password='password123',
            email='detective1@example.com',
            phone_number='3333333333',
            national_id='3333333333'
        )
        self.detective.roles.add(self.detective_role)
        
        # Create a case
        self.case = Case.objects.create(
            title='Test Case',
            description='Test Desc',
            severity='Level 1',
            created_by=self.officer
        )
        
        self.submit_url = reverse('reward-submission-list')
        self.reward_list_url = reverse('reward-list')

    def _auth(self, user):
        self.client.force_authenticate(user=user)

    def test_full_reward_flow_and_verification(self):
        # 1. Basic user submits info
        self._auth(self.basic_user)
        resp = self.client.post(self.submit_url, {
            'case': self.case.pk,
            'information': 'I saw him running away.'
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        sub_id = resp.data['id']
        
        # Submit another one that will be rejected for fun
        resp2 = self.client.post(self.submit_url, {
            'information': 'He looks sus.'
        }, format='json')
        rej_id = resp2.data['id']
        
        # 2. Officer reviews and approves
        self._auth(self.officer)
        officer_review_url = reverse('reward-submission-review-as-officer', kwargs={'pk': sub_id})
        resp = self.client.post(officer_review_url, {
            'action': 'approve',
            'comments': 'Seems credible.'
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        
        # Officer rejects the second
        rej_review_url = reverse('reward-submission-review-as-officer', kwargs={'pk': rej_id})
        resp_rej = self.client.post(rej_review_url, {
            'action': 'reject'
        }, format='json')
        self.assertEqual(resp_rej.data['status'], 'Rejected')
        
        # 3. Detective reviews and approves -> Creates Reward
        self._auth(self.detective)
        detective_review_url = reverse('reward-submission-review-as-detective', kwargs={'pk': sub_id})
        resp = self.client.post(detective_review_url, {
            'action': 'approve',
            'comments': 'Confirmed via CCTV.'
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn('reward', resp.data)
        
        reward_code = resp.data['reward']['reward_code']
        self.assertTrue(reward_code)
        
        # 4. Officer verifies reward with CORRECT national ID
        self._auth(self.officer)
        verify_url = reverse('reward-verify')
        resp = self.client.post(verify_url, {
            'reward_code': reward_code,
            'national_id': '1234567890'
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        # 0 days passed = 0 ranking = 0 amount
        self.assertEqual(resp.data['amount'], 0) 
        
        # 5. Officer verifies reward with INCORRECT national ID
        resp = self.client.post(verify_url, {
            'reward_code': reward_code,
            'national_id': '0000000000'
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(resp.data['error'], 'National ID does not match this reward code')
        
        # 6. Invalid code
        resp = self.client.post(verify_url, {
            'reward_code': 'FAKECODE123',
            'national_id': '1234567890'
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)
