"""
Serializers for evidence app.
"""
from rest_framework import serializers
from apps.evidence.models import Evidence
from apps.accounts.serializers import UserDetailSerializer
from apps.cases.serializers import CaseListSerializer


class EvidenceSerializer(serializers.ModelSerializer):
    """Serializer for Evidence model."""
    case = CaseListSerializer(read_only=True)
    recorded_by = UserDetailSerializer(read_only=True)
    verified_by_forensic_doctor = UserDetailSerializer(read_only=True)
    
    class Meta:
        model = Evidence
        fields = [
            'id', 'title', 'description', 'evidence_type', 'case',
            'recorded_by', 'created_date',
            # Witness Statement fields
            'transcript', 'witness_name', 'witness_national_id', 'witness_phone',
            'image', 'video', 'audio',
            # Biological Evidence fields
            'evidence_category', 'image1', 'image2', 'image3',
            'verified_by_forensic_doctor', 'verified_by_national_id',
            'verification_date', 'verification_notes',
            # Vehicle Evidence fields
            'model', 'color', 'license_plate', 'serial_number',
            # Identification Document fields
            'full_name', 'metadata'
        ]
        read_only_fields = ['id', 'recorded_by', 'created_date', 'verification_date']
    
    def validate(self, attrs):
        """Validate type-specific requirements."""
        evidence_type = attrs.get('evidence_type', self.instance.evidence_type if self.instance else None)
        
        if evidence_type == 'witness_statement':
            if not attrs.get('transcript'):
                raise serializers.ValidationError({'transcript': 'Transcript is required for witness statements.'})
        
        elif evidence_type == 'biological':
            if not attrs.get('image1'):
                raise serializers.ValidationError({'image1': 'At least one image is required for biological evidence.'})
        
        elif evidence_type == 'vehicle':
            license_plate = attrs.get('license_plate', '')
            serial_number = attrs.get('serial_number', '')
            if license_plate and serial_number:
                raise serializers.ValidationError('Cannot have both license_plate and serial_number.')
            if not license_plate and not serial_number:
                raise serializers.ValidationError('Must have either license_plate or serial_number.')
            if not attrs.get('model') or not attrs.get('color'):
                raise serializers.ValidationError('Model and color are required for vehicle evidence.')
        
        elif evidence_type == 'identification':
            if not attrs.get('full_name'):
                raise serializers.ValidationError({'full_name': 'Full name is required for identification documents.'})
        
        return attrs
    
    def create(self, validated_data):
        """Create evidence and set recorded_by."""
        validated_data['recorded_by'] = self.context['request'].user
        return super().create(validated_data)


class EvidenceListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for evidence lists."""
    recorded_by = serializers.StringRelatedField()
    case = serializers.StringRelatedField()
    
    class Meta:
        model = Evidence
        fields = [
            'id', 'title', 'evidence_type', 'case', 'recorded_by', 'created_date'
        ]


class EvidenceVerificationSerializer(serializers.ModelSerializer):
    """Serializer for verifying biological evidence."""
    verified_by_forensic_doctor = UserDetailSerializer(read_only=True)
    
    class Meta:
        model = Evidence
        fields = [
            'id', 'verified_by_forensic_doctor', 'verified_by_national_id',
            'verification_date', 'verification_notes', 'is_verified'
        ]
        read_only_fields = ['id', 'verification_date']
    
    def update(self, instance, validated_data):
        """Update verification fields."""
        from django.utils import timezone
        if instance.evidence_type != 'biological':
            raise serializers.ValidationError('Only biological evidence can be verified.')
        
        validated_data['verified_by_forensic_doctor'] = self.context['request'].user
        validated_data['verification_date'] = timezone.now()
        return super().update(instance, validated_data)

