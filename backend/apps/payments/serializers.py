"""
Serializers for payments app.
"""
from rest_framework import serializers
from apps.payments.models import BailFine, PaymentTransaction
from apps.accounts.serializers import UserDetailSerializer
from apps.cases.serializers import CaseListSerializer
from apps.investigations.serializers import SuspectListSerializer


class PaymentTransactionSerializer(serializers.ModelSerializer):
    """Serializer for PaymentTransaction."""
    
    class Meta:
        model = PaymentTransaction
        fields = [
            'id', 'bail_fine', 'transaction_id', 'amount', 'currency',
            'status', 'gateway_response', 'created_date', 'completed_date'
        ]
        read_only_fields = ['id', 'created_date', 'completed_date']


class BailFineSerializer(serializers.ModelSerializer):
    """Serializer for BailFine model."""
    case = CaseListSerializer(read_only=True)
    suspect = SuspectListSerializer(read_only=True)
    set_by = UserDetailSerializer(read_only=True)
    transactions = PaymentTransactionSerializer(many=True, read_only=True)
    
    class Meta:
        model = BailFine
        fields = [
            'id', 'case', 'suspect', 'amount', 'type', 'status',
            'due_date', 'paid_date', 'payment_transaction_id',
            'set_by', 'created_date', 'updated_date', 'transactions'
        ]
        read_only_fields = [
            'id', 'set_by', 'paid_date', 'payment_transaction_id',
            'created_date', 'updated_date'
        ]
    
    def validate(self, attrs):
        """Validate that case severity allows bail/fine."""
        case = attrs.get('case')
        if case and case.severity not in ['Level 2', 'Level 3']:
            raise serializers.ValidationError(
                'Bail and fines only apply to Level 2 & 3 crimes.'
            )
        return attrs


class BailFineCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating bail/fine."""
    
    class Meta:
        model = BailFine
        fields = ['case', 'suspect', 'amount', 'type', 'due_date']
    
    def create(self, validated_data):
        """Create bail/fine and set set_by."""
        validated_data['set_by'] = self.context['request'].user
        return super().create(validated_data)

