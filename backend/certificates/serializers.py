from rest_framework import serializers
from .models import Certificate

class CertificateSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_username = serializers.CharField(source='user.username', read_only=True)
    certification_title = serializers.CharField(source='certification.title', read_only=True)
    certification_slug = serializers.CharField(source='certification.slug', read_only=True)
    certification_level = serializers.CharField(source='certification.get_level_display', read_only=True)
    estimated_hours = serializers.IntegerField(source='certification.estimated_hours', read_only=True)

    class Meta:
        model = Certificate
        fields = [
            'id', 'certificate_code', 'student_name', 'student_username',
            'certification_title', 'certification_slug', 'certification_level',
            'estimated_hours', 'issue_date', 'final_score', 'qr_code_data_uri',
            'is_revoked', 'revocation_reason', 'created_at'
        ]

    def get_student_name(self, obj):
        name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return name if name else obj.user.username


class PublicVerificationSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    certification_title = serializers.CharField(source='certification.title', read_only=True)
    certification_level = serializers.CharField(source='certification.get_level_display', read_only=True)
    estimated_hours = serializers.IntegerField(source='certification.estimated_hours', read_only=True)

    class Meta:
        model = Certificate
        fields = [
            'certificate_code', 'student_name', 'certification_title',
            'certification_level', 'estimated_hours', 'issue_date',
            'final_score', 'is_revoked', 'revocation_reason'
        ]

    def get_student_name(self, obj):
        name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return name if name else obj.user.username
