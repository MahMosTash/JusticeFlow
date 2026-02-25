"""
URL configuration for investigations app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SuspectViewSet, InterrogationViewSet,
    GuiltScoreViewSet, CaptainDecisionViewSet
)

router = DefaultRouter()
router.register(r'suspects', SuspectViewSet, basename='suspect')
router.register(r'interrogations', InterrogationViewSet, basename='interrogation')
router.register(r'guilt-scores', GuiltScoreViewSet, basename='guilt-score')
router.register(r'captain-decisions', CaptainDecisionViewSet, basename='captain-decision')

urlpatterns = [
    path('', include(router.urls)),
]

