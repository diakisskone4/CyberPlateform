from rest_framework import serializers
from .models import PaymentProof, Enrollment
from courses.models import Certification, Module
from authentication.serializers import UserSerializer

class PaymentProofSubmitSerializer(serializers.ModelSerializer):
    proof_image = serializers.ImageField(required=False, allow_null=True)
    proof_image_url = serializers.CharField(required=False, allow_blank=True, default="")

    class Meta:
        model = PaymentProof
        fields = [
            'id', 'target_type', 'certification', 'module',
            'transaction_id', 'sender_phone', 'sender_name',
            'amount', 'proof_image', 'proof_image_url'
        ]

    def validate(self, attrs):
        target_type = attrs.get('target_type')
        cert = attrs.get('certification')
        module = attrs.get('module')

        if target_type == PaymentProof.TargetType.CERTIFICATION and not cert:
            raise serializers.ValidationError({"certification": "Veuillez sélectionner une certification valide."})
        if target_type == PaymentProof.TargetType.MODULE and not module:
            raise serializers.ValidationError({"module": "Veuillez sélectionner un module valide."})
        return attrs


class PaymentProofSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    target_name = serializers.ReadOnlyField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    reviewed_by_name = serializers.SerializerMethodField()
    certification_title = serializers.CharField(source='certification.title', read_only=True, default=None)
    module_title = serializers.CharField(source='module.title', read_only=True, default=None)

    class Meta:
        model = PaymentProof
        fields = [
            'id', 'user', 'target_type', 'certification', 'certification_title',
            'module', 'module_title', 'target_name', 'transaction_id',
            'sender_phone', 'sender_name', 'amount', 'proof_image', 'proof_image_url',
            'status', 'status_display', 'admin_notes', 'reviewed_by_name',
            'reviewed_at', 'created_at'
        ]

    def get_reviewed_by_name(self, obj):
        if obj.reviewed_by:
            return obj.reviewed_by.get_full_name() or obj.reviewed_by.username
        return None


class AdminPaymentReviewSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[PaymentProof.Status.APPROVED, PaymentProof.Status.REJECTED])
    admin_notes = serializers.CharField(required=False, allow_blank=True, default="")


class EnrollmentSerializer(serializers.ModelSerializer):
    certification_title = serializers.CharField(source='certification.title', read_only=True, default=None)
    certification_slug = serializers.CharField(source='certification.slug', read_only=True, default=None)
    module_title = serializers.CharField(source='module.title', read_only=True, default=None)
    module_certification_id = serializers.IntegerField(source='module.certification.id', read_only=True, default=None)
    access_type_display = serializers.CharField(source='get_access_type_display', read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            'id', 'access_type', 'access_type_display', 'certification',
            'certification_title', 'certification_slug', 'module',
            'module_title', 'module_certification_id', 'is_active', 'granted_at'
        ]
