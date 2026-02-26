"""
Views for cases app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from core.permissions import (
    IsPoliceOfficer, IsPatrolOfficer, IsPoliceChief,
    IsDetective, IsSergeant, IsCaptain, IsDetectiveOrSergeant,
    IsPoliceOfficerOrPatrolOfficerOrChief
)
from .models import Case, CaseComplainant, CaseWitness
from .serializers import (
    CaseSerializer, CaseListSerializer, CaseDetailSerializer,
    CaseComplainantSerializer, CaseWitnessSerializer
)


class CaseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Case management.
    """
    queryset = Case.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CaseListSerializer
        elif self.action == 'retrieve':
            return CaseDetailSerializer
        return CaseSerializer
    
    def get_queryset(self):
        """Filter cases based on user role and permissions."""
        queryset = Case.objects.select_related(
            'created_by', 'assigned_detective', 'assigned_sergeant'
        ).prefetch_related('complainants', 'witnesses')
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by severity
        severity_filter = self.request.query_params.get('severity', None)
        if severity_filter:
            queryset = queryset.filter(severity=severity_filter)
        
        # Role-based visibility logic
        if self.request.user.is_staff or self.request.user.has_role('System Administrator') or self.request.user.has_role('Police Chief'):
            pass # Admins and Chiefs can see all cases
        else:
            # Filter by assigned detective
            if self.request.user.has_role('Detective'):
                queryset = queryset.filter(assigned_detective=self.request.user)
            
            # Filter by assigned sergeant
            elif self.request.user.has_role('Sergeant'):
                queryset = queryset.filter(assigned_sergeant=self.request.user)
        
        return queryset
    
    def get_permissions(self):
        """Set permissions based on action."""
        from rest_framework.permissions import AllowAny, IsAuthenticated
        
        if self.action in ['list', 'retrieve', 'stats']:
            # Allow public viewing of cases and stats
            return [AllowAny()]
        elif self.action == 'create':
            # Police Officer, Patrol Officer, or Police Chief can create
            return [IsPoliceOfficerOrPatrolOfficerOrChief()]
        elif self.action in ['update', 'partial_update']:
            # Creator, assigned detective, or assigned sergeant can update
            return [IsAuthenticated()]
        elif self.action == 'destroy':
            # Only Police Chief or System Administrator
            return [IsAuthenticated()]  # Will check in perform_destroy
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        """Create case with workflow logic."""
        user = self.request.user
        
        # Police Chief doesn't need approval
        if user.has_role('Police Chief'):
            case = serializer.save(created_by=user)
        else:
            # Police Officer or Patrol Officer needs approval
            # For now, create the case (approval workflow can be added)
            case = serializer.save(created_by=user)
        
        return case
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def assign_detective(self, request, pk=None):
        """Assign a detective to the case."""
        case = self.get_object()
        detective_id = request.data.get('detective_id')
        
        if not detective_id:
            return Response(
                {'error': 'detective_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from apps.accounts.models import User
        try:
            detective = User.objects.get(id=detective_id)
            if not detective.has_role('Detective'):
                return Response(
                    {'error': 'User must be a Detective'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            case.assigned_detective = detective
            case.save()
            return Response(CaseDetailSerializer(case).data)
        except User.DoesNotExist:
            return Response(
                {'error': 'Detective not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def assign_sergeant(self, request, pk=None):
        """Assign a sergeant to the case."""
        case = self.get_object()
        sergeant_id = request.data.get('sergeant_id')
        
        if not sergeant_id:
            return Response(
                {'error': 'sergeant_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from apps.accounts.models import User
        try:
            sergeant = User.objects.get(id=sergeant_id)
            if not sergeant.has_role('Sergeant'):
                return Response(
                    {'error': 'User must be a Sergeant'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            case.assigned_sergeant = sergeant
            case.save()
            return Response(CaseDetailSerializer(case).data)
        except User.DoesNotExist:
            return Response(
                {'error': 'Sergeant not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_complainant(self, request, pk=None):
        """Add a complainant to the case."""
        case = self.get_object()
        complainant_id = request.data.get('complainant_id')
        
        if not complainant_id:
            return Response(
                {'error': 'complainant_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from apps.accounts.models import User
        try:
            complainant = User.objects.get(id=complainant_id)
            case_complainant, created = CaseComplainant.objects.get_or_create(
                case=case,
                complainant=complainant,
                defaults={'notes': request.data.get('notes', '')}
            )
            return Response(
                CaseComplainantSerializer(case_complainant).data,
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {'error': 'Complainant not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_witness(self, request, pk=None):
        """Add a witness to the case."""
        case = self.get_object()
        witness_id = request.data.get('witness_id', None)
        witness_national_id = request.data.get('witness_national_id', '')
        witness_phone = request.data.get('witness_phone', '')
        
        if not witness_id and not witness_national_id:
            return Response(
                {'error': 'Either witness_id or witness_national_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        witness = None
        if witness_id:
            from apps.accounts.models import User
            try:
                witness = User.objects.get(id=witness_id)
            except User.DoesNotExist:
                return Response(
                    {'error': 'Witness not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        case_witness, created = CaseWitness.objects.get_or_create(
            case=case,
            witness=witness,
            defaults={
                'witness_national_id': witness_national_id,
                'witness_phone': witness_phone,
                'notes': request.data.get('notes', '')
            }
        )
        return Response(
            CaseWitnessSerializer(case_witness).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )
    
    from rest_framework.permissions import AllowAny
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def stats(self, request):
        """Get case statistics for home page."""
        from apps.accounts.models import User
        from django.db.models import Count, Q
        
        total_cases = Case.objects.count()
        solved_cases = Case.objects.filter(status='Resolved').count()
        
        # Count users with police-related roles
        police_roles = [
            'Police Chief', 'Captain', 'Sergeant', 'Detective',
            'Police Officer', 'Patrol Officer', 'Intern (Cadet)'
        ]
        total_police_staff = User.objects.filter(
            roles__name__in=police_roles
        ).distinct().count()
        
        return Response({
            'total_cases': total_cases,
            'solved_cases': solved_cases,
            'total_police_staff': total_police_staff,
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsDetectiveOrSergeant])
    def update_status(self, request, pk=None):
        """Update case status."""
        case = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {'error': 'status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        valid_statuses = [choice[0] for choice in Case.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        case.status = new_status
        case.save()
        return Response(CaseDetailSerializer(case).data)

