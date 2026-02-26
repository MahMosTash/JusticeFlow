import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')
django.setup()

from apps.accounts.models import User, Role

try:
    target = User.objects.get(username='test_logic2')
except User.DoesNotExist:
    target = User.objects.create(username='test_logic2', email='l2@l.com', phone_number='112', national_id='112')

basic = Role.objects.get(name='Basic User')
target.assign_role(basic)
print('Roles after Basic:', [r.name for r in target.get_active_roles()])

target.assign_role('Detective')
print('Roles after Detective assigned:', [r.name for r in target.get_active_roles()])
