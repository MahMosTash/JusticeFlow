"""
Views for investigations app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.utils import timezone
from core.permissions import (
    IsDetective, IsSergeant, IsCaptain, IsPoliceChief, IsDetectiveOrSergeant
)
from .models import Suspect, Interrogation, GuiltScore, CaptainDecision
from .serializers import (
    SuspectSerializer, SuspectListSerializer,
    InterrogationSerializer, GuiltScoreSerializer,
    CaptainDecisionSerializer, CaptainDecisionCreateSerializer
)


class SuspectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Suspect management.
    """
    queryset = Suspect.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SuspectListSerializer
        return SuspectSerializer
    
    def get_queryset(self):
        """Filter suspects based on case and status."""
        queryset = Suspect.objects.select_related('case', 'user')
        
        # Filter by case
        case_id = self.request.query_params.get('case', None)
        if case_id:
            queryset = queryset.filter(case_id=case_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter for Most Wanted (Under Severe Surveillance)
        most_wanted = self.request.query_params.get('most_wanted', None)
        if most_wanted and most_wanted.lower() == 'true':
            queryset = queryset.filter(status='Under Severe Surveillance')
        
        return queryset
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action == 'create':
            return [IsDetectiveOrSergeant()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        """Create suspect and set surveillance start date."""
        suspect = serializer.save()
        if not suspect.surveillance_start_date:
            suspect.surveillance_start_date = timezone.now().date()
            suspect.save()
    
    @action(detail=True, methods=['post'], permission_classes=[IsDetectiveOrSergeant])
    def update_status(self, request, pk=None):
        """Update suspect status."""
        suspect = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {'error': 'status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        valid_statuses = [choice[0] for choice in Suspect.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        suspect.status = new_status
        if new_status == 'Arrested':
            suspect.arrest_date = timezone.now()
        elif new_status == 'Cleared':
            suspect.cleared_date = timezone.now()
        
        suspect.save()
        
        # Check for severe surveillance
        suspect.check_severe_surveillance()
        
        return Response(SuspectSerializer(suspect).data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def most_wanted(self, request):
        """Get Most Wanted suspects (ranked by formula)."""
        suspects = self.get_queryset().filter(
            status__in=['Under Investigation', 'Under Severe Surveillance']
        )
        
        # Calculate ranking for each suspect
        ranked_suspects = []
        for suspect in suspects:
            ranking = suspect.get_most_wanted_ranking()
            reward_amount = suspect.get_reward_amount()
            ranked_suspects.append({
                'suspect': SuspectSerializer(suspect).data,
                'ranking': ranking,
                'reward_amount': reward_amount
            })
        
        # Sort by ranking (descending)
        ranked_suspects.sort(key=lambda x: x['ranking'], reverse=True)
        
        return Response(ranked_suspects)


class InterrogationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Interrogation management.
    """
    queryset = Interrogation.objects.all()
    serializer_class = InterrogationSerializer
    permission_classes = [IsDetectiveOrSergeant]
    
    def get_queryset(self):
        """Filter interrogations."""
        queryset = Interrogation.objects.select_related('suspect', 'case', 'interrogator')
        
        # Filter by suspect
        suspect_id = self.request.query_params.get('suspect', None)
        if suspect_id:
            queryset = queryset.filter(suspect_id=suspect_id)
        
        # Filter by case
        case_id = self.request.query_params.get('case', None)
        if case_id:
            queryset = queryset.filter(case_id=case_id)
        
        return queryset
    
    def perform_create(self, serializer):
        """Create interrogation and set interrogator."""
        serializer.save(interrogator=self.request.user)


class GuiltScoreViewSet(viewsets.ModelViewSet):
    """
    ViewSet for GuiltScore management.
    """
    queryset = GuiltScore.objects.all()
    serializer_class = GuiltScoreSerializer

    def get_permissions(self):
        """
        Read (list/retrieve) → any authenticated user (captain needs to see scores).
        Write (create/update/delete) → Detective or Sergeant only.
        """
        if self.action in ('list', 'retrieve'):
            return [IsAuthenticated()]
        return [IsDetectiveOrSergeant()]

    def get_queryset(self):
        """Filter guilt scores."""
        queryset = GuiltScore.objects.select_related('suspect', 'case', 'assigned_by')

        # Filter by suspect
        suspect_id = self.request.query_params.get('suspect', None)
        if suspect_id:
            queryset = queryset.filter(suspect_id=suspect_id)

        # Filter by case
        case_id = self.request.query_params.get('case', None)
        if case_id:
            queryset = queryset.filter(case_id=case_id)

        return queryset

    def perform_create(self, serializer):
        """Create guilt score and set assigned_by."""
        serializer.save(assigned_by=self.request.user)


class CaptainDecisionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for CaptainDecision management.
    """
    queryset = CaptainDecision.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CaptainDecisionCreateSerializer
        return CaptainDecisionSerializer
    
    def get_queryset(self):
        """Filter decisions."""
        queryset = CaptainDecision.objects.select_related(
            'case', 'suspect', 'decided_by', 'chief_approved_by'
        )
        
        # Filter by case
        case_id = self.request.query_params.get('case', None)
        if case_id:
            queryset = queryset.filter(case_id=case_id)
        
        # Filter by suspect
        suspect_id = self.request.query_params.get('suspect', None)
        if suspect_id:
            queryset = queryset.filter(suspect_id=suspect_id)
        
        return queryset
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action == 'create':
            return [IsCaptain()]
        elif self.action == 'approve_chief':
            return [IsPoliceChief()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        """Create decision and set decided_by."""
        serializer.save(decided_by=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsPoliceChief])
    def approve_chief(self, request, pk=None):
        """Police Chief approves decision for critical crimes."""
        decision = self.get_object()
        
        if not decision.requires_chief_approval:
            return Response(
                {'error': 'This decision does not require Police Chief approval'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if decision.chief_approval is not None:
            return Response(
                {'error': 'Decision has already been approved/rejected by Police Chief'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        approval = request.data.get('approval', None)
        if approval is None:
            return Response(
                {'error': 'approval (true/false) is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        decision.chief_approval = bool(approval)
        decision.chief_approved_by = request.user
        decision.chief_approval_date = timezone.now()
        decision.save()
        
        return Response(CaptainDecisionSerializer(decision).data)

