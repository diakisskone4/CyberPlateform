from rest_framework import serializers
from .models import Certification, Module, Chapter, Video
from payments.models import Enrollment

class VideoSerializer(serializers.ModelSerializer):
    is_free = serializers.BooleanField(source='is_free_by_rule', read_only=True)
    is_accessible = serializers.SerializerMethodField()
    playback_url = serializers.SerializerMethodField()
    module_id = serializers.IntegerField(source='chapter.module.id', read_only=True)
    chapter_title = serializers.CharField(source='chapter.title', read_only=True)

    class Meta:
        model = Video
        fields = [
            'id', 'chapter', 'chapter_title', 'module_id', 'title', 'order',
            'duration_seconds', 'is_free', 'is_free_override',
            'resources_notes', 'is_accessible', 'playback_url', 'created_at'
        ]

    def get_is_accessible(self, obj):
        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None
        return obj.is_accessible_to_user(user)

    def get_playback_url(self, obj):
        # Protected playback URL: only exposed if accessible!
        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None
        if obj.is_accessible_to_user(user):
            return obj.video_url
        return None


class ChapterSerializer(serializers.ModelSerializer):
    videos = VideoSerializer(many=True, read_only=True)
    total_videos = serializers.SerializerMethodField()

    class Meta:
        model = Chapter
        fields = ['id', 'module', 'title', 'order', 'description', 'videos', 'total_videos']

    def get_total_videos(self, obj):
        return obj.videos.count()


class ModuleSerializer(serializers.ModelSerializer):
    chapters = ChapterSerializer(many=True, read_only=True)
    total_videos = serializers.ReadOnlyField()
    is_accessible = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = [
            'id', 'certification', 'title', 'order', 'description',
            'price', 'total_videos', 'is_accessible', 'chapters'
        ]

    def get_is_accessible(self, obj):
        # Le premier module (Module 1) de chaque certification est toujours accessible.
        first_module = Module.objects.filter(
            certification=obj.certification
        ).order_by('order', 'id').first()
        if first_module and obj.id == first_module.id:
            return True

        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        user = request.user
        if user.is_admin_user:
            return True
        from django.db.models import Q
        return Enrollment.objects.filter(
            user=user,
            is_active=True
        ).filter(
            Q(module=obj) | Q(certification=obj.certification)
        ).exists()


class CertificationListSerializer(serializers.ModelSerializer):
    total_modules = serializers.ReadOnlyField()
    total_videos = serializers.ReadOnlyField()
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Certification
        fields = [
            'id', 'title', 'slug', 'description', 'short_description',
            'level', 'level_display', 'estimated_hours', 'price',
            'thumbnail', 'badge_name', 'total_modules', 'total_videos',
            'is_enrolled', 'created_at'
        ]

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return Enrollment.objects.filter(
            user=request.user,
            certification=obj,
            is_active=True
        ).exists()


class CertificationDetailSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    total_modules = serializers.ReadOnlyField()
    total_videos = serializers.ReadOnlyField()
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    user_enrolled_modules = serializers.SerializerMethodField()
    user_progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = Certification
        fields = [
            'id', 'title', 'slug', 'description', 'short_description',
            'level', 'level_display', 'estimated_hours', 'price',
            'thumbnail', 'prerequisites', 'learning_outcomes', 'badge_name',
            'total_modules', 'total_videos', 'is_enrolled', 'user_enrolled_modules',
            'user_progress_percent', 'modules', 'created_at'
        ]

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        if request.user.is_admin_user:
            return True
        return Enrollment.objects.filter(user=request.user, certification=obj, is_active=True).exists()

    def get_user_enrolled_modules(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return []
        if request.user.is_admin_user:
            return list(obj.modules.values_list('id', flat=True))
        return list(Enrollment.objects.filter(
            user=request.user,
            module__certification=obj,
            is_active=True
        ).values_list('module_id', flat=True))

    def get_user_progress_percent(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        from learning.models import VideoProgress
        total_vids = Video.objects.filter(chapter__module__certification=obj).count()
        if total_vids == 0:
            return 0
        completed_vids = VideoProgress.objects.filter(
            user=request.user,
            video__chapter__module__certification=obj,
            is_completed=True
        ).count()
        return round((completed_vids / total_vids) * 100)


# Admin CRUD Serializers
class AdminCertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = '__all__'


class AdminModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = '__all__'


class AdminChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = '__all__'


class AdminVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = '__all__'
