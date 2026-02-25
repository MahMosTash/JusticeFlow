"""
Case model for the Police Case Management System.
"""
from django.db import models
from django.utils import timezone
from apps.accounts.models import User


class Case(models.Model):
    """
    Central entity representing a criminal case.
    """
    SEVERITY_CHOICES = [
        ('Level 3', 'Level 3 - Minor crimes (petty theft, small fraud)'),
        ('Level 2', 'Level 2 - Major crimes (vehicle theft)'),
        ('Level 1', 'Level 1 - Severe crimes (murder)'),
        ('Critical', 'Critical - Terrorism, serial murder, assassination'),
    ]
    
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('Under Investigation', 'Under Investigation'),
        ('Resolved', 'Resolved'),
        ('Closed', 'Closed'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    
    # Incident details
    incident_date = models.DateField(null=True, blank=True)
    incident_time = models.TimeField(null=True, blank=True)
    incident_location = models.TextField(null=True, blank=True)
    
    # Assignment
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='cases_created'
    )
    assigned_detective = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cases_assigned_as_detective'
    )
    assigned_sergeant = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cases_assigned_as_sergeant'
    )
    
    # Resolution
    resolution_date = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(blank=True)
    
    # Timestamps
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    
    # Relationships
    complainants = models.ManyToManyField(
        User,
        through='CaseComplainant',
        related_name='cases_as_complainant'
    )
    witnesses = models.ManyToManyField(
        User,
        through='CaseWitness',
        related_name='cases_as_witness'
    )
    
    class Meta:
        db_table = 'cases'
        ordering = ['-created_date']
        verbose_name = 'Case'
        verbose_name_plural = 'Cases'
        indexes = [
            models.Index(fields=['status', 'severity']),
            models.Index(fields=['created_date']),
            models.Index(fields=['assigned_detective']),
        ]
    
    def __str__(self):
        return f'{self.title} ({self.status})'
    
    def is_critical(self):
        """Check if case is critical severity."""
        return self.severity == 'Critical'
    
    def requires_chief_approval(self):
        """Check if case requires Police Chief approval."""
        return self.is_critical()


class CaseComplainant(models.Model):
    """
    Many-to-Many relationship between Case and User (complainants).
    """
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='case_complainants')
    complainant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='complaint_cases')
    added_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'case_complainants'
        unique_together = ['case', 'complainant']
        verbose_name = 'Case Complainant'
        verbose_name_plural = 'Case Complainants'
    
    def __str__(self):
        return f'{self.case.title} - {self.complainant.get_full_name()}'


class CaseWitness(models.Model):
    """
    Many-to-Many relationship between Case and User (witnesses).
    """
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='case_witnesses')
    witness = models.ForeignKey(User, on_delete=models.CASCADE, related_name='witness_cases')
    witness_national_id = models.CharField(max_length=50, null=True, blank=True)
    witness_phone = models.CharField(max_length=20, null=True, blank=True)
    added_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'case_witnesses'
        unique_together = ['case', 'witness']
        verbose_name = 'Case Witness'
        verbose_name_plural = 'Case Witnesses'
    
    def __str__(self):
        return f'{self.case.title} - {self.witness.get_full_name() if self.witness else "External Witness"}'

