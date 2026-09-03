from django.db import models
from django.conf import settings
from courses.models import Video

class LessonComment(models.Model):
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='comments', verbose_name="Vidéo")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lesson_comments', verbose_name="Auteur")
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies', verbose_name="Réponse à")
    content = models.TextField(verbose_name="Message / Question")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = "Commentaire de cours"
        verbose_name_plural = "Commentaires de cours"

    def __str__(self):
        return f"{self.user.username} sur {self.video.title} : {self.content[:30]}"


class Notification(models.Model):
    class Type(models.TextChoices):
        PAYMENT_APPROVED = 'PAYMENT_APPROVED', 'Paiement Validé'
        PAYMENT_REJECTED = 'PAYMENT_REJECTED', 'Paiement Refusé'
        CERTIFICATE_ISSUED = 'CERTIFICATE_ISSUED', 'Certificat Délivré'
        QUIZ_PASSED = 'QUIZ_PASSED', 'Quiz Réussi'
        COURSE_ACCESS = 'COURSE_ACCESS', 'Accès Cours'
        INFO = 'INFO', 'Information'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications', verbose_name="Destinataire")
    title = models.CharField(max_length=255, verbose_name="Titre de la notification")
    message = models.TextField(verbose_name="Message")
    notification_type = models.CharField(max_length=30, choices=Type.choices, default=Type.INFO, verbose_name="Type")
    is_read = models.BooleanField(default=False, verbose_name="Lu")
    link_url = models.CharField(max_length=255, blank=True, default="", verbose_name="Lien d'action")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"

    def __str__(self):
        return f"[{self.get_notification_type_display()}] {self.title} → {self.user.username}"


class AuditLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs', verbose_name="Utilisateur / Admin")
    action = models.CharField(max_length=255, verbose_name="Action effectuée")
    target_model = models.CharField(max_length=100, blank=True, default="", verbose_name="Modèle ciblé")
    target_id = models.CharField(max_length=100, blank=True, default="", verbose_name="ID de la cible")
    details = models.TextField(blank=True, default="", verbose_name="Détails de l'action")
    ip_address = models.CharField(max_length=50, blank=True, default="", verbose_name="Adresse IP")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Journal d'audit"
        verbose_name_plural = "Journaux d'audit"

    def __str__(self):
        username = self.user.username if self.user else "Système"
        return f"[{self.created_at.strftime('%d/%m/%Y %H:%M')}] {username} : {self.action}"
