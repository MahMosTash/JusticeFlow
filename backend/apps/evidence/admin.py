"""
Admin configuration for evidence app.
"""
from django.contrib import admin
from .models import Evidence


@admin.register(Evidence)
class EvidenceAdmin(admin.ModelAdmin):
    list_display = ['title', 'evidence_type', 'case', 'recorded_by', 'created_date']
    list_filter = ['evidence_type', 'created_date']
    search_fields = ['title', 'description']

