"""
URL configuration for rewards app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RewardSubmissionViewSet, RewardViewSet

router = DefaultRouter()
router.register(r'submissions', RewardSubmissionViewSet, basename='reward-submission')
router.register(r'', RewardViewSet, basename='reward')

urlpatterns = [
    path('', include(router.urls)),
]

