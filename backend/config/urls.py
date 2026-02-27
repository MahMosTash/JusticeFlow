"""
URL configuration for Police Case Management System.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Swagger/OpenAPI schema view
schema_view = get_schema_view(
    openapi.Info(
        title="Police Case Management System API",
        default_version='v1',
        description="""
        Complete REST API documentation for the Police Case Management System.
        
        ## Authentication
        This API uses Token-based authentication. Include the token in the Authorization header:
        ```
        Authorization: Token <your-token>
        ```
        
        ## Key Features
        - Dynamic Role-Based Access Control (RBAC)
        - Case Management (Complaint-based and Crime Scene-based)
        - Evidence Management (5 types: Witness Statements, Biological, Vehicle, ID Documents, Other)
        - Detective Board (Visual case analysis)
        - Investigation Tools (Suspects, Interrogations, Guilt Scoring)
        - Trial Management (Judge verdicts and punishments)
        - Rewards System (Information submission and approval)
        - Most Wanted / Under Severe Surveillance
        - Optional: Bail and Fine Payment
        
        ## Workflows
        ### Complaint-Based Case Creation
        1. Complainant submits complaint
        2. Intern reviews (can return or forward)
        3. Police Officer approves/rejects
        4. If approved, case is created
        
        ### Crime Scene-Based Case Creation
        1. Police Officer/Patrol Officer creates case
        2. Requires superior approval (unless Police Chief)
        3. Case created immediately after approval
        
        ### Case Resolution
        1. Detective uses visual board to analyze
        2. Proposes suspects
        3. Sergeant reviews and approves/rejects
        4. If approved, arrest begins
        
        ### Interrogation & Decision
        1. Detective and Sergeant interrogate suspects
        2. Each assigns guilt score (1-10)
        3. Captain reviews and makes decision
        4. Critical crimes require Police Chief approval
        
        ### Trial
        1. Judge reviews complete case
        2. Records verdict (Guilty/Not Guilty)
        3. Records punishment with title and description
        """,
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@police-system.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('api/swagger.json', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('api/swagger.yaml', schema_view.without_ui(cache_timeout=0), name='schema-yaml'),
    
    # API endpoints
    path('api/auth/', include('apps.accounts.urls')),
    path('api/cases/', include('apps.cases.urls')),
    path('api/complaints/', include('apps.complaints.urls')),
    path('api/evidence/', include('apps.evidence.urls')),
    path('api/investigations/', include('apps.investigations.urls')),
    path('api/detective-board/', include('apps.detective_board.urls')),
    path('api/trials/', include('apps.trials.urls')),
    path('api/rewards/', include('apps.rewards.urls')),
    path('api/payments/', include('apps.payments.urls')),
]

from django.urls import re_path
from django.views.static import serve

urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
]

