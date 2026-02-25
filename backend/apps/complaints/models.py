"""
Complaint models for complaint-based case creation workflow.
"""
from django.db import models
from django.utils import timezone
from apps.accounts.models import User
from apps.cases.models import Case


class Complaint(models.Model):
    """
    Represents a complaint submitted by a complainant that may become a case.
    """
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Under Review', 'Under Review'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Permanently Rejected', 'Permanently Rejected'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    submitted_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='complaints_submitted'
    )
    submission_count = models.IntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    # Review tracking
    reviewed_by_intern = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='complaints_reviewed_as_intern'
    )
    reviewed_by_officer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='complaints_reviewed_as_officer'
    )
    review_comments = models.TextField(blank=True)
    
    # Case relationship (created after approval)
    case = models.OneToOneField(
        Case,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='complaint'
    )
    
    # Timestamps
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'complaints'
        ordering = ['-created_date']
        verbose_name = 'Complaint'
        verbose_name_plural = 'Complaints'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['submitted_by']),
            models.Index(fields=['created_date']),
        ]
    
    def __str__(self):
        return f'{self.title} - {self.status}'
    
    def can_be_resubmitted(self):
        """Check if complaint can be resubmitted (not permanently rejected)."""
        return self.status != 'Permanently Rejected' and self.submission_count < 3
    
    def is_permanently_rejected(self):
        """Check if complaint is permanently rejected (3 strikes)."""
        return self.submission_count >= 3 or self.status == 'Permanently Rejected'
    
    def increment_submission_count(self):
        """Increment submission count and check for permanent rejection."""
        self.submission_count += 1
        if self.submission_count >= 3:
            self.status = 'Permanently Rejected'
        self.save()


class ComplaintReview(models.Model):
    """
    Audit trail for complaint review actions.
    """
    ACTION_CHOICES = [
        ('Returned', 'Returned to Complainant'),
        ('Forwarded', 'Forwarded to Police Officer'),
        ('Approved', 'Approved - Case Created'),
        ('Rejected', 'Rejected'),
    ]
    
    complaint = models.ForeignKey(
        Complaint,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    reviewer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='complaint_reviews'
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    comments = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'complaint_reviews'
        ordering = ['-reviewed_at']
        verbose_name = 'Complaint Review'
        verbose_name_plural = 'Complaint Reviews'
    
    def __str__(self):
        return f'{self.complaint.title} - {self.action} by {self.reviewer}'

