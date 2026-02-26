import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')
django.setup()

from django.test import Client
from apps.accounts.models import User, Role, RoleAssignment
from rest_framework.authtoken.models import Token
import json

client = Client(SERVER_NAME='localhost')

# Register
reg_data = {
    'username': 'scenario_user2',
    'email': 'scen2@l.com',
    'phone_number': '999992',
    'national_id': '999992',
    'first_name': 'Scen',
    'last_name': 'Ario',
    'password': 'password123',
    'password_confirm': 'password123'
}

client.post('/api/auth/users/register/', json.dumps(reg_data), content_type='application/json')
new_user = User.objects.get(username='scenario_user2')
print('DB Assignments Before:', list(RoleAssignment.objects.filter(user=new_user).values('role__name', 'is_active')))

admin = User.objects.get(username='admin')
token, _ = Token.objects.get_or_create(user=admin)
detective_role = Role.objects.get(name='Detective')

res = client.post(
    f'/api/auth/users/{new_user.id}/assign_role/',
    json.dumps({'role_id': detective_role.id}),
    content_type='application/json',
    HTTP_AUTHORIZATION=f'Token {token.key}'
)

# Fetch user list
res = client.get('/api/auth/users/', HTTP_AUTHORIZATION=f'Token {token.key}')
data = json.loads(res.content)
for u in data['results']:
    if u['username'] == 'scenario_user2':
        print('User List Roles:', [r['name'] for r in u['roles']])
