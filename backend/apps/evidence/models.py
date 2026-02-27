"""
Evidence models with polymorphic structure (5 evidence types).
Using single table inheritance pattern for easier querying.
"""
from django.db import models
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
from apps.accounts.models import User
from apps.cases.models import Case


class Evidence(models.Model):
    """
    Single model for all evidence types with type-specific fields.
    """
    EVIDENCE_TYPE_CHOICES = [
        ('witness_statement', 'Witness Statement'),
        ('biological', 'Biological/Medical'),
        ('vehicle', 'Vehicle'),
        ('identification', 'Identification Document'),
        ('other', 'Other'),
    ]
    
    # Common fields (ALL evidence)
    title = models.CharField(max_length=200)
    description = models.TextField()
    evidence_type = models.CharField(max_length=20, choices=EVIDENCE_TYPE_CHOICES)
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name='evidence_items'
    )
    recorded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='evidence_recorded'
    )
    created_date = models.DateTimeField(auto_now_add=True)
    
    # Witness Statement fields
    transcript = models.TextField(blank=True)
    witness_name = models.CharField(max_length=200, blank=True)
    witness_national_id = models.CharField(max_length=50, blank=True)
    witness_phone = models.CharField(max_length=20, blank=True)
    image = models.ImageField(upload_to='evidence/witness_statements/images/', null=True, blank=True)
    video = models.FileField(
        upload_to='evidence/witness_statements/videos/',
        null=True,
        blank=True,
        validators=[FileExtensionValidator(allowed_extensions=['mp4', 'mov', 'avi'])]
    )
    audio = models.FileField(
        upload_to='evidence/witness_statements/audio/',
        null=True,
        blank=True,
        validators=[FileExtensionValidator(allowed_extensions=['mp3', 'wav', 'm4a'])]
    )
    
    # Biological Evidence fields
    EVIDENCE_CATEGORY_CHOICES = [
        ('blood', 'Blood'),
        ('hair', 'Hair'),
        ('fingerprint', 'Fingerprint'),
        ('dna', 'DNA'),
        ('other', 'Other'),
    ]
    evidence_category = models.CharField(max_length=20, choices=EVIDENCE_CATEGORY_CHOICES, blank=True)
    image1 = models.ImageField(upload_to='evidence/biological/images/', null=True, blank=True)
    image2 = models.ImageField(upload_to='evidence/biological/images/', null=True, blank=True)
    image3 = models.ImageField(upload_to='evidence/biological/images/', null=True, blank=True)
    verified_by_forensic_doctor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='biological_evidence_verified'
    )
    verified_by_national_id = models.CharField(max_length=50, blank=True)
    verification_date = models.DateTimeField(null=True, blank=True)
    verification_notes = models.TextField(blank=True)
    is_valid = models.BooleanField(null=True, blank=True, help_text="True if deemed genuine by Forensic Doctor.")
    
    # Vehicle Evidence fields
    model = models.CharField(max_length=100, blank=True)
    color = models.CharField(max_length=50, blank=True)
    license_plate = models.CharField(max_length=20, blank=True)
    serial_number = models.CharField(max_length=100, blank=True)
    
    # Identification Document fields
    full_name = models.CharField(max_length=200, blank=True)
    metadata = models.JSONField(default=dict, blank=True)  # Arbitrary key-value pairs
    
    class Meta:
        db_table = 'evidence'
        ordering = ['-created_date']
        verbose_name = 'Evidence'
        verbose_name_plural = 'Evidence'
        indexes = [
            models.Index(fields=['evidence_type']),
            models.Index(fields=['case', 'evidence_type']),
        ]
    
    def __str__(self):
        return f'{self.title} ({self.get_evidence_type_display()})'
    
    def clean(self):
        """Validate type-specific requirements."""
        if self.evidence_type == 'witness_statement':
            if not self.transcript:
                raise ValidationError({'transcript': 'Transcript is required for witness statements.'})
        
        elif self.evidence_type == 'biological':
            if not self.image1:
                raise ValidationError({'image1': 'At least one image is required for biological evidence.'})
        
        elif self.evidence_type == 'vehicle':
            if self.license_plate and self.serial_number:
                raise ValidationError('Cannot have both license_plate and serial_number.')
            if not self.license_plate and not self.serial_number:
                raise ValidationError('Must have either license_plate or serial_number.')
            if not self.model or not self.color:
                raise ValidationError('Model and color are required for vehicle evidence.')
        
        elif self.evidence_type == 'identification':
            if not self.full_name:
                raise ValidationError({'full_name': 'Full name is required for identification documents.'})
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    def is_verified(self):
        """Check if biological evidence is verified."""
        if self.evidence_type == 'biological':
            return self.verified_by_forensic_doctor is not None and self.verification_date is not None
        return False

