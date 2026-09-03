from django.urls import path
from .views import (
    OrangeMoneyConfigView, PaymentProofSubmitView, MyPaymentProofsView,
    MyEnrollmentsView, AdminPaymentProofListView, AdminPaymentReviewView,
    AdminStatsView
)

urlpatterns = [
    # Public / Student payment endpoints
    path('orange-money/config/', OrangeMoneyConfigView.as_view(), name='orange_money_config'),
    path('proofs/submit/', PaymentProofSubmitView.as_view(), name='payment_proof_submit'),
    path('proofs/my-proofs/', MyPaymentProofsView.as_view(), name='my_payment_proofs'),
    path('my-enrollments/', MyEnrollmentsView.as_view(), name='my_enrollments'),

    # Admin payment endpoints
    path('admin/proofs/', AdminPaymentProofListView.as_view(), name='admin_payment_proof_list'),
    path('admin/proofs/<int:pk>/review/', AdminPaymentReviewView.as_view(), name='admin_payment_review'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin_stats'),
]
