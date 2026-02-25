"""
Custom exceptions for the Police Case Management System.
"""
from rest_framework.exceptions import APIException
from rest_framework import status


class WorkflowError(APIException):
    """
    Exception raised when workflow rules are violated.
    """
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Workflow rule violation.'
    default_code = 'workflow_error'


class PermissionDenied(APIException):
    """
    Exception raised when user lacks required permissions.
    """
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'You do not have permission to perform this action.'
    default_code = 'permission_denied'


class ValidationError(APIException):
    """
    Exception raised when validation fails.
    """
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Validation error.'
    default_code = 'validation_error'


class NotFoundError(APIException):
    """
    Exception raised when resource is not found.
    """
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Resource not found.'
    default_code = 'not_found'

