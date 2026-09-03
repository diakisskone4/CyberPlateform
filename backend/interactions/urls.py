from django.urls import path
from .views import (
    VideoCommentsListCreateView, NotificationListView, NotificationMarkAllReadView,
    NotificationMarkOneReadView, AdminAuditLogListView
)

urlpatterns = [
    # Video Comments Q&A
    path('videos/<int:video_id>/comments/', VideoCommentsListCreateView.as_view(), name='video_comments'),

    # Notifications
    path('notifications/', NotificationListView.as_view(), name='notification_list'),
    path('notifications/mark-all-read/', NotificationMarkAllReadView.as_view(), name='notification_mark_all_read'),
    path('notifications/<int:pk>/mark-read/', NotificationMarkOneReadView.as_view(), name='notification_mark_one_read'),

    # Admin Audit Logs
    path('admin/audit-logs/', AdminAuditLogListView.as_view(), name='admin_audit_logs'),
]
