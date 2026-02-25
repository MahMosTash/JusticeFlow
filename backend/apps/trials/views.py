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
    TrialSerializer, TrialCreateSerializer, TrialVerdictSerializer
)


class TrialViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Trial management.
    """
    queryset = Trial.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TrialCreateSerializer
        elif self.action == 'record_verdict':
            return TrialVerdictSerializer
        return TrialSerializer
    
    def get_queryset(self):
        """Filter trials."""
        queryset = Trial.objects.select_related('case', 'judge')
        
        # Judges can see their own trials
        if self.request.user.has_role('Judge'):
            queryset = queryset.filter(judge=self.request.user)
        
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
        """Set permissions based on action."""
        if self.action in ['create', 'record_verdict']:
            return [IsJudge()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        """Create trial and set judge."""
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
        
        # Update case status if verdict is recorded
        if trial.verdict:
            trial.case.status = 'Resolved'
            trial.case.resolution_date = trial.verdict_date
            trial.case.save()
        
        return Response(TrialSerializer(trial).data)

