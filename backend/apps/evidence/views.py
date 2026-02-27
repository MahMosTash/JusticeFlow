# backend/apps/evidence/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.utils import timezone

from core.permissions import IsForensicDoctor
from .models import Evidence
from .serializers import EvidenceSerializer, EvidenceVerificationSerializer
from apps.accounts.models import User

class EvidenceViewSet(viewsets.ModelViewSet):
    serializer_class = EvidenceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Evidence.objects.select_related(
            'case', 'recorded_by', 'verified_by_forensic_doctor'
        ).all()

        case_id = self.request.query_params.get('case')
        if case_id:
            queryset = queryset.filter(case_id=case_id)

        evidence_type = self.request.query_params.get('evidence_type')
        if evidence_type:
            queryset = queryset.filter(evidence_type=evidence_type)

        verified = self.request.query_params.get('verified')
        if verified is not None:
            if verified.lower() == 'true':
                queryset = queryset.filter(verified_by_forensic_doctor__isnull=False)
            elif verified.lower() == 'false':
                queryset = queryset.filter(verified_by_forensic_doctor__isnull=True)

        return queryset

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsForensicDoctor])
    def verify(self, request, pk=None):
        """
        Forensic doctors can verify OR update their review at any time.
        Removing the one-shot block so doctors can refine comments.
        """
        evidence = self.get_object()

        if evidence.evidence_type != 'biological':
            return Response(
                {'error': 'Only biological evidence can be verified by a forensic doctor.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = EvidenceVerificationSerializer(
            evidence, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)

        # Resolve doctor by national_id supplied, or fall back to the requesting user
        national_id = request.data.get('verified_by_national_id', '').strip()
        doctor = request.user
        if national_id:
            try:
                doctor = User.objects.get(national_id=national_id)
            except User.DoesNotExist:
                return Response(
                    {'error': 'No user found with that national ID.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        is_first_verification = evidence.verified_by_forensic_doctor is None

        evidence.verified_by_forensic_doctor = doctor
        evidence.verified_by_national_id = national_id or request.user.national_id
        evidence.verification_date = timezone.now()
        evidence.verification_notes = request.data.get(
            'verification_notes', evidence.verification_notes
        )
        evidence.save()

        # Notify the detective assigned to the case only on first verification
        # (re-submissions send a lighter "updated" notification)
        case = evidence.case
        detective = getattr(case, 'assigned_detective', None)
        if detective:
            if is_first_verification:
                title = 'Biological Evidence Verified'
                message = (
                    f'Dr. {doctor.full_name or doctor.username} has verified '
                    f'biological evidence "{evidence.title}" for case "{case.title}".'
                )
            else:
                title = 'Forensic Review Updated'
                message = (
                    f'Dr. {doctor.full_name or doctor.username} has updated their '
                    f'review of biological evidence "{evidence.title}" for case "{case.title}".'
                )

        return Response(EvidenceSerializer(evidence).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsForensicDoctor])
    def unanswered_biological(self, request):
        """
        Returns all biological evidence that has NOT yet been reviewed
        by any forensic doctor.  This is the doctor's primary work queue.
        """
        queryset = Evidence.objects.filter(
            evidence_type='biological',
            verified_by_forensic_doctor__isnull=True,
        ).select_related('case', 'recorded_by').order_by('-created_date')

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        from django.db.models import Count
        type_counts = (
            Evidence.objects.values('evidence_type')
            .annotate(count=Count('id'))
        )
        result = {}
        type_display = dict(Evidence.EVIDENCE_TYPES)
        for item in type_counts:
            t = item['evidence_type']
            result[t] = {
                'display_name': type_display.get(t, t),
                'count': item['count'],
            }
        return Response(result)
