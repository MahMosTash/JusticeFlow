"""
Views for evidence app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from core.permissions import IsForensicDoctor
from .models import Evidence
from .serializers import (
    EvidenceSerializer, EvidenceListSerializer, EvidenceVerificationSerializer
)


class EvidenceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Evidence management.
    """
    queryset = Evidence.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EvidenceListSerializer
        elif self.action == 'verify':
            return EvidenceVerificationSerializer
        return EvidenceSerializer
    
    def get_queryset(self):
        """Filter evidence based on case and type."""
        queryset = Evidence.objects.select_related(
            'case', 'recorded_by', 'verified_by_forensic_doctor'
        )
        
        # Filter by case
        case_id = self.request.query_params.get('case', None)
        if case_id:
            queryset = queryset.filter(case_id=case_id)
        
        # Filter by evidence type
        evidence_type = self.request.query_params.get('evidence_type', None)
        if evidence_type:
            queryset = queryset.filter(evidence_type=evidence_type)
        
        # Filter by verification status (for biological evidence)
        verified = self.request.query_params.get('verified', None)
        if verified is not None:
            if verified.lower() == 'true':
                queryset = queryset.filter(
                    evidence_type='biological',
                    verified_by_forensic_doctor__isnull=False
                )
            else:
                queryset = queryset.filter(
                    evidence_type='biological',
                    verified_by_forensic_doctor__isnull=True
                )
        
        return queryset
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action == 'verify':
            return [IsForensicDoctor()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        """Create evidence and set recorded_by."""
        serializer.save(recorded_by=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsForensicDoctor])
    def verify(self, request, pk=None):
        """
        Verify biological evidence (Forensic Doctor only).
        """
        evidence = self.get_object()
        
        if evidence.evidence_type != 'biological':
            return Response(
                {'error': 'Only biological evidence can be verified'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if evidence.is_verified():
            return Response(
                {'error': 'Evidence is already verified'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(evidence, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Create notification for detective if case has one
        if evidence.case.assigned_detective:
            from core.models import Notification
            Notification.objects.create(
                user=evidence.case.assigned_detective,
                type='new_evidence',
                title='Evidence Verified',
                message=f'Biological evidence "{evidence.title}" has been verified.',
                related_case=evidence.case
            )
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def by_type(self, request):
        """Get evidence grouped by type."""
        evidence_types = Evidence.EVIDENCE_TYPE_CHOICES
        result = {}
        
        for evidence_type, display_name in evidence_types:
            count = self.get_queryset().filter(evidence_type=evidence_type).count()
            result[evidence_type] = {
                'display_name': display_name,
                'count': count
            }
        
        return Response(result)

