"""
Serializers for rewards app.
"""
from rest_framework import serializers
from apps.rewards.models import RewardSubmission, Reward
from apps.accounts.serializers import UserDetailSerializer
from apps.cases.serializers import CaseListSerializer


class RewardSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for RewardSubmission model."""
    submitted_by = UserDetailSerializer(read_only=True)
    case = CaseListSerializer(read_only=True)
    reviewed_by_officer = UserDetailSerializer(read_only=True)
    reviewed_by_detective = UserDetailSerializer(read_only=True)
    
    class Meta:
        model = RewardSubmission
        fields = [
            'id', 'submitted_by', 'case', 'information', 'status',
            'reviewed_by_officer', 'reviewed_by_detective', 'review_comments',
            'submitted_date', 'updated_date'
        ]
        read_only_fields = [
            'id', 'submitted_by', 'status', 'reviewed_by_officer',
            'reviewed_by_detective', 'submitted_date', 'updated_date'
        ]


class RewardSubmissionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reward submissions."""
    
    class Meta:
        model = RewardSubmission
        fields = ['id', 'case', 'information']
        read_only_fields = ['id']
    
    def create(self, validated_data):
        """Create submission and set submitted_by."""
        validated_data['submitted_by'] = self.context['request'].user
        return super().create(validated_data)


class RewardSerializer(serializers.ModelSerializer):
    """Serializer for Reward model."""
    submission = RewardSubmissionSerializer(read_only=True)
    case = CaseListSerializer(read_only=True)
    created_by = UserDetailSerializer(read_only=True)
    
    class Meta:
        model = Reward
        fields = [
            'id', 'submission', 'case', 'amount', 'reward_code', 'status',
            'claimed_date', 'claimed_at_location', 'created_date', 'created_by'
        ]
        read_only_fields = [
            'id', 'reward_code', 'status', 'claimed_date', 'created_date'
        ]


class RewardListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for reward lists."""
    submitted_by = serializers.CharField(source='submission.submitted_by.username', read_only=True)
    
    class Meta:
        model = Reward
        fields = [
            'id', 'reward_code', 'amount', 'status', 'submitted_by', 'created_date'
        ]

