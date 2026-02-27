"""
Reward system models for information submission and rewards.
"""
from django.db import models
from apps.accounts.models import User
from apps.cases.models import Case
from core.utils import generate_reward_code, calculate_reward_amount


class RewardSubmission(models.Model):
    """
    Information submitted by basic users for rewards.
    """
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Under Review', 'Under Review'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]
    
    submitted_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reward_submissions'
    )
    case = models.ForeignKey(
        Case,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reward_submissions'
    )
    information = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    # Review tracking
    reviewed_by_officer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reward_submissions_reviewed_as_officer'
    )
    reviewed_by_detective = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reward_submissions_reviewed_as_detective'
    )
    review_comments = models.TextField(blank=True)
    
    submitted_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reward_submissions'
        ordering = ['-submitted_date']
        verbose_name = 'Reward Submission'
        verbose_name_plural = 'Reward Submissions'
    
    def __str__(self):
        return f'Reward Submission by {self.submitted_by} - {self.status}'


class Reward(models.Model):
    """
    Represents an approved reward with unique code.
    """
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Claimed', 'Claimed'),
    ]
    
    submission = models.OneToOneField(
        RewardSubmission,
        on_delete=models.CASCADE,
        related_name='reward'
    )
    case = models.ForeignKey(
        Case,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='rewards'
    )
    amount = models.BigIntegerField(help_text='Reward amount in base currency')
    reward_code = models.CharField(max_length=20, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    claimed_date = models.DateTimeField(null=True, blank=True)
    claimed_at_location = models.CharField(max_length=200, blank=True)
    
    created_date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='rewards_created'
    )
    
    class Meta:
        db_table = 'rewards'
        ordering = ['-created_date']
        verbose_name = 'Reward'
        verbose_name_plural = 'Rewards'
        indexes = [
            models.Index(fields=['reward_code']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f'Reward {self.reward_code} - {self.amount}'
    
    def save(self, *args, **kwargs):
        if not self.reward_code:
            self.reward_code = generate_reward_code()
        
        # Calculate amount if case is available
        if self.case and not self.amount:
            # Get max severity and days from case
            severity = self.case.severity
            # Calculate days from case creation or suspect surveillance
            from apps.investigations.models import Suspect
            suspects = Suspect.objects.filter(case=self.case)
            max_days = 0
            for suspect in suspects:
                days = suspect.get_days_under_investigation()
                max_days = max(max_days, days)
            
            if max_days == 0:
                from datetime import date
                from django.utils import timezone
                delta = timezone.now().date() - self.case.created_date.date()
                max_days = max(0, delta.days)
            self.amount = calculate_reward_amount(severity, max_days)
            
        # Fallback if no case or calculation failed
        if self.amount is None:
            self.amount = 5000000  # Default base reward for useful tips
        
        super().save(*args, **kwargs)

