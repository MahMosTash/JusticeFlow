"""
Views for trials app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.permissions import IsJudge
from .models import Trial
from .serializers import (
    TrialSerializer, TrialListSerializer, TrialCreateSerializer, TrialVerdictSerializer
)


class TrialViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Trial management.
    - List: lightweight (TrialListSerializer)
    - Retrieve: full dossier (TrialSerializer)
    - Create: judge creates trial for a case
    - record_verdict: judge records Guilty / Not Guilty + punishment
    """
    queryset = Trial.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return TrialCreateSerializer
        elif self.action == 'record_verdict':
            return TrialVerdictSerializer
        elif self.action == 'list':
            return TrialListSerializer
        return TrialSerializer

    def get_queryset(self):
        """All authenticated users can list trials; Judge owns their own."""
        queryset = Trial.objects.select_related('case', 'judge')

        # Filter by case
        case_id = self.request.query_params.get('case', None)
        if case_id:
            queryset = queryset.filter(case_id=case_id)

        # Filter by verdict
        verdict = self.request.query_params.get('verdict', None)
        if verdict:
            queryset = queryset.filter(verdict=verdict)

        return queryset

    def get_permissions(self):
        if self.action in ('create', 'record_verdict', 'update', 'partial_update', 'destroy'):
            return [IsJudge()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(judge=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsJudge])
    def record_verdict(self, request, pk=None):
        """Judge records verdict and punishment."""
        trial = self.get_object()

        if trial.judge != request.user:
            return Response(
                {'error': 'You can only record verdict for your own trials'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        if trial.is_complete():
            return Response(
                {'error': 'Trial verdict has already been recorded'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(trial, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Mark case as Resolved
        if trial.verdict:
            trial.case.status = 'Resolved'
            trial.case.resolution_date = trial.verdict_date
            trial.case.save()

        return Response(TrialSerializer(trial, context={'request': request}).data)
