from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrateur'
        INSTRUCTOR = 'INSTRUCTOR', 'Formateur'
        STUDENT = 'STUDENT', 'Étudiant'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
        verbose_name="Rôle"
    )
    phone_number = models.CharField(max_length=30, blank=True, null=True, verbose_name="Numéro de téléphone")
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name="Photo de profil")
    bio = models.TextField(blank=True, verbose_name="Biographie")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_admin_user(self):
        return self.role == self.Role.ADMIN or self.is_superuser or self.is_staff

    @property
    def is_instructor_user(self):
        return self.role == self.Role.INSTRUCTOR or self.is_admin_user

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
