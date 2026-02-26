import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from django.test import Client
from apps.accounts.models import User, Role
from rest_framework.authtoken.models import Token

client = Client()
admin = User.objects.get(username='admin')
token, _ = Token.objects.get_or_create(user=admin)

print('Admin rules:', [r.name for r in admin.get_active_roles()])
basic_role = Role.objects.get(name='Basic User')
target_user = User.objects.create(username='test_target', email='test@test.com', first_name='Test', last_name='Target', phone_number='12345678', national_id='12345678')
target_user.assign_role(basic_role)
print('Target rules:', [r.name for r in target_user.get_active_roles()])

print('Assigning Detective role to target...')
response = client.post(f'/api/auth/users/{target_user.id}/assign_role/', {'role_id': Role.objects.get(name='Detective').id}, HTTP_AUTHORIZATION=f'Token {token.key}', content_type='application/json')
print('Assign Response:', response.status_code)
print('Target rules now:', [r.name for r in target_user.get_active_roles()])

print('Removing Detective role from target...')
response = client.post(f'/api/auth/users/{target_user.id}/remove_role/', {'role_id': Role.objects.get(name='Detective').id}, HTTP_AUTHORIZATION=f'Token {token.key}', content_type='application/json')
print('Remove Response:', response.status_code)
print('Target rules now:', [r.name for r in target_user.get_active_roles()])

print('Removing Basic User role from target...')
response = client.post(f'/api/auth/users/{target_user.id}/remove_role/', {'role_id': basic_role.id}, HTTP_AUTHORIZATION=f'Token {token.key}', content_type='application/json')
print('Remove Basic User Response:', response.status_code)
print('Target rules now:', [r.name for r in target_user.get_active_roles()])

