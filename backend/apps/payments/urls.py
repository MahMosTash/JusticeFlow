"""
URL configuration for payments app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BailFineViewSet

router = DefaultRouter()
router.register(r'', BailFineViewSet, basename='bail-fine')

urlpatterns = [
    path('', include(router.urls)),
]

