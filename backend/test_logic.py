import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from django.test import Client
from apps.accounts.models import User, Role

target_user = User.objects.create(username='test_logic', email='l@l.com', phone_number='11', national_id='11')
target_user.assign_role('Basic User')
print('Active roles before:', [r.name for r in target_user.get_active_roles()])

target_user.assign_role('Detective')
print('Active roles after Assign:', [r.name for r in target_user.get_active_roles()])

target_user.remove_role('Detective')
print('Active roles after Remove:', [r.name for r in target_user.get_active_roles()])

