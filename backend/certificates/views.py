from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Certificate
from .serializers import CertificateSerializer, PublicVerificationSerializer
from interactions.models import AuditLog
from authentication.views import IsAdminUserPermission

class MyCertificatesListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CertificateSerializer

    def get_queryset(self):
        return Certificate.objects.filter(user=self.request.user).order_by('-issue_date')


class VerifyCertificatePublicView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, code):
        clean_code = code.strip()
        cert = Certificate.objects.filter(certificate_code__iexact=clean_code).first()

        if not cert:
            return Response({
                "is_valid": False,
                "message": "Aucun certificat correspondant à ce numéro n'a été trouvé dans le registre officiel Cyber WTA.",
                "certificate_code": clean_code
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = PublicVerificationSerializer(cert)
        return Response({
            "is_valid": not cert.is_revoked,
            "status_text": "CERTIFICAT AUTHENTIQUE ET VALIDE" if not cert.is_revoked else "CERTIFICAT RÉVOQUÉ",
            "certificate": serializer.data
        })


class AdminCertificateListView(generics.ListAPIView):
    permission_classes = [IsAdminUserPermission]
    serializer_class = CertificateSerializer

    def get_queryset(self):
        queryset = Certificate.objects.all().order_by('-issue_date')
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                certificate_code__icontains=search
            ) | queryset.filter(
                user__username__icontains=search
            ) | queryset.filter(
                user__first_name__icontains=search
            ) | queryset.filter(
                user__last_name__icontains=search
            ) | queryset.filter(
                certification__title__icontains=search
            )
        return queryset


class AdminRevokeCertificateView(APIView):
    permission_classes = [IsAdminUserPermission]

    def post(self, request, pk):
        cert = get_object_or_404(Certificate, pk=pk)
        action = request.data.get('action', 'revoke') # revoke or reinstate
        reason = request.data.get('reason', 'Non-respect des conditions déontologiques')

        if action == 'revoke':
            cert.is_revoked = True
            cert.revocation_reason = reason
            cert.save()
            AuditLog.objects.create(
                user=request.user,
                action=f"Révocation du certificat {cert.certificate_code}",
                target_model="Certificate",
                target_id=str(cert.id),
                details=f"Révocation pour {cert.user.username}. Motif : {reason}"
            )
            return Response({"message": f"Le certificat {cert.certificate_code} a été révoqué.", "is_revoked": True})
        else:
            cert.is_revoked = False
            cert.revocation_reason = ""
            cert.save()
            AuditLog.objects.create(
                user=request.user,
                action=f"Rétablissement du certificat {cert.certificate_code}",
                target_model="Certificate",
                target_id=str(cert.id),
                details=f"Certificat rétabli pour {cert.user.username}."
            )
            return Response({"message": f"Le certificat {cert.certificate_code} a été rétabli.", "is_revoked": False})
