"""
Management command to create superuser with System Administrator role.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.accounts.models import Role

User = get_user_model()


class Command(BaseCommand):
    help = 'Create a superuser with System Administrator role'
    
    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, required=True, help='Username')
        parser.add_argument('--email', type=str, required=True, help='Email')
        parser.add_argument('--password', type=str, required=True, help='Password')
        parser.add_argument('--phone', type=str, required=True, help='Phone number')
        parser.add_argument('--national-id', type=str, required=True, help='National ID')
        parser.add_argument('--first-name', type=str, default='', help='First name')
        parser.add_argument('--last-name', type=str, default='', help='Last name')
    
    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        phone = options['phone']
        national_id = options['national_id']
        first_name = options['first_name']
        last_name = options['last_name']
        
        # Check if user exists
        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.ERROR(f'User with username "{username}" already exists')
            )
            return
        
        # Create superuser
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            phone_number=phone,
            national_id=national_id,
            first_name=first_name,
            last_name=last_name
        )
        
        # Assign System Administrator role
        try:
            admin_role = Role.objects.get(name='System Administrator')
            user.assign_role(admin_role)
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully created superuser "{username}" with System Administrator role'
                )
            )
        except Role.DoesNotExist:
            self.stdout.write(
                self.style.WARNING(
                    f'Created superuser "{username}" but System Administrator role not found. '
                    f'Run create_initial_roles command first.'
                )
            )

