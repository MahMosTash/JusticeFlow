"""
Serializers for complaints app.
"""
from rest_framework import serializers
from apps.complaints.models import Complaint, ComplaintReview
from apps.accounts.serializers import UserDetailSerializer
from apps.cases.serializers import CaseListSerializer


class ComplaintReviewSerializer(serializers.ModelSerializer):
    """Serializer for ComplaintReview."""
    reviewer = UserDetailSerializer(read_only=True)
    
    class Meta:
        model = ComplaintReview
        fields = [
            'id', 'complaint', 'reviewer', 'action', 'comments', 'reviewed_at'
        ]
        read_only_fields = ['id', 'reviewer', 'reviewed_at']


class ComplaintSerializer(serializers.ModelSerializer):
    """Serializer for Complaint model."""
    submitted_by = UserDetailSerializer(read_only=True)
    reviewed_by_intern = UserDetailSerializer(read_only=True)
    reviewed_by_officer = UserDetailSerializer(read_only=True)
    case = CaseListSerializer(read_only=True)
    reviews = ComplaintReviewSerializer(many=True, read_only=True)
    
    class Meta:
        model = Complaint
        fields = [
            'id', 'title', 'description', 'submitted_by', 'submission_count',
            'status', 'reviewed_by_intern', 'reviewed_by_officer',
            'review_comments', 'case', 'reviews', 'created_date', 'updated_date'
        ]
        read_only_fields = [
            'id', 'submitted_by', 'submission_count', 'status',
            'reviewed_by_intern', 'reviewed_by_officer', 'case',
            'created_date', 'updated_date'
        ]


class ComplaintCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating complaints."""
    
    class Meta:
        model = Complaint
        fields = ['title', 'description']
    
    def create(self, validated_data):
        """Create complaint and set submitted_by."""
        validated_data['submitted_by'] = self.context['request'].user
        return super().create(validated_data)


class ComplaintListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for complaint lists."""
    submitted_by = serializers.StringRelatedField()
    
    class Meta:
        model = Complaint
        fields = [
            'id', 'title', 'status', 'submitted_by', 'submission_count', 'created_date'
        ]

