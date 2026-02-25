"""
Views for payments app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from core.permissions import IsSergeant
from .models import BailFine, PaymentTransaction
from .serializers import (
    BailFineSerializer, BailFineCreateSerializer,
    PaymentTransactionSerializer
)


class BailFineViewSet(viewsets.ModelViewSet):
    """
    ViewSet for BailFine management.
    """
    queryset = BailFine.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return BailFineCreateSerializer
        return BailFineSerializer
    
    def get_queryset(self):
        """Filter bail/fines."""
        queryset = BailFine.objects.select_related('case', 'suspect', 'set_by')
        
        # Filter by case
        case_id = self.request.query_params.get('case', None)
        if case_id:
            queryset = queryset.filter(case_id=case_id)
        
        # Filter by suspect
        suspect_id = self.request.query_params.get('suspect', None)
        if suspect_id:
            queryset = queryset.filter(suspect_id=suspect_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action == 'create':
            return [IsSergeant()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        """Create bail/fine and set set_by."""
        serializer.save(set_by=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def process_payment(self, request, pk=None):
        """
        Process payment via test payment gateway.
        This is a mock implementation for testing.
        """
        bail_fine = self.get_object()
        
        if bail_fine.status == 'Paid':
            return Response(
                {'error': 'Bail/fine has already been paid'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mock payment gateway response
        transaction_id = f'TXN-{timezone.now().timestamp()}'
        gateway_response = {
            'status': 'success',
            'transaction_id': transaction_id,
            'amount': str(bail_fine.amount),
            'currency': 'USD'
        }
        
        # Create transaction record
        transaction = PaymentTransaction.objects.create(
            bail_fine=bail_fine,
            transaction_id=transaction_id,
            amount=bail_fine.amount,
            currency='USD',
            status='Success',
            gateway_response=gateway_response,
            completed_date=timezone.now()
        )
        
        # Update bail/fine
        bail_fine.status = 'Paid'
        bail_fine.paid_date = timezone.now()
        bail_fine.payment_transaction_id = transaction_id
        bail_fine.save()
        
        return Response({
            'bail_fine': BailFineSerializer(bail_fine).data,
            'transaction': PaymentTransactionSerializer(transaction).data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def payment_callback(self, request, pk=None):
        """
        Payment gateway callback endpoint.
        """
        bail_fine = self.get_object()
        transaction_id = request.data.get('transaction_id')
        gateway_status = request.data.get('status')
        gateway_response = request.data
        
        if not transaction_id:
            return Response(
                {'error': 'transaction_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update or create transaction
        transaction, created = PaymentTransaction.objects.get_or_create(
            transaction_id=transaction_id,
            defaults={
                'bail_fine': bail_fine,
                'amount': bail_fine.amount,
                'currency': 'USD',
                'status': gateway_status,
                'gateway_response': gateway_response
            }
        )
        
        if not created:
            transaction.status = gateway_status
            transaction.gateway_response = gateway_response
            if gateway_status == 'Success':
                transaction.completed_date = timezone.now()
            transaction.save()
        
        # Update bail/fine if payment successful
        if gateway_status == 'Success' and bail_fine.status != 'Paid':
            bail_fine.status = 'Paid'
            bail_fine.paid_date = timezone.now()
            bail_fine.payment_transaction_id = transaction_id
            bail_fine.save()
        
        return Response({
            'message': 'Payment callback processed',
            'transaction': PaymentTransactionSerializer(transaction).data
        })

