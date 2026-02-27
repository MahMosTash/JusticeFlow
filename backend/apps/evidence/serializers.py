# backend/apps/evidence/serializers.py
from rest_framework import serializers
from .models import Evidence
from apps.accounts.serializers import UserSerializer


class EvidenceSerializer(serializers.ModelSerializer):
    recorded_by = UserSerializer(read_only=True)
    verified_by_forensic_doctor = UserSerializer(read_only=True)
    case = serializers.SerializerMethodField()

    class Meta:
        model = Evidence
        fields = '__all__'
        read_only_fields = [
            'recorded_by',
            'verified_by_forensic_doctor',
            'verification_date',
            'created_date',
        ]

    def get_case(self, obj):
        case = obj.case
        detective = case.assigned_detective
        return {
            'id': case.id,
            'title': case.title,
            'severity': case.severity,
            'status': case.status,
            'created_by': str(case.created_by),
            'assigned_detective': str(detective) if detective else None,
            'created_date': case.created_date.isoformat() if case.created_date else None,
        }


class EvidenceVerificationSerializer(serializers.ModelSerializer):
    """Used only for the /verify/ action — accepts the writable fields."""
    class Meta:
        model = Evidence
        fields = ['verified_by_national_id', 'verification_notes']
