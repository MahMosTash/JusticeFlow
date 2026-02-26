import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from django.test import Client

client = Client()
# Send a completely invalid token (simulate the wiped database state)
response = client.get('/api/auth/users/', HTTP_AUTHORIZATION='Token invalid-token-from-old-db')
print('Response Status Code:', response.status_code)
print('Response JSON:', response.json())
