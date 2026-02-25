"""
Development settings for Police Case Management System.
"""
from .base import *

DEBUG = True

# Additional apps for development (commented out - install django-extensions if needed)
# INSTALLED_APPS += [
#     'django_extensions',  # If needed for development tools
# ]

# Development-specific settings
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

