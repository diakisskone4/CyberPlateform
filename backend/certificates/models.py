import secrets
import qrcode
import io
import base64
from django.db import models
from django.conf import settings
from django.utils import timezone
from courses.models import Certification

def generate_certificate_code():
    year = timezone.now().year
    part1 = secrets.token_hex(2).upper()
    part2 = secrets.token_hex(2).upper()
    return f"CWTA-{year}-{part1}-{part2}"

class Certificate(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='certificates', verbose_name="Étudiant")
    certification = models.ForeignKey(Certification, on_delete=models.CASCADE, related_name='issued_certificates', verbose_name="Certification")
    certificate_code = models.CharField(max_length=64, unique=True, default=generate_certificate_code, db_index=True, verbose_name="Numéro unique de certificat")
    issue_date = models.DateField(auto_now_add=True, verbose_name="Date d'obtention")
    final_score = models.FloatField(default=100.0, verbose_name="Score final obtenu (%)")
    qr_code_data_uri = models.TextField(blank=True, default="", verbose_name="Code QR (Data URI)")
    is_revoked = models.BooleanField(default=False, verbose_name="Certificat révoqué")
    revocation_reason = models.TextField(blank=True, default="", verbose_name="Motif de révocation")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-issue_date']
        unique_together = ('user', 'certification')
        verbose_name = "Certificat Numérique"
        verbose_name_plural = "Certificats Numériques"

    def generate_qr_code(self, base_url="http://localhost:5173/verify"):
        verification_link = f"{base_url}/{self.certificate_code}"
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=8,
            border=2,
        )
        qr.add_data(verification_link)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#00f0ff", back_color="#0b0f19")
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        self.qr_code_data_uri = f"data:image/png;base64,{img_str}"
        return self.qr_code_data_uri

    def save(self, *args, **kwargs):
        if not self.certificate_code:
            self.certificate_code = generate_certificate_code()
        if not self.qr_code_data_uri:
            self.generate_qr_code()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Certificat {self.certificate_code} - {self.user.get_full_name() or self.user.username} ({self.certification.title})"
