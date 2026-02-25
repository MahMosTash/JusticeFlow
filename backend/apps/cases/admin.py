"""
Admin configuration for cases app.
"""
from django.contrib import admin
from .models import Case, CaseComplainant, CaseWitness


@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ['title', 'severity', 'status', 'created_by', 'created_date']
    list_filter = ['severity', 'status', 'created_date']
    search_fields = ['title', 'description']
    readonly_fields = ['created_date', 'updated_date']


@admin.register(CaseComplainant)
class CaseComplainantAdmin(admin.ModelAdmin):
    list_display = ['case', 'complainant', 'added_date']
    list_filter = ['added_date']


@admin.register(CaseWitness)
class CaseWitnessAdmin(admin.ModelAdmin):
    list_display = ['case', 'witness', 'witness_national_id', 'added_date']
    list_filter = ['added_date']

