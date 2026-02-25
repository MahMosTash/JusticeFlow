"""
Reusable mixins for views and serializers.
"""
from rest_framework.response import Response
from rest_framework import status


class CreateModelMixin:
    """
    Mixin to automatically set created_by field.
    """
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class UpdateModelMixin:
    """
    Mixin to automatically set updated_by field.
    """
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

