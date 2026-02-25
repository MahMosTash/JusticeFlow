"""
Serializers for cases app.
"""
from rest_framework import serializers
from apps.cases.models import Case, CaseComplainant, CaseWitness
from apps.accounts.serializers import UserDetailSerializer


class CaseComplainantSerializer(serializers.ModelSerializer):
    """Serializer for CaseComplainant."""
    from apps.accounts.models import User
    complainant = UserDetailSerializer(read_only=True)
    complainant_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='complainant',
        write_only=True,
        required=False
    )
    
    class Meta:
        model = CaseComplainant
        fields = ['id', 'case', 'complainant', 'complainant_id', 'added_date', 'notes']
        read_only_fields = ['id', 'added_date']


class CaseWitnessSerializer(serializers.ModelSerializer):
    """Serializer for CaseWitness."""
    from apps.accounts.models import User
    witness = UserDetailSerializer(read_only=True, required=False)
    witness_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='witness',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = CaseWitness
        fields = [
            'id', 'case', 'witness', 'witness_id', 'witness_national_id',
            'witness_phone', 'added_date', 'notes'
        ]
        read_only_fields = ['id', 'added_date']


class CaseSerializer(serializers.ModelSerializer):
    """Serializer for Case model."""
    created_by = UserDetailSerializer(read_only=True)
    assigned_detective = UserDetailSerializer(read_only=True)
    assigned_sergeant = UserDetailSerializer(read_only=True)
    complainants = CaseComplainantSerializer(many=True, read_only=True)
    witnesses = CaseWitnessSerializer(many=True, read_only=True)
    
    # Write-only fields for assignment
    from apps.accounts.models import User
    assigned_detective_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='assigned_detective',
        write_only=True,
        required=False,
        allow_null=True
    )
    assigned_sergeant_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='assigned_sergeant',
        write_only=True,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Case
        fields = [
            'id', 'title', 'description', 'severity', 'status',
            'incident_date', 'incident_time', 'incident_location',
            'created_by', 'assigned_detective', 'assigned_detective_id',
            'assigned_sergeant', 'assigned_sergeant_id',
            'resolution_date', 'resolution_notes',
            'created_date', 'updated_date',
            'complainants', 'witnesses'
        ]
        read_only_fields = ['id', 'created_by', 'created_date', 'updated_date']
    
    def create(self, validated_data):
        """Create case and set created_by."""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class CaseListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for case lists."""
    created_by = serializers.StringRelatedField()
    assigned_detective = serializers.StringRelatedField()
    
    class Meta:
        model = Case
        fields = [
            'id', 'title', 'severity', 'status', 'created_by',
            'assigned_detective', 'created_date'
        ]


class CaseDetailSerializer(CaseSerializer):
    """Detailed serializer for case with all relationships."""
    evidence_count = serializers.SerializerMethodField()
    suspects_count = serializers.SerializerMethodField()
    
    class Meta(CaseSerializer.Meta):
        fields = CaseSerializer.Meta.fields + ['evidence_count', 'suspects_count']
    
    def get_evidence_count(self, obj):
        """Get count of evidence items."""
        return obj.evidence_items.count()
    
    def get_suspects_count(self, obj):
        """Get count of suspects."""
        return obj.suspects.count()

