"""
User and Role models for dynamic RBAC system.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class Role(models.Model):
    """
    Dynamic role model that can be created/modified at runtime.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'roles'
        ordering = ['name']
        verbose_name = 'Role'
        verbose_name_plural = 'Roles'
    
    def __str__(self):
        return self.name


class RoleAssignment(models.Model):
    """
    Links users to roles with temporal tracking.
    """
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='role_assignments')
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='role_assignments_made'
    )
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'role_assignments'
        unique_together = ['user', 'role']
        ordering = ['-assigned_at']
        verbose_name = 'Role Assignment'
        verbose_name_plural = 'Role Assignments'
    
    def __str__(self):
        return f'{self.user.username} - {self.role.name}'


class User(AbstractUser):
    """
    Custom user model with additional fields for police system.
    """
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, unique=True)
    national_id = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)
    
    # Relationships
    roles = models.ManyToManyField(
        Role,
        through='RoleAssignment',
        through_fields=('user', 'role'),
        related_name='users'
    )
    
    class Meta:
        db_table = 'users'
        ordering = ['-date_joined']
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f'{self.username} ({self.get_full_name()})'
    
    def get_full_name(self):
        """Return the full name of the user."""
        return f'{self.first_name} {self.last_name}'.strip()
    
    def get_short_name(self):
        """Return the short name of the user."""
        return self.first_name
    
    def has_role(self, role_name):
        """
        Check if user has a specific role (active assignment).
        
        Args:
            role_name: Name of the role to check
            
        Returns:
            bool: True if user has the role, False otherwise
        """
        return self.role_assignments.filter(
            role__name=role_name,
            is_active=True,
            role__is_active=True
        ).exists()
    
    def has_any_role(self, role_names):
        """
        Check if user has any of the specified roles.
        
        Args:
            role_names: List of role names to check
            
        Returns:
            bool: True if user has any of the roles, False otherwise
        """
        return self.role_assignments.filter(
            role__name__in=role_names,
            is_active=True,
            role__is_active=True
        ).exists()
    
    def get_active_roles(self):
        """
        Get all active roles for the user.
        
        Returns:
            QuerySet: Active roles
        """
        return Role.objects.filter(
            assignments__user=self,
            assignments__is_active=True,
            is_active=True
        ).distinct()
    
    def assign_role(self, role, assigned_by=None):
        """
        Assign a role to the user.
        
        Args:
            role: Role instance or role name
            assigned_by: User who is making the assignment
            
        Returns:
            RoleAssignment: The created assignment
        """
        if isinstance(role, str):
            role = Role.objects.get(name=role)
        
        assignment, created = RoleAssignment.objects.get_or_create(
            user=self,
            role=role,
            defaults={
                'assigned_by': assigned_by,
                'is_active': True
            }
        )
        
        if not created:
            assignment.is_active = True
            assignment.assigned_by = assigned_by
            assignment.save()
        
        if getattr(role, 'name', role) != 'Basic User':
            try:
                basic_role = Role.objects.get(name='Basic User')
                RoleAssignment.objects.filter(user=self, role=basic_role).update(is_active=False)
            except Role.DoesNotExist:
                pass
                
        return assignment
    
    def remove_role(self, role):
        """
        Remove a role from the user (deactivate assignment).
        
        Args:
            role: Role instance or role name
        """
        if isinstance(role, str):
            role = Role.objects.get(name=role)
        
        RoleAssignment.objects.filter(
            user=self,
            role=role
        ).update(is_active=False)

