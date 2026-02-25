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
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nSuccessfully created {created_count} new roles. '
                f'Total roles: {Role.objects.count()}'
            )
        )

