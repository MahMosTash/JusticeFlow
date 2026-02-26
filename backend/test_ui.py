import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')
django.setup()

from django.test import Client
from apps.accounts.models import User
from apps.complaints.models import Complaint
from rest_framework.authtoken.models import Token

client = Client(SERVER_NAME='localhost')
admin = User.objects.get(username='admin')
token, _ = Token.objects.get_or_create(user=admin)

# 1. Create a dummy complaint
complaint = Complaint.objects.create(
    title='Test UI Bug',
    description='Checking if returned complaints hide buttons.',
    submitted_by=admin,
    status='Pending'
)
print('Created Complaint ID:', complaint.id)

# 2. Return as intern
res = client.post(
    f'/api/complaints/{complaint.id}/review_as_intern/',
    json.dumps({'action': 'return', 'comments': 'Not good enough.'}),
    content_type='application/json',
    HTTP_AUTHORIZATION=f'Token {token.key}'
)
print('Intern Return Status:', res.status_code)

# 3. Fetch complaint again (like UI loadComplaint)
res2 = client.get(
    f'/api/complaints/{complaint.id}/',
    HTTP_AUTHORIZATION=f'Token {token.key}'
)
data = res2.json()
print('Status:', data['status'])
print('Review Comments:', data['review_comments'])
print('Number of Reviews:', len(data['reviews']))
if data['reviews']:
    print('First review action:', data['reviews'][0]['action'])
