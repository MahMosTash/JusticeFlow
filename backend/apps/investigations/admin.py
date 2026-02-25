"""
Admin configuration for investigations app.
"""
from django.contrib import admin
from .models import Suspect, Interrogation, GuiltScore, CaptainDecision


@admin.register(Suspect)
class SuspectAdmin(admin.ModelAdmin):
    list_display = ['get_name', 'case', 'status', 'surveillance_start_date']
    list_filter = ['status', 'surveillance_start_date']
    search_fields = ['name', 'national_id']
    
    def get_name(self, obj):
        return obj.user.get_full_name() if obj.user else obj.name
    get_name.short_description = 'Name'


@admin.register(Interrogation)
class InterrogationAdmin(admin.ModelAdmin):
    list_display = ['suspect', 'interrogator', 'interrogation_date']
    list_filter = ['interrogation_date']


@admin.register(GuiltScore)
class GuiltScoreAdmin(admin.ModelAdmin):
    list_display = ['suspect', 'assigned_by', 'score', 'assigned_date']
    list_filter = ['score', 'assigned_date']


@admin.register(CaptainDecision)
class CaptainDecisionAdmin(admin.ModelAdmin):
    list_display = ['suspect', 'decision', 'requires_chief_approval', 'decided_at']
    list_filter = ['decision', 'requires_chief_approval']

