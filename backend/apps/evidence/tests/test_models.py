"""
Tests for evidence models.
"""
from django.test import TestCase
from django.core.exceptions import ValidationError
from apps.evidence.models import Evidence
from apps.accounts.models import User
from apps.cases.models import Case


class EvidenceModelTest(TestCase):
    """Tests for Evidence model."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            phone_number='1234567890',
            national_id='123456789'
        )
        self.case = Case.objects.create(
            title='Test Case',
            description='Test description',
            severity='Level 2',
            created_by=self.user
        )
    
    def test_witness_statement_creation(self):
        """Test witness statement evidence creation."""
        evidence = Evidence.objects.create(
            title='Witness Statement',
            description='Test statement',
            evidence_type='witness_statement',
            case=self.case,
            recorded_by=self.user,
            transcript='Test transcript',
            witness_name='John Doe'
        )
        self.assertEqual(evidence.evidence_type, 'witness_statement')
        self.assertEqual(evidence.transcript, 'Test transcript')
    
    def test_vehicle_evidence_validation(self):
        """Test vehicle evidence validation (license_plate OR serial_number)."""
        # Should fail with both
        with self.assertRaises(ValidationError):
            evidence = Evidence(
                title='Vehicle',
                description='Test vehicle',
                evidence_type='vehicle',
                case=self.case,
                recorded_by=self.user,
                model='Toyota',
                color='Red',
                license_plate='ABC123',
                serial_number='XYZ789'
            )
            evidence.full_clean()
        
        # Should succeed with only license_plate
        evidence = Evidence.objects.create(
            title='Vehicle',
            description='Test vehicle',
            evidence_type='vehicle',
            case=self.case,
            recorded_by=self.user,
            model='Toyota',
            color='Red',
            license_plate='ABC123'
        )
        self.assertIsNotNone(evidence.id)
    
    def test_biological_evidence_verification(self):
        """Test biological evidence verification."""
        evidence = Evidence.objects.create(
            title='Biological Evidence',
            description='Test biological',
            evidence_type='biological',
            case=self.case,
            recorded_by=self.user,
            evidence_category='blood',
            image1='test.jpg'
        )
        
        self.assertFalse(evidence.is_verified())
        
        from apps.accounts.models import User, Role
        forensic_role = Role.objects.create(name='Forensic Doctor')
        forensic_doctor = User.objects.create_user(
            username='forensic',
            email='forensic@example.com',
            password='testpass123',
            phone_number='9999999999',
            national_id='999999999'
        )
        forensic_doctor.assign_role(forensic_role)
        
        from django.utils import timezone
        evidence.verified_by_forensic_doctor = forensic_doctor
        evidence.verification_date = timezone.now()
        evidence.save()
        
        self.assertTrue(evidence.is_verified())

