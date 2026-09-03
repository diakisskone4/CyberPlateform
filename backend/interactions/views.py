from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import LessonComment, Notification, AuditLog
from .serializers import LessonCommentSerializer, NotificationSerializer, AuditLogSerializer
from courses.models import Video
from authentication.views import IsAdminUserPermission

class VideoCommentsListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, video_id):
        video = get_object_or_404(Video, pk=video_id)
        # Fetch root comments
        root_comments = video.comments.filter(parent=None).order_by('created_at')
        serializer = LessonCommentSerializer(root_comments, many=True)
        return Response(serializer.data)

    def post(self, request, video_id):
        if not request.user.is_authenticated:
            return Response({"error": "Connexion requise pour poser une question."}, status=status.HTTP_401_UNAUTHORIZED)
        
        video = get_object_or_404(Video, pk=video_id)
        content = request.data.get('content', '').strip()
        parent_id = request.data.get('parent', None)

        if not content:
            return Response({"error": "Le contenu du message ne peut pas être vide."}, status=status.HTTP_400_BAD_REQUEST)

        parent = None
        if parent_id:
            parent = get_object_or_404(LessonComment, pk=parent_id, video=video)

        comment = LessonComment.objects.create(
            video=video,
            user=request.user,
            parent=parent,
            content=content
        )

        return Response(LessonCommentSerializer(comment).data, status=status.HTTP_201_CREATED)


class NotificationListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')


class NotificationMarkAllReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"message": "Toutes les notifications ont été marquées comme lues."})


class NotificationMarkOneReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        notif = get_object_or_404(Notification, pk=pk, user=request.user)
        notif.is_read = True
        notif.save()
        return Response({"message": "Notification marquée comme lue."})


class AdminAuditLogListView(generics.ListAPIView):
    permission_classes = [IsAdminUserPermission]
    serializer_class = AuditLogSerializer

    def get_queryset(self):
        queryset = AuditLog.objects.all().order_by('-created_at')
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                action__icontains=search
            ) | queryset.filter(
                details__icontains=search
            ) | queryset.filter(
                user__username__icontains=search
            )
        return queryset
