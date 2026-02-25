"""
Serializers for trials app.
"""
from rest_framework import serializers
from apps.trials.models import Trial
from apps.accounts.serializers import UserDetailSerializer
from apps.cases.serializers import CaseDetailSerializer


class TrialSerializer(serializers.ModelSerializer):
    """Serializer for Trial model."""
    case = CaseDetailSerializer(read_only=True)
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
        """Check if trial is complete."""
        return obj.is_complete()


class TrialCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating trials."""
    
    class Meta:
        model = Trial
        fields = ['case', 'trial_date']
    
    def create(self, validated_data):
        """Create trial and set judge."""
        validated_data['judge'] = self.context['request'].user
        return super().create(validated_data)


class TrialVerdictSerializer(serializers.ModelSerializer):
    """Serializer for recording verdict."""
    
    class Meta:
        model = Trial
        fields = ['verdict', 'punishment_title', 'punishment_description', 'notes']
    
    def validate(self, attrs):
        """Validate verdict and punishment."""
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
        """Update trial with verdict."""
        from django.utils import timezone
        validated_data['verdict_date'] = timezone.now()
        return super().update(instance, validated_data)

