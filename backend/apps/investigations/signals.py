from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.investigations.models import CaptainDecision
from apps.trials.models import Trial

@receiver(post_save, sender=CaptainDecision)
def create_trial_on_approval(sender, instance, created, **kwargs):
    """
    Creates a Trial automatically if a CaptainDecision is approved.
    (If it requires chief approval, it waits until chief_approval is True).
    """
    if instance.is_approved():
        # Check if a trial already exists for this case to avoid duplicates
        Trial.objects.get_or_create(case=instance.case)
