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

        # Allow if the judge owns the trial OR if the trial is completely unassigned
        if trial.judge and trial.judge != request.user:
            return Response(
                {'error': 'You can only record verdict for your own trials'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        # If unassigned, claim it for this judge
        if not trial.judge:
            trial.judge = request.user
            trial.save()
            
        if trial.is_complete():
            return Response(
                {'error': 'Trial verdict has already been recorded'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(trial, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        # Pop the explicit fine_amount which isn't part of the Trial model
        fine_amount = serializer.validated_data.pop('fine_amount', None)
        
        serializer.save()

        # Mark case as Resolved
        if trial.verdict:
            trial.case.status = 'Resolved'
            trial.case.resolution_date = trial.verdict_date
            trial.case.save()
            
            # If Guilty, see if a fine was requested and create a Fine payment ticket
            if trial.verdict == 'Guilty' and fine_amount and fine_amount > 0:
                from apps.payments.models import BailFine
                from apps.investigations.models import Suspect
                
                # We need a suspect to attach the fine to. 
                # Grab the first active suspect of the case for simplicity.
                # If there are multiple, in a more complex setup you'd have a suspect-specific verdict form.
                suspect = Suspect.objects.filter(case=trial.case).first()
                if suspect:
                    # Update suspect status
                    suspect.status = 'Convicted'
                    suspect.save()
                    
                    # Create the Fine Ticket
                    BailFine.objects.create(
                        case=trial.case,
                        suspect=suspect,
                        amount=fine_amount,
                        type='Fine',
                        status='Pending',
                        set_by=request.user
                    )

        return Response(TrialSerializer(trial, context={'request': request}).data)
