"""
Views for detective board app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.permissions import IsDetective, IsSergeant
from .models import DetectiveBoard, BoardEvidenceConnection
from .serializers import (
    DetectiveBoardSerializer, DetectiveBoardDetailSerializer,
    BoardEvidenceConnectionSerializer
)
from apps.cases.models import Case


class DetectiveBoardViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Detective Board management.
    """
    queryset = DetectiveBoard.objects.all()
    permission_classes = [IsDetective]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DetectiveBoardDetailSerializer
        return DetectiveBoardSerializer
    
    def get_queryset(self):
        """Filter boards by detective."""
        queryset = DetectiveBoard.objects.select_related('case', 'detective', 'last_modified_by')
        
        # Detectives can only see their own boards
        if self.request.user.has_role('Detective'):
            queryset = queryset.filter(detective=self.request.user)
        
        # Filter by case
        case_id = self.request.query_params.get('case', None)
        if case_id:
            queryset = queryset.filter(case_id=case_id)
        
        return queryset
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['list', 'retrieve', 'create', 'update', 'partial_update']:
            return [IsDetective()]
        elif self.action == 'review':
            return [IsSergeant()]
        return [IsDetective()]
    
    def perform_create(self, serializer):
        """Create board and set detective."""
        serializer.save(
            detective=self.request.user,
            last_modified_by=self.request.user
        )
    
    def perform_update(self, serializer):
        """Update board and set last_modified_by."""
        serializer.save(last_modified_by=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsDetective])
    def add_connection(self, request, pk=None):
        """Add a connection between evidence items."""
        board = self.get_object()
        source_evidence_id = request.data.get('source_evidence_id')
        target_evidence_id = request.data.get('target_evidence_id')
        connection_type = request.data.get('connection_type', 'related_to')
        notes = request.data.get('notes', '')
        
        if not source_evidence_id or not target_evidence_id:
            return Response(
                {'error': 'source_evidence_id and target_evidence_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from apps.evidence.models import Evidence
        try:
            source_evidence = Evidence.objects.get(id=source_evidence_id, case=board.case)
            target_evidence = Evidence.objects.get(id=target_evidence_id, case=board.case)
            
            connection, created = BoardEvidenceConnection.objects.get_or_create(
                board=board,
                source_evidence=source_evidence,
                target_evidence=target_evidence,
                defaults={
                    'connection_type': connection_type,
                    'notes': notes
                }
            )
            
            if not created:
                connection.connection_type = connection_type
                connection.notes = notes
                connection.save()
            
            return Response(
                BoardEvidenceConnectionSerializer(connection).data,
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
            )
        except Evidence.DoesNotExist:
            return Response(
                {'error': 'Evidence not found or does not belong to this case'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'], permission_classes=[IsDetective])
    def propose_suspect(self, request, pk=None):
        """Propose a suspect from the detective board."""
        board = self.get_object()
        suspect_id = request.data.get('suspect_id')
        user_id = request.data.get('user_id')
        name = request.data.get('name', '')
        national_id = request.data.get('national_id', '')
        phone_number = request.data.get('phone_number', '')
        
        if not suspect_id and not (user_id or name):
            return Response(
                {'error': 'Either suspect_id, user_id, or name is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from apps.investigations.models import Suspect
        from apps.accounts.models import User
        
        suspect = None
        if suspect_id:
            try:
                suspect = Suspect.objects.get(id=suspect_id, case=board.case)
            except Suspect.DoesNotExist:
                return Response(
                    {'error': 'Suspect not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Create new suspect
            user = None
            if user_id:
                try:
                    user = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    return Response(
                        {'error': 'User not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            
            suspect = Suspect.objects.create(
                case=board.case,
                user=user,
                name=name,
                national_id=national_id,
                phone_number=phone_number
            )
        
        return Response(
            {'message': 'Suspect proposed successfully', 'suspect_id': suspect.id},
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsSergeant])
    def review(self, request, pk=None):
        """Sergeant reviews detective board and approves/rejects suspect proposal."""
        board = self.get_object()
        action_type = request.data.get('action')  # 'approve' or 'reject'
        suspect_id = request.data.get('suspect_id')
        comments = request.data.get('comments', '')
        
        if not action_type or not suspect_id:
            return Response(
                {'error': 'action and suspect_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from apps.investigations.models import Suspect
        try:
            suspect = Suspect.objects.get(id=suspect_id, case=board.case)
        except Suspect.DoesNotExist:
            return Response(
                {'error': 'Suspect not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if action_type == 'approve':
            # Approve - arrest begins
            suspect.status = 'Arrested'
            from django.utils import timezone
            suspect.arrest_date = timezone.now()
            suspect.save()
            return Response({'message': 'Suspect approved, arrest begins'})
        elif action_type == 'reject':
            # Reject - case remains open
            return Response({'message': 'Suspect proposal rejected, case remains open'})
        else:
            return Response(
                {'error': "action must be 'approve' or 'reject'"},
                status=status.HTTP_400_BAD_REQUEST
            )

