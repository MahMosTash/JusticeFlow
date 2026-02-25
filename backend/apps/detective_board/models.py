"""
Detective Board models for visual case analysis.
"""
from django.db import models
from apps.accounts.models import User
from apps.cases.models import Case
from apps.evidence.models import Evidence


class DetectiveBoard(models.Model):
    """
    Stores visual board state for detective case analysis.
    """
    case = models.OneToOneField(
        Case,
        on_delete=models.CASCADE,
        related_name='detective_board'
    )
    detective = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='detective_boards'
    )
    board_data = models.JSONField(default=dict)  # Stores positions, connections, layout
    last_modified = models.DateTimeField(auto_now=True)
    last_modified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='boards_modified'
    )
    
    class Meta:
        db_table = 'detective_boards'
        verbose_name = 'Detective Board'
        verbose_name_plural = 'Detective Boards'
    
    def __str__(self):
        return f'Detective Board for {self.case.title}'


class BoardEvidenceConnection(models.Model):
    """
    Represents connections between evidence on detective board.
    """
    CONNECTION_TYPE_CHOICES = [
        ('related_to', 'Related To'),
        ('contradicts', 'Contradicts'),
        ('supports', 'Supports'),
        ('timeline', 'Timeline'),
        ('other', 'Other'),
    ]
    
    board = models.ForeignKey(
        DetectiveBoard,
        on_delete=models.CASCADE,
        related_name='connections'
    )
    source_evidence = models.ForeignKey(
        Evidence,
        on_delete=models.CASCADE,
        related_name='outgoing_connections'
    )
    target_evidence = models.ForeignKey(
        Evidence,
        on_delete=models.CASCADE,
        related_name='incoming_connections'
    )
    connection_type = models.CharField(max_length=20, choices=CONNECTION_TYPE_CHOICES)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'board_evidence_connections'
        unique_together = ['board', 'source_evidence', 'target_evidence']
        verbose_name = 'Board Evidence Connection'
        verbose_name_plural = 'Board Evidence Connections'
    
    def __str__(self):
        return f'{self.source_evidence.title} -> {self.target_evidence.title} ({self.connection_type})'

