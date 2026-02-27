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
    complainants = CaseComplainantSerializer(source='case_complainants', many=True, read_only=True)
    witnesses = CaseWitnessSerializer(source='case_witnesses', many=True, read_only=True)
    
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
    assigned_detective_name = serializers.SerializerMethodField()
    evidence_count = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Case
        fields = [
            'id',
            'case_number',
            'title',
            'status',
            'status_display',
            'priority',
            'created_at',
            'updated_at',
            'assigned_detective_name',
            'evidence_count',
            'created_by_name',
        ]

    def get_assigned_detective_name(self, obj):
        if obj.assigned_detective:
            return obj.assigned_detective.get_full_name() or obj.assigned_detective.username
        return None

    def get_evidence_count(self, obj):
        return obj.evidence_set.count()

    def get_status_display(self, obj):
        return obj.get_status_display()

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None


class CaseDetailSerializer(serializers.ModelSerializer):
    assigned_detective = UserMinimalSerializer(read_only=True)
    assigned_detective_id = serializers.PrimaryKeyRelatedField(
        source='assigned_detective',
        queryset=__import__('apps.accounts.models', fromlist=['User']).User.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )
    created_by = UserMinimalSerializer(read_only=True)
    status_display = serializers.SerializerMethodField()
    priority_display = serializers.SerializerMethodField()
    evidence_count = serializers.SerializerMethodField()

    class Meta:
        model = Case
        fields = [
            'id',
            'case_number',
            'title',
            'description',
            'status',
            'status_display',
            'priority',
            'priority_display',
            'location',
            'incident_date',
            'assigned_detective',
            'assigned_detective_id',
            'created_by',
            'created_at',
            'updated_at',
            'evidence_count',
        ]
        read_only_fields = ['id', 'case_number', 'created_at', 'updated_at', 'created_by']

    def get_status_display(self, obj):
        return obj.get_status_display()

    def get_priority_display(self, obj):
        return obj.get_priority_display()

    def get_evidence_count(self, obj):
        return obj.evidence_set.count()