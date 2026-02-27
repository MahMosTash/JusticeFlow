"""
Payment models for bail and fine payments (Level 2 & 3 crimes).
"""
from django.db import models
from apps.accounts.models import User
from apps.cases.models import Case
from apps.investigations.models import Suspect


class BailFine(models.Model):
    """
    Represents bail or fine for Level 2 & 3 crimes.
    """
    TYPE_CHOICES = [
        ('Bail', 'Bail'),
        ('Fine', 'Fine'),
    ]
    
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Paid', 'Paid'),
        ('Overdue', 'Overdue'),
    ]
    
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name='bail_fines'
    )
    suspect = models.ForeignKey(
        Suspect,
        on_delete=models.CASCADE,
        related_name='bail_fines'
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    due_date = models.DateTimeField(null=True, blank=True)
    paid_date = models.DateTimeField(null=True, blank=True)
    payment_transaction_id = models.CharField(max_length=100, blank=True)
    
    set_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='bail_fines_set'
    )
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'bail_fines'
        ordering = ['-created_date']
        verbose_name = 'Bail/Fine'
        verbose_name_plural = 'Bail/Fines'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['due_date']),
        ]
    
    def __str__(self):
        return f'{self.type} - {self.amount} for {self.suspect}'
    
    def clean(self):
        """Validate that case severity allows bail/fine."""
        from django.core.exceptions import ValidationError
        if self.case.severity not in ['Level 2', 'Level 3']:
            raise ValidationError('Bail and fines only apply to Level 2 & 3 crimes.')


class PaymentTransaction(models.Model):
    """
    Records payment gateway transactions.
    """
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Success', 'Success'),
        ('Failed', 'Failed'),
        ('Refunded', 'Refunded'),
    ]
    
    bail_fine = models.ForeignKey(
        BailFine,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    transaction_id = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='IRR')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    gateway_response = models.JSONField(default=dict)
    
    created_date = models.DateTimeField(auto_now_add=True)
    completed_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'payment_transactions'
        ordering = ['-created_date']
        verbose_name = 'Payment Transaction'
        verbose_name_plural = 'Payment Transactions'
        indexes = [
            models.Index(fields=['transaction_id']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f'Transaction {self.transaction_id} - {self.status}'

