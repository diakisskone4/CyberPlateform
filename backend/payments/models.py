from django.db import models
from django.conf import settings
from courses.models import Certification, Module

class PaymentProof(models.Model):
    class TargetType(models.TextChoices):
        CERTIFICATION = 'CERTIFICATION', 'Certification Complète'
        MODULE = 'MODULE', 'Module Individuel'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'En attente de vérification'
        APPROVED = 'APPROVED', 'Validé'
        REJECTED = 'REJECTED', 'Refusé'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payment_proofs', verbose_name="Utilisateur")
    target_type = models.CharField(max_length=20, choices=TargetType.choices, default=TargetType.CERTIFICATION, verbose_name="Type de cible")
    certification = models.ForeignKey(Certification, on_delete=models.SET_NULL, null=True, blank=True, related_name='payment_proofs', verbose_name="Certification ciblée")
    module = models.ForeignKey(Module, on_delete=models.SET_NULL, null=True, blank=True, related_name='payment_proofs', verbose_name="Module ciblé")
    
    transaction_id = models.CharField(max_length=100, verbose_name="ID de transaction Orange Money")
    sender_phone = models.CharField(max_length=30, verbose_name="Numéro de l'expéditeur")
    sender_name = models.CharField(max_length=100, blank=True, default="", verbose_name="Nom complet de l'expéditeur")
    amount = models.DecimalField(max_digits=10, decimal_places=0, verbose_name="Montant payé (FCFA)")
    proof_image = models.ImageField(upload_to='payment_proofs/', blank=True, null=True, verbose_name="Capture d'écran du paiement")
    proof_image_url = models.CharField(max_length=500, blank=True, default="", verbose_name="URL de la capture")
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, verbose_name="Statut")
    admin_notes = models.TextField(blank=True, default="", verbose_name="Commentaires de l'administrateur / Motif de refus")
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_payments', verbose_name="Validé par")
    reviewed_at = models.DateTimeField(null=True, blank=True, verbose_name="Date de revue")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date d'envoi")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Preuve de paiement"
        verbose_name_plural = "Preuves de paiement"

    @property
    def target_name(self):
        if self.target_type == self.TargetType.CERTIFICATION and self.certification:
            return f"Certification : {self.certification.title}"
        elif self.target_type == self.TargetType.MODULE and self.module:
            return f"Module : {self.module.title} ({self.module.certification.title})"
        return "Non spécifié"

    def __str__(self):
        return f"Paiement {self.transaction_id} - {self.user.username} ({self.get_status_display()})"


class Enrollment(models.Model):
    class AccessType(models.TextChoices):
        FULL_CERTIFICATION = 'FULL_CERTIFICATION', 'Accès Certification Complète'
        SINGLE_MODULE = 'SINGLE_MODULE', 'Accès Module Individuel'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments', verbose_name="Utilisateur")
    access_type = models.CharField(max_length=30, choices=AccessType.choices, default=AccessType.FULL_CERTIFICATION, verbose_name="Type d'accès")
    certification = models.ForeignKey(Certification, on_delete=models.CASCADE, null=True, blank=True, related_name='enrollments', verbose_name="Certification")
    module = models.ForeignKey(Module, on_delete=models.CASCADE, null=True, blank=True, related_name='enrollments', verbose_name="Module")
    payment_proof = models.ForeignKey(PaymentProof, on_delete=models.SET_NULL, null=True, blank=True, related_name='granted_enrollments', verbose_name="Preuve de paiement liée")
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    granted_at = models.DateTimeField(auto_now_add=True, verbose_name="Accordé le")
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name="Expire le")

    class Meta:
        ordering = ['-granted_at']
        verbose_name = "Inscription & Accès"
        verbose_name_plural = "Inscriptions & Accès"

    def __str__(self):
        target = self.certification.title if self.certification else (self.module.title if self.module else "Inconnu")
        return f"Accès [{self.user.username}] → {target}"
