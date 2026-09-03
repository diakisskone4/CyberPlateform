from rest_framework import serializers
from .models import LessonComment, Notification, AuditLog

class LessonCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_avatar = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    class Meta:
        model = LessonComment
        fields = [
            'id', 'video', 'parent', 'content', 'author_name',
            'author_avatar', 'replies', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'author_name', 'author_avatar', 'replies']

    def get_author_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username

    def get_author_avatar(self, obj):
        if obj.user.avatar:
            return obj.user.avatar.url
        return None

    def get_replies(self, obj):
        if obj.parent is None:
            replies = obj.replies.all()
            return LessonCommentSerializer(replies, many=True).data
        return []


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'notification_type', 'is_read', 'link_url', 'created_at']


class AuditLogSerializer(serializers.ModelSerializer):
    user_display = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = ['id', 'user_display', 'action', 'target_model', 'target_id', 'details', 'created_at']

    def get_user_display(self, obj):
        if obj.user:
            return f"{obj.user.username} ({obj.user.get_role_display()})"
        return "Système"
