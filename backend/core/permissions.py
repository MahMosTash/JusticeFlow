"""
Base permission classes for the Police Case Management System.
"""
from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner
        return obj.created_by == request.user


class HasRolePermission(permissions.BasePermission):
    """
    Base permission class that checks if user has a specific role.
    Subclasses should define the required_role attribute.
    """
    required_role = None
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if self.required_role is None:
            return True
        
        return request.user.has_role(self.required_role)


class HasAnyRolePermission(permissions.BasePermission):
    """
    Permission class that checks if user has any of the specified roles.
    """
    required_roles = []
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not self.required_roles:
            return True
        
        return request.user.has_any_role(self.required_roles)


class IsSystemAdministrator(permissions.BasePermission):
    """
    Permission class for System Administrator role.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.has_role('System Administrator')
        )


class IsPoliceChief(permissions.BasePermission):
    """
    Permission class for Police Chief role.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.has_role('Police Chief')
        )


class IsCaptain(permissions.BasePermission):
    """
    Permission class for Captain role.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.has_role('Captain')
        )


class IsSergeant(permissions.BasePermission):
    """
    Permission class for Sergeant role.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.has_role('Sergeant')
        )


class IsDetective(permissions.BasePermission):
    """
    Permission class for Detective role.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.has_role('Detective')
        )


class IsPoliceOfficer(permissions.BasePermission):
    """
    Permission class for Police Officer role.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.has_role('Police Officer')
        )


class IsPatrolOfficer(permissions.BasePermission):
    """
    Permission class for Patrol Officer role.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.has_role('Patrol Officer')
        )


class IsIntern(permissions.BasePermission):
    """
    Permission class for Intern (Cadet) role.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.has_role('Intern (Cadet)')
        )


class IsForensicDoctor(permissions.BasePermission):
    """
    Permission class for Forensic Doctor role.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.has_role('Forensic Doctor')
        )


class IsJudge(permissions.BasePermission):
    """
    Permission class for Judge role.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.has_role('Judge')
        )


class IsDetectiveOrSergeant(permissions.BasePermission):
    """Permission for Detective or Sergeant."""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.has_role('Detective') or request.user.has_role('Sergeant'))
        )


class IsPoliceOfficerOrPatrolOfficerOrChief(permissions.BasePermission):
    """Permission for Police Officer, Patrol Officer, or Police Chief."""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.has_role('Police Officer') or
             request.user.has_role('Patrol Officer') or
             request.user.has_role('Police Chief'))
        )

