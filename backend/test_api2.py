import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')
django.setup()

from django.test import Client
from apps.accounts.models import User, Role
from rest_framework.authtoken.models import Token
import json

client = Client(SERVER_NAME='localhost')
admin = User.objects.get(username='admin')
token, _ = Token.objects.get_or_create(user=admin)

detective_role = Role.objects.get(name='Detective')
res = client.post(
    f'/api/auth/users/{admin.id}/assign_role/',
    json.dumps({'role_id': detective_role.id}),
    content_type='application/json',
    HTTP_AUTHORIZATION=f'Token {token.key}'
)
print('Assign Response:', res.status_code, res.content)

res = client.post(
    f'/api/auth/users/{admin.id}/remove_role/',
    json.dumps({'role_id': detective_role.id}),
    content_type='application/json',
    HTTP_AUTHORIZATION=f'Token {token.key}'
)
print('Remove Response:', res.status_code, res.content)
