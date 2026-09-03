from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import Certification, Module, Chapter, Video
from .serializers import (
    CertificationListSerializer, CertificationDetailSerializer,
    VideoSerializer, AdminCertificationSerializer, AdminModuleSerializer,
    AdminChapterSerializer, AdminVideoSerializer
)
from authentication.views import IsAdminUserPermission

class CertificationListView(generics.ListAPIView):
    serializer_class = CertificationListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Certification.objects.filter(is_published=True).order_by('id')
        search = self.request.query_params.get('search', None)
        level = self.request.query_params.get('level', None)

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(short_description__icontains=search)
            )
        if level and level != 'ALL':
            queryset = queryset.filter(level=level)

        return queryset


class CertificationDetailView(generics.RetrieveAPIView):
    serializer_class = CertificationDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return Certification.objects.filter(is_published=True)

    def get_object(self):
        lookup = self.kwargs.get(self.lookup_field)
        # Support either slug or integer ID
        if lookup.isdigit():
            return generics.get_object_or_404(Certification, pk=int(lookup))
        return generics.get_object_or_404(Certification, slug=lookup)


class VideoPlaybackView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        video = generics.get_object_or_404(Video, pk=pk)
        user = request.user if request.user.is_authenticated else None
        
        is_accessible = video.is_accessible_to_user(user)
        if not is_accessible:
            return Response({
                "error": "LOCKED",
                "message": "Cette vidéo est réservée aux apprenants inscrits à ce module ou à cette certification.",
                "is_free": False,
                "is_accessible": False,
                "module_id": video.chapter.module.id,
                "module_title": video.chapter.module.title,
                "module_price": video.chapter.module.price,
                "certification_id": video.chapter.module.certification.id,
                "certification_title": video.chapter.module.certification.title,
                "certification_price": video.chapter.module.certification.price,
            }, status=status.HTTP_403_FORBIDDEN)

        # Find next and previous video in the module/certification
        module = video.chapter.module
        all_videos = list(Video.objects.filter(chapter__module=module).order_by('chapter__order', 'order', 'id'))
        current_idx = -1
        for i, v in enumerate(all_videos):
            if v.id == video.id:
                current_idx = i
                break

        prev_video_id = all_videos[current_idx - 1].id if current_idx > 0 else None
        next_video_id = all_videos[current_idx + 1].id if (current_idx >= 0 and current_idx < len(all_videos) - 1) else None

        # User progress if authenticated
        watched_seconds = 0
        is_completed = False
        if user:
            from learning.models import VideoProgress
            prog = VideoProgress.objects.filter(user=user, video=video).first()
            if prog:
                watched_seconds = prog.watched_seconds
                is_completed = prog.is_completed

        serializer = VideoSerializer(video, context={'request': request})
        return Response({
            "video": serializer.data,
            "playback_url": request.build_absolute_uri(video.video_file.url) if video.video_file else video.video_url,
            "watched_seconds": watched_seconds,
            "is_completed": is_completed,
            "prev_video_id": prev_video_id,
            "next_video_id": next_video_id,
            "module_id": module.id,
            "module_title": module.title,
            "certification_id": module.certification.id,
            "certification_title": module.certification.title,
            "certification_slug": module.certification.slug,
        })


# Admin CRUD Viewsets
class AdminCertificationViewSet(viewsets.ModelViewSet):
    queryset = Certification.objects.all().order_by('id')
    serializer_class = AdminCertificationSerializer
    permission_classes = [IsAdminUserPermission]


class AdminModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all().order_by('order', 'id')
    serializer_class = AdminModuleSerializer
    permission_classes = [IsAdminUserPermission]

    def get_queryset(self):
        queryset = super().get_queryset()
        cert_id = self.request.query_params.get('certification', None)
        if cert_id:
            queryset = queryset.filter(certification_id=cert_id)
        return queryset


class AdminChapterViewSet(viewsets.ModelViewSet):
    queryset = Chapter.objects.all().order_by('order', 'id')
    serializer_class = AdminChapterSerializer
    permission_classes = [IsAdminUserPermission]

    def get_queryset(self):
        queryset = super().get_queryset()
        module_id = self.request.query_params.get('module', None)
        if module_id:
            queryset = queryset.filter(module_id=module_id)
        return queryset


class AdminVideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all().order_by('order', 'id')
    serializer_class = AdminVideoSerializer
    permission_classes = [IsAdminUserPermission]

    def get_queryset(self):
        queryset = super().get_queryset()
        chapter_id = self.request.query_params.get('chapter', None)
        if chapter_id:
            queryset = queryset.filter(chapter_id=chapter_id)
        return queryset
