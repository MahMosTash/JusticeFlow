"""
Serializers for investigations app.
"""
from rest_framework import serializers
from apps.investigations.models import Suspect, Interrogation, GuiltScore, CaptainDecision
from apps.accounts.serializers import UserDetailSerializer
from apps.cases.serializers import CaseListSerializer
from apps.cases.models import Case


class SuspectSerializer(serializers.ModelSerializer):
    """Serializer for Suspect model."""
    case = CaseListSerializer(read_only=True)
    case_id = serializers.PrimaryKeyRelatedField(
        queryset=Case.objects.all(),
        source='case',
        write_only=True
    )
    user = UserDetailSerializer(read_only=True)
    days_under_investigation = serializers.SerializerMethodField()
    most_wanted_ranking = serializers.SerializerMethodField()
    
    class Meta:
        model = Suspect
        fields = [
            'id', 'case', 'case_id', 'user', 'name', 'national_id', 'phone_number',
            'status', 'surveillance_start_date', 'arrest_date', 'cleared_date',
            'notes', 'created_date', 'updated_date',
            'days_under_investigation', 'most_wanted_ranking'
        ]
        read_only_fields = ['id', 'created_date', 'updated_date']
    
    def get_days_under_investigation(self, obj):
        """Get days under investigation."""
        return obj.get_days_under_investigation()
    
    def get_most_wanted_ranking(self, obj):
        """Get Most Wanted ranking."""
        return obj.get_most_wanted_ranking()


class SuspectListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for suspect lists."""
    case = serializers.StringRelatedField()
    suspect_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Suspect
        fields = [
            'id', 'case', 'suspect_name', 'status',
            'surveillance_start_date', 'created_date'
        ]
    
    def get_suspect_name(self, obj):
        """Get suspect name (user or external)."""
        return obj.user.get_full_name() if obj.user else obj.name


class InterrogationSerializer(serializers.ModelSerializer):
    """Serializer for Interrogation model."""
    suspect = SuspectListSerializer(read_only=True)
    case = CaseListSerializer(read_only=True)
    interrogator = UserDetailSerializer(read_only=True)
    
    class Meta:
        model = Interrogation
        fields = [
            'id', 'suspect', 'case', 'interrogator', 'interrogation_date',
            'duration', 'transcript', 'notes'
        ]
        read_only_fields = ['id']


class GuiltScoreSerializer(serializers.ModelSerializer):
    """Serializer for GuiltScore model."""
    suspect = SuspectListSerializer(read_only=True)
    suspect_id = serializers.PrimaryKeyRelatedField(
        queryset=Suspect.objects.all(),
        source='suspect',
        write_only=True
    )
    case = CaseListSerializer(read_only=True)
    case_id = serializers.PrimaryKeyRelatedField(
        queryset=Case.objects.all(),
        source='case',
        write_only=True
    )
    assigned_by = UserDetailSerializer(read_only=True)
    
    class Meta:
        model = GuiltScore
        fields = [
            'id', 'suspect', 'suspect_id', 'case', 'case_id',
            'assigned_by', 'score', 'justification', 'assigned_date'
        ]
        read_only_fields = ['id', 'assigned_date']
    
    def validate_score(self, value):
        """Validate score is between 1 and 10."""
        if not (1 <= value <= 10):
            raise serializers.ValidationError('Guilt score must be between 1 and 10.')
        return value


class CaptainDecisionSerializer(serializers.ModelSerializer):
    """Serializer for CaptainDecision model."""
    case = CaseListSerializer(read_only=True)
    suspect = SuspectListSerializer(read_only=True)
    decided_by = UserDetailSerializer(read_only=True)
    chief_approved_by = UserDetailSerializer(read_only=True)
    
    class Meta:
        model = CaptainDecision
        fields = [
            'id', 'case', 'suspect', 'decision', 'comments',
            'requires_chief_approval', 'chief_approval', 'chief_approved_by',
            'chief_approval_date', 'decided_at', 'decided_by'
        ]
        read_only_fields = ['id', 'decided_at', 'decided_by', 'chief_approval_date']


class CaptainDecisionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating CaptainDecision."""
    
    class Meta:
        model = CaptainDecision
        fields = ['case', 'suspect', 'decision', 'comments']
    
    def validate(self, attrs):
        """Validate decision requirements."""
        case = attrs.get('case')
        if case and case.is_critical():
            attrs['requires_chief_approval'] = True
        return attrs
    
    def create(self, validated_data):
        """Create decision and set decided_by."""
        validated_data['decided_by'] = self.context['request'].user
        return super().create(validated_data)

