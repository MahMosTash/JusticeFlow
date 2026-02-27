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
        """Create evidence — resolve case from request data (accepts both 'case' and 'case_id')."""
        from apps.cases.models import Case
        
        # Accept both field names: case_id (new) or case (legacy)
        case_id = (
            self.request.data.get('case_id')
            or self.request.data.get('case')
        )
        
        if not case_id:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'case_id': 'Case is required.'})
        
        try:
            case = Case.objects.get(pk=int(case_id))
        except (Case.DoesNotExist, ValueError, TypeError):
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'case_id': f'Invalid case ID: {case_id}'})
        
        evidence = serializer.save(
            recorded_by=self.request.user,
            case=case,
        )
        
        # Auto-create Witness record if this is a witness statement
        if evidence.evidence_type == 'witness_statement':
            from apps.cases.models import CaseWitness
            from apps.accounts.models import User
            
            w_name = evidence.witness_name
            w_national_id = evidence.witness_national_id
            w_phone = evidence.witness_phone
            
            # 1. Try to find a matching system user by national ID
            witness_user = None
            if w_national_id:
                witness_user = User.objects.filter(national_id=w_national_id).first()
            
            # 2. Logic for CaseWitness creation
            if witness_user:
                # Registered User
                CaseWitness.objects.update_or_create(
                    case=case,
                    witness=witness_user,
                    defaults={
                        'witness_name': w_name or witness_user.get_full_name(),
                        'witness_national_id': w_national_id or witness_user.national_id,
                        'witness_phone': w_phone or witness_user.phone_number,
                        'notes': f"Added via Witness Statement: {evidence.title}"
                    }
                )
            elif w_national_id or w_name:
                # External Witness (at least one identifier provided - unique by case+national_id if ID exists)
                lookup_keys = {'case': case}
                if w_national_id:
                    lookup_keys['witness_national_id'] = w_national_id
                else:
                    lookup_keys['witness_name'] = w_name
                
                CaseWitness.objects.update_or_create(
                    **lookup_keys,
                    defaults={
                        'witness_name': w_name or "Unknown Witness",
                        'witness_phone': w_phone,
                        'notes': f"Added via Witness Statement: {evidence.title}"
                    }
                )
            
        # Send Notification to Detective
        if case.assigned_detective:
            from core.models import Notification
            
            # Avoid sending notification if the detective themself is the one uploading It
            if case.assigned_detective != self.request.user:
                Notification.objects.create(
                    user=case.assigned_detective,
                    type='new_evidence',
                    title='New Evidence Added',
                    message=f'New "{evidence.get_evidence_type_display()}" evidence ({evidence.title}) was just added to Case #{case.id}.',
                    related_case=case
                )
    
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

