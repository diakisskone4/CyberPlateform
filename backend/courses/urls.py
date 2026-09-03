from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CertificationListView, CertificationDetailView, VideoPlaybackView,
    AdminCertificationViewSet, AdminModuleViewSet, AdminChapterViewSet, AdminVideoViewSet
)

router = DefaultRouter()
router.register('admin/certifications', AdminCertificationViewSet, basename='admin_certifications')
router.register('admin/modules', AdminModuleViewSet, basename='admin_modules')
router.register('admin/chapters', AdminChapterViewSet, basename='admin_chapters')
router.register('admin/videos', AdminVideoViewSet, basename='admin_videos')

urlpatterns = [
    # Public & Student routes
    path('certifications/', CertificationListView.as_view(), name='certification_list'),
    path('certifications/<str:slug>/', CertificationDetailView.as_view(), name='certification_detail'),
    path('videos/<int:pk>/playback/', VideoPlaybackView.as_view(), name='video_playback'),

    # Admin routes
    path('', include(router.urls)),
]
