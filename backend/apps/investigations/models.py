"""
Investigation models: Suspects, Interrogations, Guilt Scores, Captain Decisions.
"""
from django.db import models
from django.utils import timezone
from datetime import timedelta
from apps.accounts.models import User
from apps.cases.models import Case


class Suspect(models.Model):
    """
    Represents individuals suspected of involvement in a case.
    """
    STATUS_CHOICES = [
        ('Under Investigation', 'Under Investigation'),
        ('Under Severe Surveillance', 'Under Severe Surveillance'),
        ('Arrested', 'Arrested'),
        ('Cleared', 'Cleared'),
    ]
    
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name='suspects'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='suspect_in_cases'
    )
    # External suspect info (if not a system user)
    name = models.CharField(max_length=200, blank=True)
    national_id = models.CharField(max_length=50, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Under Investigation')
    surveillance_start_date = models.DateField(null=True, blank=True)
    arrest_date = models.DateTimeField(null=True, blank=True)
    cleared_date = models.DateTimeField(null=True, blank=True)
    
    notes = models.TextField(blank=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'suspects'
        ordering = ['-created_date']
        verbose_name = 'Suspect'
        verbose_name_plural = 'Suspects'
        indexes = [
            models.Index(fields=['case', 'status']),
            models.Index(fields=['status']),
            models.Index(fields=['surveillance_start_date']),
        ]
    
    def __str__(self):
        suspect_name = self.user.get_full_name() if self.user else self.name
        return f'{suspect_name} - {self.case.title}'
    
    def get_days_under_investigation(self):
        """Calculate days under investigation."""
        if not self.surveillance_start_date:
            return 0
        delta = timezone.now().date() - self.surveillance_start_date
        return max(0, delta.days)
    
    def check_severe_surveillance(self):
        """
        Check if suspect should be under severe surveillance (> 1 month).
        """
        days = self.get_days_under_investigation()
        if days > 30 and self.status == 'Under Investigation':
            self.status = 'Under Severe Surveillance'
            self.save()
            return True
        return False
    
    def get_max_days_and_severity(self):
        """Helper to get max days (Lj) in open cases and max severity (Di) over all cases."""
        from django.utils import timezone
        
        # Find all suspect records for this person across the system
        suspects = []
        if self.user:
            suspects = Suspect.objects.filter(user=self.user)
        elif self.national_id:
            suspects = Suspect.objects.filter(national_id=self.national_id)
        else:
            suspects = Suspect.objects.filter(id=self.id)
            
        severity_map = {
            'Level 3': 1,
            'Level 2': 2,
            'Level 1': 3,
            'Critical': 4,
        }
        
        max_days = 0
        max_severity = 0
        today = timezone.now().date()
        closed_statuses = ['Resolved', 'Closed']
        
        for s in suspects:
            # Check highest crime degree they have EVER done
            sev = severity_map.get(s.case.severity, 1)
            if sev > max_severity:
                max_severity = sev
                
            # Check highest days wanted for a crime in an OPEN case
            if s.case.status not in closed_statuses and s.surveillance_start_date:
                delta = (today - s.surveillance_start_date).days
                if delta > max_days:
                    max_days = delta
                    
        return max(0, max_days), max_severity

    def get_most_wanted_ranking(self):
        """
        Calculate Most Wanted Ranking scalar: max(Lj) × max(Di)
        Where Lj = max days in open case, Di = max severity ever.
        """
        max_days, max_severity = self.get_max_days_and_severity()
        return max_days * max_severity
        
    def get_reward_amount(self):
        """
        Calculate reward prize amount: max(Lj) × max(Di) × 20,000,000
        """
        return self.get_most_wanted_ranking() * 20000000


class Interrogation(models.Model):
    """
    Records interrogation sessions with suspects.
    """
    suspect = models.ForeignKey(
        Suspect,
        on_delete=models.CASCADE,
        related_name='interrogations'
    )
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name='interrogations'
    )
    interrogator = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='interrogations_conducted'
    )
    interrogation_date = models.DateTimeField(default=timezone.now)
    duration = models.DurationField(null=True, blank=True)
    transcript = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'interrogations'
        ordering = ['-interrogation_date']
        verbose_name = 'Interrogation'
        verbose_name_plural = 'Interrogations'
    
    def __str__(self):
        return f'Interrogation of {self.suspect} by {self.interrogator}'


class GuiltScore(models.Model):
    """
    Records guilt scores assigned by interrogators (1-10).
    """
    suspect = models.ForeignKey(
        Suspect,
        on_delete=models.CASCADE,
        related_name='guilt_scores'
    )
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name='guilt_scores'
    )
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='guilt_scores_assigned'
    )
    score = models.IntegerField(help_text='Guilt score from 1 to 10')
    justification = models.TextField()
    assigned_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'guilt_scores'
        ordering = ['-assigned_date']
        unique_together = ['suspect', 'assigned_by']
        verbose_name = 'Guilt Score'
        verbose_name_plural = 'Guilt Scores'
    
    def __str__(self):
        return f'Guilt Score {self.score}/10 for {self.suspect} by {self.assigned_by}'
    
    def clean(self):
        """Validate score is between 1 and 10."""
        from django.core.exceptions import ValidationError
        if not (1 <= self.score <= 10):
            raise ValidationError({'score': 'Guilt score must be between 1 and 10.'})


class CaptainDecision(models.Model):
    """
    Records Captain's decision based on guilt scores and evidence.
    """
    DECISION_CHOICES = [
        ('Approve Arrest', 'Approve Arrest'),
        ('Reject', 'Reject'),
        ('Request More Evidence', 'Request More Evidence'),
    ]
    
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name='captain_decisions'
    )
    suspect = models.ForeignKey(
        Suspect,
        on_delete=models.CASCADE,
        related_name='captain_decisions'
    )
    decision = models.CharField(max_length=25, choices=DECISION_CHOICES)
    comments = models.TextField(blank=True)
    
    # Critical crimes require Police Chief approval
    requires_chief_approval = models.BooleanField(default=False)
    chief_approval = models.BooleanField(null=True, blank=True)
    chief_approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='decisions_approved_as_chief'
    )
    chief_approval_date = models.DateTimeField(null=True, blank=True)
    
    decided_at = models.DateTimeField(auto_now_add=True)
    decided_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='decisions_made_as_captain'
    )
    
    class Meta:
        db_table = 'captain_decisions'
        ordering = ['-decided_at']
        verbose_name = 'Captain Decision'
        verbose_name_plural = 'Captain Decisions'
    
    def __str__(self):
        return f'{self.decision} for {self.suspect} in {self.case.title}'
    
    def requires_approval(self):
        """Check if decision requires Police Chief approval."""
        return self.requires_chief_approval and self.chief_approval is None
    
    def is_approved(self):
        """Check if decision is fully approved."""
        if not self.requires_chief_approval:
            return self.decision == 'Approve Arrest'
        return self.chief_approval is True

