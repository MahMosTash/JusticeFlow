from rest_framework.routers import DefaultRouter
from .views import EvidenceViewSet, EvidenceCommentViewSet

router = DefaultRouter()
router.register(r'evidence', EvidenceViewSet, basename='evidence')
router.register(r'evidence-comments', EvidenceCommentViewSet, basename='evidence-comments')

urlpatterns = router.urls
