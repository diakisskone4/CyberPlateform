from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from django.utils import timezone
from django.db.models import Q, Sum, Count
from django.contrib.auth import get_user_model
from .models import PaymentProof, Enrollment
from .serializers import (
    PaymentProofSubmitSerializer, PaymentProofSerializer,
    AdminPaymentReviewSerializer, EnrollmentSerializer
)
from courses.models import Certification, Module, Video
from learning.models import VideoProgress, QuizAttempt
from certificates.models import Certificate
from interactions.models import Notification, AuditLog
from authentication.views import IsAdminUserPermission

User = get_user_model()

class OrangeMoneyConfigView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({
            "number": getattr(settings, 'ORANGE_MONEY_CONFIG', {}).get('NUMBER', '+223 72 61 92 78'),
            "merchant_name": getattr(settings, 'ORANGE_MONEY_CONFIG', {}).get('MERCHANT_NAME', 'Cyber WTA Formation'),
            "currency": getattr(settings, 'ORANGE_MONEY_CONFIG', {}).get('CURRENCY', 'FCFA'),
            "country": getattr(settings, 'ORANGE_MONEY_CONFIG', {}).get('COUNTRY', 'Mali'),
            "instructions": [
                "1. Composez #144# ou ouvrez l'application Orange Money Mali sur votre téléphone.",
                "2. Effectuez un transfert d'argent vers le numéro : +223 72 61 92 78.",
                "3. Indiquez le montant exact correspondant au module ou à la certification choisie.",
                "4. Prenez une capture d'écran du message SMS de confirmation ou du reçu de paiement.",
                "5. Remplissez le formulaire ci-dessous avec votre capture et la référence de transaction."
            ]
        })


class PaymentProofSubmitView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PaymentProofSubmitSerializer

    def perform_create(self, serializer):
        proof = serializer.save(user=self.request.user)

        # Notify student
        Notification.objects.create(
            user=self.request.user,
            title="Preuve de paiement reçue",
            message=f"Votre preuve de paiement pour {proof.target_name} ({proof.amount} FCFA) a été transmise. Notre équipe administrative procède à sa vérification.",
            notification_type=Notification.Type.INFO
        )

        # Audit log
        AuditLog.objects.create(
            user=self.request.user,
            action="Soumission d'une preuve de paiement Orange Money",
            target_model="PaymentProof",
            target_id=str(proof.id),
            details=f"Réf : {proof.transaction_id} - Montant : {proof.amount} FCFA - Cible : {proof.target_name}"
        )


class MyPaymentProofsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PaymentProofSerializer

    def get_queryset(self):
        return PaymentProof.objects.filter(user=self.request.user).order_by('-created_at')


class MyEnrollmentsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EnrollmentSerializer

    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user, is_active=True).order_by('-granted_at')


class AdminPaymentProofListView(generics.ListAPIView):
    permission_classes = [IsAdminUserPermission]
    serializer_class = PaymentProofSerializer

    def get_queryset(self):
        queryset = PaymentProof.objects.all().order_by('-created_at')
        status_param = self.request.query_params.get('status', None)
        search = self.request.query_params.get('search', None)

        if status_param and status_param != 'ALL':
            queryset = queryset.filter(status=status_param)
        if search:
            queryset = queryset.filter(
                Q(transaction_id__icontains=search) |
                Q(sender_phone__icontains=search) |
                Q(sender_name__icontains=search) |
                Q(user__username__icontains=search) |
                Q(user__email__icontains=search)
            )
        return queryset


class AdminPaymentReviewView(APIView):
    permission_classes = [IsAdminUserPermission]

    def post(self, request, pk):
        try:
            proof = PaymentProof.objects.get(pk=pk)
        except PaymentProof.DoesNotExist:
            return Response({"error": "Preuve de paiement introuvable."}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminPaymentReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        admin_notes = serializer.validated_data.get('admin_notes', '')

        proof.status = new_status
        proof.admin_notes = admin_notes
        proof.reviewed_by = request.user
        proof.reviewed_at = timezone.now()
        proof.save()

        if new_status == PaymentProof.Status.APPROVED:
            # Grant access: Create or activate Enrollment
            enrollment = None
            if proof.target_type == PaymentProof.TargetType.CERTIFICATION:
                enrollment, _ = Enrollment.objects.update_or_create(
                    user=proof.user,
                    certification=proof.certification,
                    defaults={
                        'access_type': Enrollment.AccessType.FULL_CERTIFICATION,
                        'payment_proof': proof,
                        'is_active': True,
                    }
                )
            elif proof.target_type == PaymentProof.TargetType.MODULE:
                enrollment, _ = Enrollment.objects.update_or_create(
                    user=proof.user,
                    module=proof.module,
                    defaults={
                        'access_type': Enrollment.AccessType.SINGLE_MODULE,
                        'payment_proof': proof,
                        'is_active': True,
                    }
                )

            # Notification to user
            Notification.objects.create(
                user=proof.user,
                title="Paiement validé - Accès accordé !",
                message=f"Votre paiement Orange Money de {proof.amount} FCFA pour {proof.target_name} a été validé par l'administrateur. Vos cours et vidéos sont débloqués.",
                notification_type=Notification.Type.PAYMENT_APPROVED,
                link_url=f"/courses/{proof.certification.slug if proof.certification else proof.module.certification.slug}"
            )

            # Audit log
            AuditLog.objects.create(
                user=request.user,
                action=f"Validation du paiement #{proof.id}",
                target_model="PaymentProof",
                target_id=str(proof.id),
                details=f"Paiement validé pour {proof.user.username} → {proof.target_name}. Inscription débloquée."
            )

            return Response({
                "message": "Paiement validé avec succès. L'accès au contenu a été automatiquement accordé.",
                "proof": PaymentProofSerializer(proof).data
            })

        elif new_status == PaymentProof.Status.REJECTED:
            # If rejected, revoke any existing enrollment associated with this proof
            Enrollment.objects.filter(payment_proof=proof).update(is_active=False)

            # Notification to user
            Notification.objects.create(
                user=proof.user,
                title="Paiement non validé",
                message=f"Votre preuve de paiement pour {proof.target_name} n'a pas pu être validée. Motif : {admin_notes or 'Référence introuvable ou montant incorrect'}. Veuillez contacter le support ou renvoyer une preuve valide.",
                notification_type=Notification.Type.PAYMENT_REJECTED
            )

            # Audit log
            AuditLog.objects.create(
                user=request.user,
                action=f"Rejet du paiement #{proof.id}",
                target_model="PaymentProof",
                target_id=str(proof.id),
                details=f"Paiement rejeté pour {proof.user.username}. Motif : {admin_notes}"
            )

            return Response({
                "message": "Paiement rejeté.",
                "proof": PaymentProofSerializer(proof).data
            })


class AdminStatsView(APIView):
    permission_classes = [IsAdminUserPermission]

    def get(self, request):
        total_users = User.objects.count()
        total_students = User.objects.filter(role=User.Role.STUDENT).count()
        active_students = User.objects.filter(role=User.Role.STUDENT, is_active=True).count()
        
        pending_payments = PaymentProof.objects.filter(status=PaymentProof.Status.PENDING).count()
        approved_payments = PaymentProof.objects.filter(status=PaymentProof.Status.APPROVED).count()
        
        total_revenue = PaymentProof.objects.filter(
            status=PaymentProof.Status.APPROVED
        ).aggregate(total=Sum('amount'))['total'] or 0

        total_certifications = Certification.objects.count()
        total_modules = Module.objects.count()
        total_videos = Video.objects.count()
        total_certificates_issued = Certificate.objects.filter(is_revoked=False).count()
        total_quiz_attempts = QuizAttempt.objects.count()

        # Popular courses
        popular_courses = []
        for cert in Certification.objects.all()[:5]:
            enrollments_count = Enrollment.objects.filter(
                Q(certification=cert) | Q(module__certification=cert),
                is_active=True
            ).count()
            popular_courses.append({
                "id": cert.id,
                "title": cert.title,
                "slug": cert.slug,
                "level": cert.level,
                "enrollments_count": enrollments_count,
                "price": cert.price
            })

        popular_courses.sort(key=lambda x: x['enrollments_count'], reverse=True)

        return Response({
            "metrics": {
                "total_users": total_users,
                "total_students": total_students,
                "active_students": active_students,
                "pending_payments": pending_payments,
                "approved_payments": approved_payments,
                "total_revenue_fcfa": total_revenue,
                "total_certifications": total_certifications,
                "total_modules": total_modules,
                "total_videos": total_videos,
                "total_certificates_issued": total_certificates_issued,
                "total_quiz_attempts": total_quiz_attempts
            },
            "popular_courses": popular_courses
        })
