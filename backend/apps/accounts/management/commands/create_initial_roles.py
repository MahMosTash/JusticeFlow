"""
Management command to create initial roles.
"""
from django.core.management.base import BaseCommand
from apps.accounts.models import Role, User


class Command(BaseCommand):
    help = 'Create initial roles for the Police Case Management System'
    
    def handle(self, *args, **options):
        roles = [
            'System Administrator',
            'Police Chief',
            'Captain',
            'Sergeant',
            'Detective',
            'Police Officer',
            'Patrol Officer',
            'Intern (Cadet)',
            'Forensic Doctor',
            'Judge',
            'Complainant',
            'Witness',
            'Suspect',
            'Criminal',
            'Basic User',
        ]
        
        created_count = 0
        for role_name in roles:
            role, created = Role.objects.get_or_create(
                name=role_name,
                defaults={'description': f'{role_name} role', 'is_active': True}
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created role: {role_name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Role already exists: {role_name}')
                )
        
        # Create default admin user
        admin_user = User.objects.filter(username='admin').first()
        if not admin_user:
            import uuid
            suffix = str(uuid.uuid4())[:8]
            email = 'admin@admin.com' if not User.objects.filter(email='admin@admin.com').exists() else f'admin_{suffix}@admin.com'
            phone = '0000000000' if not User.objects.filter(phone_number='0000000000').exists() else suffix
            nat_id = '0000000000' if not User.objects.filter(national_id='0000000000').exists() else suffix
            
            admin_user = User.objects.create_superuser(
                username='admin',
                email=email,
                password='admin',
                first_name='System',
                last_name='Administrator',
                phone_number=phone,
                national_id=nat_id
            )
            self.stdout.write(self.style.SUCCESS('Created default admin user (username: admin, password: admin)'))
        else:
            admin_user.set_password('admin')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('Reset default admin user password to admin'))
            
        admin_user.assign_role('System Administrator')

        # Create other default users for testing
        default_users = [
            {'username': 'intern', 'role': 'Intern (Cadet)', 'first': 'Test', 'last': 'Intern'},
            {'username': 'officer', 'role': 'Police Officer', 'first': 'Test', 'last': 'Officer'},
            {'username': 'detective', 'role': 'Detective', 'first': 'Test', 'last': 'Detective'},
            {'username': 'sergeant', 'role': 'Sergeant', 'first': 'Test', 'last': 'Sergeant'},
            {'username': 'captain', 'role': 'Captain', 'first': 'Test', 'last': 'Captain'},
            {'username': 'chief', 'role': 'Police Chief', 'first': 'Test', 'last': 'Chief'},
            {'username': 'judge', 'role': 'Judge', 'first': 'Test', 'last': 'Judge'},
            {'username': 'doctor', 'role': 'Forensic Doctor', 'first': 'Test', 'last': 'Doctor'},
            {'username': 'user', 'role': 'Basic User', 'first': 'Test', 'last': 'User'},
        ]
        
        for u_data in default_users:
            uname = u_data['username']
            user_obj = User.objects.filter(username=uname).first()
            if not user_obj:
                import uuid
                suffix = str(uuid.uuid4())[:8]
                user_obj = User.objects.create_user(
                    username=uname,
                    email=f'{uname}_{suffix}@example.com',
                    password='1234',
                    first_name=u_data['first'],
                    last_name=u_data['last'],
                    phone_number=f'100000{suffix[:4]}',
                    national_id=f'200000{suffix[:4]}'
                )
                self.stdout.write(self.style.SUCCESS(f'Created default user (username: {uname}, password: 1234)'))
            else:
                user_obj.set_password('1234')
                user_obj.save()
                self.stdout.write(self.style.SUCCESS(f'Reset {uname} password to 1234'))
            
            user_obj.assign_role(u_data['role'])
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nSuccessfully created {created_count} new roles. '
                f'Total roles: {Role.objects.count()}'
            )
        )

