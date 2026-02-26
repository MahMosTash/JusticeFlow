import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from apps.accounts.models import User, Role
from rest_framework.authtoken.models import Token
import json

client = Client()

admin = User.objects.get(username='admin')
token, _ = Token.objects.get_or_create(user=admin)
basic_role = Role.objects.get(name='Basic User')
target_user = User.objects.create(username='test_target_2', email='test2@test.com', phone_number='2222', national_id='2222')
target_user.assign_role(basic_role)

# Test Assign
res = client.post(f'/api/auth/users/{target_user.id}/assign_role/', json.dumps({'role_id': Role.objects.get(name='Detective').id}), content_type='application/json', HTTP_AUTHORIZATION=f'Token {token.key}')
print("Assign:", res.status_code, res.content)

# Test Remove Basic User
res = client.post(f'/api/auth/users/{target_user.id}/remove_role/', json.dumps({'role_id': basic_role.id}), content_type='application/json', HTTP_AUTHORIZATION=f'Token {token.key}')
print("Remove:", res.status_code, res.content)
