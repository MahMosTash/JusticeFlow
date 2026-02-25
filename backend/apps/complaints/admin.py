"""
Admin configuration for complaints app.
"""
from django.contrib import admin
from .models import Complaint, ComplaintReview


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'submitted_by', 'submission_count', 'created_date']
    list_filter = ['status', 'created_date']
    search_fields = ['title', 'description']
    readonly_fields = ['created_date', 'updated_date']


@admin.register(ComplaintReview)
class ComplaintReviewAdmin(admin.ModelAdmin):
    list_display = ['complaint', 'reviewer', 'action', 'reviewed_at']
    list_filter = ['action', 'reviewed_at']

