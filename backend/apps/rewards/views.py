"""
Views for rewards app with approval workflow.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from core.permissions import IsPoliceOfficer, IsDetective
from .models import RewardSubmission, Reward
from .serializers import (
    RewardSubmissionSerializer, RewardSubmissionCreateSerializer,
    RewardSerializer, RewardListSerializer
)


class RewardSubmissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for RewardSubmission management.
    """
    queryset = RewardSubmission.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return RewardSubmissionCreateSerializer
        return RewardSubmissionSerializer
    
    def get_queryset(self):
        """Filter submissions based on user role."""
        queryset = RewardSubmission.objects.select_related(
            'submitted_by', 'case', 'reviewed_by_officer', 'reviewed_by_detective'
        )
        
        # Basic users can see their own submissions
        if self.request.user.has_role('Basic User'):
            queryset = queryset.filter(submitted_by=self.request.user)
        
        # Police Officers can see pending and under review
        if self.request.user.has_role('Police Officer'):
            queryset = queryset.filter(status__in=['Pending', 'Under Review'])
        
        # Detectives can see approved submissions
        if self.request.user.has_role('Detective'):
            queryset = queryset.filter(status__in=['Under Review', 'Approved'])
        
        return queryset
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action == 'create':
            # Basic users can submit
            return [IsAuthenticated()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        """Create submission."""
        serializer.save(submitted_by=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsPoliceOfficer])
    def review_as_officer(self, request, pk=None):
        """
        Police Officer reviews submission.
        Can approve (forward to Detective) or reject.
        """
        submission = self.get_object()
        
        if submission.status != 'Pending':
            return Response(
                {'error': 'Submission is not in Pending status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        action_type = request.data.get('action')  # 'approve' or 'reject'
        comments = request.data.get('comments', '')
        
        if action_type == 'approve':
            # Forward to Detective
            submission.status = 'Under Review'
            submission.reviewed_by_officer = request.user
            submission.review_comments = comments
            submission.save()
            
            return Response(
                RewardSubmissionSerializer(submission).data,
                status=status.HTTP_200_OK
            )
        
        elif action_type == 'reject':
            # Reject
            submission.status = 'Rejected'
            submission.reviewed_by_officer = request.user
            submission.review_comments = comments
            submission.save()
            
            return Response(
                RewardSubmissionSerializer(submission).data,
                status=status.HTTP_200_OK
            )
        
        else:
            return Response(
                {'error': "action must be 'approve' or 'reject'"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'], permission_classes=[IsDetective])
    def review_as_detective(self, request, pk=None):
        """
        Detective reviews and approves submission.
        Creates reward with unique code if approved.
        """
        submission = self.get_object()
        
        if submission.status != 'Under Review':
            return Response(
                {'error': 'Submission is not in Under Review status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        action_type = request.data.get('action')  # 'approve' or 'reject'
        comments = request.data.get('comments', '')
        
        if action_type == 'approve':
            # Approve and create reward
            with transaction.atomic():
                submission.status = 'Approved'
                submission.reviewed_by_detective = request.user
                submission.review_comments = comments
                submission.save()
                
                # Create reward
                reward = Reward.objects.create(
                    submission=submission,
                    case=submission.case,
                    created_by=request.user
                )
            
            return Response(
                {
                    'submission': RewardSubmissionSerializer(submission).data,
                    'reward': RewardSerializer(reward).data
                },
                status=status.HTTP_201_CREATED
            )
        
        elif action_type == 'reject':
            # Reject
            submission.status = 'Rejected'
            submission.reviewed_by_detective = request.user
            submission.review_comments = comments
            submission.save()
            
            return Response(
                RewardSubmissionSerializer(submission).data,
                status=status.HTTP_200_OK
            )
        
        else:
            return Response(
                {'error': "action must be 'approve' or 'reject'"},
                status=status.HTTP_400_BAD_REQUEST
            )


class RewardViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Reward viewing (read-only for officers).
    """
    queryset = Reward.objects.all()
    serializer_class = RewardSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return RewardListSerializer
        return RewardSerializer
    
    def get_queryset(self):
        """Filter rewards."""
        queryset = Reward.objects.select_related(
            'submission', 'case', 'created_by'
        )
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by reward code
        reward_code = self.request.query_params.get('reward_code', None)
        if reward_code:
            queryset = queryset.filter(reward_code=reward_code)
        
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def claim(self, request, pk=None):
        """Claim reward (user provides code)."""
        reward = self.get_object()
        reward_code = request.data.get('reward_code', '')
        location = request.data.get('location', '')
        
        if reward_code != reward.reward_code:
            return Response(
                {'error': 'Invalid reward code'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if reward.status == 'Claimed':
            return Response(
                {'error': 'Reward has already been claimed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from django.utils import timezone
        reward.status = 'Claimed'
        reward.claimed_date = timezone.now()
        reward.claimed_at_location = location
        reward.save()
        
        return Response(RewardSerializer(reward).data)

