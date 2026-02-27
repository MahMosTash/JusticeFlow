"""
Serializers for trials app — full case dossier for judge review.
"""
from rest_framework import serializers
from apps.trials.models import Trial
from apps.accounts.serializers import UserDetailSerializer
from apps.cases.serializers import CaseSerializer
from apps.cases.models import Case


# ─── Lightweight nested imports (avoid circular) ──────────────────────────────

class _SuspectMiniSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    national_id = serializers.CharField()
    phone_number = serializers.CharField()
    status = serializers.CharField()
    notes = serializers.CharField()
    arrest_date = serializers.DateTimeField()


class _GuiltScoreMiniSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    score = serializers.IntegerField()
    justification = serializers.CharField()
    assigned_date = serializers.DateTimeField()
    assigned_by = UserDetailSerializer()
    suspect = serializers.SerializerMethodField()

    def get_suspect(self, obj):
        return {'id': obj.suspect.id, 'name': obj.suspect.name}


class _CaptainDecisionMiniSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    decision = serializers.CharField()
    comments = serializers.CharField()
    decided_at = serializers.DateTimeField()
    decided_by = UserDetailSerializer()
    requires_chief_approval = serializers.BooleanField()
    chief_approval = serializers.BooleanField(allow_null=True, required=False)
    chief_approved_by = UserDetailSerializer()
    suspect = serializers.SerializerMethodField()

    def get_suspect(self, obj):
        return {'id': obj.suspect.id, 'name': obj.suspect.name}


class _EvidenceMiniSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    evidence_type = serializers.CharField()
    description = serializers.CharField()
    recorded_by = UserDetailSerializer()
    created_date = serializers.DateTimeField()


class _ComplaintMiniSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    description = serializers.CharField()
    status = serializers.CharField()
    created_date = serializers.DateTimeField()
    submitted_by = UserDetailSerializer()


# ─── Main case dossier serializer ─────────────────────────────────────────────

class CaseDossierSerializer(serializers.ModelSerializer):
    """Full case dossier for judge — all entities with complete details."""
    created_by = UserDetailSerializer(read_only=True)
    assigned_detective = UserDetailSerializer(read_only=True)
    assigned_sergeant = UserDetailSerializer(read_only=True)
    suspects = serializers.SerializerMethodField()
    guilt_scores = serializers.SerializerMethodField()
    captain_decisions = serializers.SerializerMethodField()
    evidence_items = serializers.SerializerMethodField()
    complaints = serializers.SerializerMethodField()
    complainants = serializers.SerializerMethodField()
    witnesses = serializers.SerializerMethodField()

    class Meta:
        model = Case
        fields = [
            'id', 'title', 'description', 'severity', 'status',
            'incident_date', 'incident_time', 'incident_location',
            'created_by', 'assigned_detective', 'assigned_sergeant',
            'resolution_date', 'resolution_notes', 'created_date',
            'suspects', 'guilt_scores', 'captain_decisions',
            'evidence_items', 'complaints', 'complainants', 'witnesses',
        ]

    def get_suspects(self, obj):
        from apps.investigations.models import Suspect
        from apps.investigations.serializers import SuspectListSerializer
        qs = Suspect.objects.filter(case=obj).select_related('user')
        return SuspectListSerializer(qs, many=True).data

    def get_guilt_scores(self, obj):
        from apps.investigations.models import GuiltScore
        qs = GuiltScore.objects.filter(case=obj).select_related('assigned_by', 'suspect')
        return _GuiltScoreMiniSerializer(qs, many=True).data

    def get_captain_decisions(self, obj):
        from apps.investigations.models import CaptainDecision
        qs = CaptainDecision.objects.filter(case=obj).select_related(
            'decided_by', 'chief_approved_by', 'suspect'
        )
        return _CaptainDecisionMiniSerializer(qs, many=True).data

    def get_evidence_items(self, obj):
        from apps.evidence.models import Evidence
        qs = Evidence.objects.filter(case=obj).select_related('recorded_by')
        return _EvidenceMiniSerializer(qs, many=True).data

    def get_complaints(self, obj):
        from apps.complaints.models import Complaint
        qs = Complaint.objects.filter(case=obj).select_related('submitted_by')
        return _ComplaintMiniSerializer(qs, many=True).data

    def get_complainants(self, obj):
        return [
            {
                'id': cc.complainant.id,
                'full_name': cc.complainant.full_name,
                'username': cc.complainant.username,
                'national_id': getattr(cc.complainant, 'national_id', ''),
                'phone_number': getattr(cc.complainant, 'phone_number', ''),
                'notes': cc.notes,
            }
            for cc in obj.case_complainants.select_related('complainant').all()
        ]

    def get_witnesses(self, obj):
        return [
            {
                'id': cw.id,
                'witness_name': cw.witness.full_name if cw.witness else None,
                'witness_national_id': cw.witness_national_id,
                'witness_phone': cw.witness_phone,
                'notes': cw.notes,
            }
            for cw in obj.case_witnesses.select_related('witness').all()
        ]


# ─── Trial serializers ─────────────────────────────────────────────────────────

class TrialSerializer(serializers.ModelSerializer):
    """Full trial detail — includes case dossier for judge."""
    case = CaseDossierSerializer(read_only=True)
    judge = UserDetailSerializer(read_only=True)
    is_complete = serializers.SerializerMethodField()

    class Meta:
        model = Trial
        fields = [
            'id', 'case', 'judge', 'trial_date', 'verdict_date',
            'verdict', 'punishment_title', 'punishment_description',
            'notes', 'created_date', 'updated_date', 'is_complete'
        ]
        read_only_fields = ['id', 'created_date', 'updated_date']

    def get_is_complete(self, obj):
        return obj.is_complete()


class TrialListSerializer(serializers.ModelSerializer):
    """Lightweight trial list — no full dossier."""
    judge = UserDetailSerializer(read_only=True)
    case_title = serializers.CharField(source='case.title', read_only=True)
    case_severity = serializers.CharField(source='case.severity', read_only=True)
    case_id = serializers.IntegerField(source='case.id', read_only=True)
    is_complete = serializers.SerializerMethodField()

    class Meta:
        model = Trial
        fields = [
            'id', 'case_id', 'case_title', 'case_severity',
            'judge', 'trial_date', 'verdict_date', 'verdict', 'is_complete'
        ]

    def get_is_complete(self, obj):
        return obj.is_complete()


class TrialCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating trials."""

    class Meta:
        model = Trial
        fields = ['case', 'trial_date', 'notes']

    def create(self, validated_data):
        validated_data['judge'] = self.context['request'].user
        return super().create(validated_data)


class TrialVerdictSerializer(serializers.ModelSerializer):
    """Serializer for recording verdict."""

    class Meta:
        model = Trial
        fields = ['verdict', 'punishment_title', 'punishment_description', 'notes']

    fine_amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)

    def validate(self, attrs):
        verdict = attrs.get('verdict')
        punishment_title = attrs.get('punishment_title', '')
        punishment_description = attrs.get('punishment_description', '')

        if verdict == 'Guilty':
            if not punishment_title or not punishment_description:
                raise serializers.ValidationError(
                    'Punishment title and description are required for guilty verdict.'
                )

        return attrs

    def update(self, instance, validated_data):
        from django.utils import timezone
        validated_data['verdict_date'] = timezone.now()
        return super().update(instance, validated_data)
