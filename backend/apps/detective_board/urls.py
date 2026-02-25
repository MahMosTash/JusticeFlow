"""
URL configuration for detective board app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DetectiveBoardViewSet

router = DefaultRouter()
router.register(r'', DetectiveBoardViewSet, basename='detective-board')

urlpatterns = [
    path('', include(router.urls)),
]

