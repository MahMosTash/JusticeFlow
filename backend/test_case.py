import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')
django.setup()

from django.test import Client
from apps.accounts.models import User
from apps.complaints.models import Complaint
from rest_framework.authtoken.models import Token
import json

client = Client(SERVER_NAME='localhost')

# Find a user and an officer
user = User.objects.get(username='admin')
token, _ = Token.objects.get_or_create(user=user)

# Create a test complaint
complaint = Complaint.objects.create(
    title='Officer Case Creation Test',
    description='Testing if case creation fails.',
    submitted_by=user,
    status='Under Review' # Skip intern
)

print('Created Test Complaint:', complaint.id)

# Try to approve it
res = client.post(
    f'/api/complaints/{complaint.id}/review_as_officer/',
    json.dumps({'action': 'approve', 'comments': 'LGTM. Make a case.'}),
    content_type='application/json',
    HTTP_AUTHORIZATION=f'Token {token.key}'
)

print('Approval Response:', res.status_code, res.content)

# Check if case exists
from apps.cases.models import Case
case = Case.objects.filter(title='Officer Case Creation Test').first()
print('Case created:', case is not None)
if case:
    print('Case specifics:', case.title, case.severity)
