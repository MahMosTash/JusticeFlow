"""
Django signals for automatic notifications and status updates.
"""
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from apps.evidence.models import Evidence
from apps.cases.models import Case
from apps.investigations.models import Suspect
from apps.complaints.models import Complaint
from core.models import Notification, AuditLog


@receiver(post_save, sender=Evidence)
def notify_detective_new_evidence(sender, instance, created, **kwargs):
    """
    Notify detective when new evidence is added to their case.
    """
    if created and instance.case and instance.case.assigned_detective:
        Notification.objects.create(
            user=instance.case.assigned_detective,
            type='new_evidence',
            title='New Evidence Added',
            message=f'New evidence "{instance.title}" has been added to case "{instance.case.title}".',
            related_case=instance.case
        )


@receiver(pre_save, sender=Suspect)
def check_severe_surveillance(sender, instance, **kwargs):
    """
    Check if suspect should be moved to "Under Severe Surveillance" status.
    """
    if instance.pk and instance.surveillance_start_date:
        # Check if more than 1 month (30 days) under investigation
        days = instance.get_days_under_investigation()
        if days > 30 and instance.status == 'Under Investigation':
            instance.status = 'Under Severe Surveillance'


@receiver(post_save, sender=Complaint)
def notify_complainant_complaint_status(sender, instance, created, **kwargs):
    """
    Notify complainant when complaint status changes.
    """
    if not created and instance.submitted_by:
        if instance.status in ['Approved', 'Rejected', 'Permanently Rejected']:
            Notification.objects.create(
                user=instance.submitted_by,
                type='complaint_review',
                title=f'Complaint {instance.status}',
                message=f'Your complaint "{instance.title}" has been {instance.status.lower()}.',
                related_case=instance.case if instance.case else None
            )


@receiver(post_save, sender=Case)
def notify_on_case_assignment(sender, instance, created, **kwargs):
    """
    Notify detective or sergeant when assigned to a case.
    """
    if not created:
        # Check if detective was assigned
        if instance.assigned_detective:
            Notification.objects.create(
                user=instance.assigned_detective,
                type='case_update',
                title='Case Assigned',
                message=f'You have been assigned to case "{instance.title}".',
                related_case=instance
            )
        
        # Check if sergeant was assigned
        if instance.assigned_sergeant:
            Notification.objects.create(
                user=instance.assigned_sergeant,
                type='case_update',
                title='Case Assigned',
                message=f'You have been assigned to case "{instance.title}".',
                related_case=instance
            )

