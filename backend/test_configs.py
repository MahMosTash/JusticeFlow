import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')
django.setup()

from django.conf import settings
print('MIDDLEWARE:', settings.MIDDLEWARE)
print('REST_FRAMEWORK:', settings.REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES'])
