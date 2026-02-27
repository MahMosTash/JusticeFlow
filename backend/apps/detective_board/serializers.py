"""
Serializers for detective board app.
"""
from rest_framework import serializers
from apps.detective_board.models import DetectiveBoard, BoardEvidenceConnection
from apps.accounts.serializers import UserDetailSerializer
from apps.cases.serializers import CaseListSerializer
from apps.evidence.serializers import EvidenceListSerializer
from apps.cases.models import Case

class BoardEvidenceConnectionSerializer(serializers.ModelSerializer):
    """Serializer for BoardEvidenceConnection."""
    source_evidence = EvidenceListSerializer(read_only=True)
    target_evidence = EvidenceListSerializer(read_only=True)
    
    class Meta:
        model = BoardEvidenceConnection
        fields = [
            'id', 'board', 'source_evidence', 'target_evidence',
            'connection_type', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class DetectiveBoardSerializer(serializers.ModelSerializer):
    case = CaseListSerializer(read_only=True)
    case_id = serializers.PrimaryKeyRelatedField(
        queryset=Case.objects.all(), source='case', write_only=True
    )
    detective = UserDetailSerializer(read_only=True)
    last_modified_by = UserDetailSerializer(read_only=True)
    connections = BoardEvidenceConnectionSerializer(many=True, read_only=True)

    class Meta:
        model = DetectiveBoard
        fields = [
            'id', 'case', 'case_id', 'detective', 'board_data', 'last_modified',
            'last_modified_by', 'connections'
        ]
        read_only_fields = ['id', 'detective', 'last_modified', 'last_modified_by']

    def create(self, validated_data):
        """Create board and set detective."""
        validated_data['detective'] = self.context['request'].user
        validated_data['last_modified_by'] = self.context['request'].user
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Update board and set last_modified_by."""
        validated_data['last_modified_by'] = self.context['request'].user
        return super().update(instance, validated_data)


class DetectiveBoardDetailSerializer(DetectiveBoardSerializer):
    """Detailed serializer with evidence items."""
    evidence_items = serializers.SerializerMethodField()
    
    class Meta(DetectiveBoardSerializer.Meta):
        fields = DetectiveBoardSerializer.Meta.fields + ['evidence_items']
    
    def get_evidence_items(self, obj):
        """Get all evidence items for the case."""
        from apps.evidence.serializers import EvidenceListSerializer
        return EvidenceListSerializer(obj.case.evidence_items.all(), many=True).data

