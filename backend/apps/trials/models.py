"""
Trial models for case resolution and verdict recording.
"""
from django.db import models
from apps.accounts.models import User
from apps.cases.models import Case


class Trial(models.Model):
    """
    Represents the trial phase of a case.
    """
    VERDICT_CHOICES = [
        ('Guilty', 'Guilty'),
        ('Not Guilty', 'Not Guilty'),
    ]
    
    case = models.OneToOneField(
        Case,
        on_delete=models.CASCADE,
        related_name='trial'
    )
    judge = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='trials_judged'
    )
    trial_date = models.DateTimeField(null=True, blank=True)
    verdict_date = models.DateTimeField(null=True, blank=True)
    verdict = models.CharField(max_length=20, choices=VERDICT_CHOICES, null=True, blank=True)
    punishment_title = models.CharField(max_length=200, blank=True)
    punishment_description = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'trials'
        ordering = ['-trial_date']
        verbose_name = 'Trial'
        verbose_name_plural = 'Trials'
    
    def __str__(self):
        verdict_str = f' - {self.verdict}' if self.verdict else ''
        return f'Trial for {self.case.title}{verdict_str}'
    
    def is_complete(self):
        """Check if trial is complete (has verdict and punishment)."""
        return (
            self.verdict is not None and
            self.verdict_date is not None and
            (self.verdict == 'Not Guilty' or (self.punishment_title and self.punishment_description))
        )

