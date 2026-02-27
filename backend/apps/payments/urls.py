"""
URL configuration for payments app.

Endpoints:
  POST /payments/                          → Create bail/fine (sergeant only)
  GET  /payments/                          → List bail/fines
  GET  /payments/{id}/                     → Retrieve bail/fine detail
  POST /payments/{id}/request_payment/     → Initiate Zibal payment, returns redirect URL
  GET  /payments/{id}/payment_callback/    → Zibal calls this after payment (verify internally)
  POST /payments/{id}/payment_inquiry/     → Query Zibal for transaction status
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BailFineViewSet

router = DefaultRouter()
router.register(r'', BailFineViewSet, basename='bail-fine')

urlpatterns = [
    path('', include(router.urls)),
]
