"""
Views for complaints app with approval workflow.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from core.permissions import IsIntern, IsPoliceOfficer
from core.exceptions import WorkflowError
from .models import Complaint, ComplaintReview
from .serializers import (
    ComplaintSerializer, ComplaintCreateSerializer,
    ComplaintListSerializer, ComplaintReviewSerializer
)
from apps.cases.models import Case


class ComplaintViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Complaint management with approval workflow.
    """
    queryset = Complaint.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ComplaintCreateSerializer
        elif self.action == 'list':
            return ComplaintListSerializer
        return ComplaintSerializer
    
    def get_queryset(self):
        """Filter complaints based on user role."""
        queryset = Complaint.objects.select_related(
            'submitted_by', 'reviewed_by_intern', 'reviewed_by_officer', 'case'
        ).prefetch_related('reviews')
        
        # Complainants can see their own complaints
        if self.request.user.has_role('Complainant') or self.request.user.has_role('Basic User'):
            queryset = queryset.filter(submitted_by=self.request.user)
        
        # Interns can see pending complaints
        if self.request.user.has_role('Intern (Cadet)'):
            queryset = queryset.filter(status='Pending')
        
        # Police Officers can see complaints forwarded to them
        if self.request.user.has_role('Police Officer'):
            queryset = queryset.filter(status__in=['Under Review', 'Pending'])
        
        return queryset
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action == 'create':
            # Any authenticated user can submit a complaint
            return [IsAuthenticated()]
        elif self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Only submitter can update (for resubmission)
            return [IsAuthenticated()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        """Create complaint."""
        serializer.save(submitted_by=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsIntern])
    def review_as_intern(self, request, pk=None):
        """
        Intern reviews complaint.
        Can return (with error message) or forward to Police Officer.
        """
        complaint = self.get_object()
        
        if complaint.status != 'Pending':
            return Response(
                {'error': 'Complaint is not in Pending status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        action_type = request.data.get('action')  # 'return' or 'forward'
        comments = request.data.get('comments', '')
        
        if action_type == 'return':
            # Return to complainant with error message
            complaint.status = 'Pending'
            complaint.review_comments = comments
            complaint.reviewed_by_intern = request.user
            complaint.increment_submission_count()
            complaint.save()
            
            # Create review record
            ComplaintReview.objects.create(
                complaint=complaint,
                reviewer=request.user,
                action='Returned',
                comments=comments
            )
            
            return Response(
                ComplaintSerializer(complaint).data,
                status=status.HTTP_200_OK
            )
        
        elif action_type == 'forward':
            # Forward to Police Officer
            complaint.status = 'Under Review'
            complaint.reviewed_by_intern = request.user
            complaint.review_comments = comments
            complaint.save()
            
            # Create review record
            ComplaintReview.objects.create(
                complaint=complaint,
                reviewer=request.user,
                action='Forwarded',
                comments=comments
            )
            
            return Response(
                ComplaintSerializer(complaint).data,
                status=status.HTTP_200_OK
            )
        
        else:
            return Response(
                {'error': "action must be 'return' or 'forward'"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'], permission_classes=[IsPoliceOfficer])
    def review_as_officer(self, request, pk=None):
        """
        Police Officer reviews complaint.
        Can approve (creates case) or reject (returns to Intern).
        """
        complaint = self.get_object()
        
        if complaint.status != 'Under Review':
            return Response(
                {'error': 'Complaint is not in Under Review status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        action_type = request.data.get('action')  # 'approve' or 'reject'
        comments = request.data.get('comments', '')
        
        if action_type == 'approve':
            # Approve and create case
            with transaction.atomic():
                # Create case from complaint
                case = Case.objects.create(
                    title=complaint.title,
                    description=complaint.description,
                    severity='Level 3',  # Default, can be updated
                    status='Open',
                    created_by=request.user
                )
                
                # Add complainant to case
                from apps.cases.models import CaseComplainant
                CaseComplainant.objects.create(
                    case=case,
                    complainant=complaint.submitted_by
                )
                
                # Update complaint
                complaint.status = 'Approved'
                complaint.reviewed_by_officer = request.user
                complaint.review_comments = comments
                complaint.case = case
                complaint.save()
                
                # Create review record
                ComplaintReview.objects.create(
                    complaint=complaint,
                    reviewer=request.user,
                    action='Approved',
                    comments=comments
                )
            
            return Response(
                ComplaintSerializer(complaint).data,
                status=status.HTTP_200_OK
            )
        
        elif action_type == 'reject':
            # Reject and return to Intern
            complaint.status = 'Pending'
            complaint.reviewed_by_officer = request.user
            complaint.review_comments = comments
            complaint.save()
            
            # Create review record
            ComplaintReview.objects.create(
                complaint=complaint,
                reviewer=request.user,
                action='Rejected',
                comments=comments
            )
            
            return Response(
                ComplaintSerializer(complaint).data,
                status=status.HTTP_200_OK
            )
        
        else:
            return Response(
                {'error': "action must be 'approve' or 'reject'"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def resubmit(self, request, pk=None):
        """
        Complainant resubmits a returned complaint.
        """
        complaint = self.get_object()
        
        # Check if user is the submitter
        if complaint.submitted_by != request.user:
            return Response(
                {'error': 'You can only resubmit your own complaints'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if complaint can be resubmitted
        if not complaint.can_be_resubmitted():
            return Response(
                {'error': 'Complaint cannot be resubmitted (permanently rejected or max submissions reached)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update complaint
        complaint.title = request.data.get('title', complaint.title)
        complaint.description = request.data.get('description', complaint.description)
        complaint.status = 'Pending'
        complaint.review_comments = ''
        complaint.save()
        
        return Response(
            ComplaintSerializer(complaint).data,
            status=status.HTTP_200_OK
        )

