from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.accounts.models import User, Role
from apps.cases.models import Case
from apps.rewards.models import RewardSubmission

class RewardLiveAPITest(APITestCase):
    def test_live_detective_approve(self):
        user = User.objects.create_user(username='u', email='e@e.com', password='p', phone_number='1', national_id='1')
        det = User.objects.create_user(username='d', email='d@d.com', password='p', phone_number='2', national_id='2')
        det.roles.add(Role.objects.create(name='Detective'))
        off = User.objects.create_user(username='o', email='o@o.com', password='p', phone_number='3', national_id='3')
        
        case = Case.objects.create(title='C', description='D', severity='Level 1', created_by=off)
        sub = RewardSubmission.objects.create(case=case, information='Info', submitted_by=user, status='Under Review', reviewed_by_officer=off)
        
        self.client.force_authenticate(user=det)
        detective_review_url = reverse('reward-submission-review-as-detective', kwargs={'pk': sub.pk})
        
        resp = self.client.post(detective_review_url, {
            'action': 'approve',
            'comments': 'Looks good'
        }, format='json')
        
        print("\n=== LIVE API RESPONSE ===")
        print(f"Status: {resp.status_code}")
        print(f"Data: {resp.data}")
