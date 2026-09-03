from django.urls import path
from .views import (
    MyCertificatesListView, VerifyCertificatePublicView,
    AdminCertificateListView, AdminRevokeCertificateView
)

urlpatterns = [
    # Student Certificates
    path('my-certificates/', MyCertificatesListView.as_view(), name='my_certificates'),
    
    # Public Verification endpoint (accessible without login)
    path('verify/<str:code>/', VerifyCertificatePublicView.as_view(), name='verify_certificate_public'),

    # Admin Certificate Registry
    path('admin/certificates/', AdminCertificateListView.as_view(), name='admin_certificate_list'),
    path('admin/certificates/<int:pk>/action/', AdminRevokeCertificateView.as_view(), name='admin_revoke_certificate'),
]
