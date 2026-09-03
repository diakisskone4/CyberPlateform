from django.db import models
from django.utils.text import slugify

class Certification(models.Model):
    class Level(models.TextChoices):
        BEGINNER = 'BEGINNER', 'Débutant'
        INTERMEDIATE = 'INTERMEDIATE', 'Intermédiaire'
        ADVANCED = 'ADVANCED', 'Avancé'

    title = models.CharField(max_length=255, verbose_name="Titre")
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(verbose_name="Description détaillée")
    short_description = models.CharField(max_length=500, blank=True, verbose_name="Description courte")
    level = models.CharField(max_length=20, choices=Level.choices, default=Level.BEGINNER, verbose_name="Niveau")
    estimated_hours = models.PositiveIntegerField(default=20, verbose_name="Durée estimée (heures)")
    price = models.DecimalField(max_digits=10, decimal_places=0, default=25000, verbose_name="Prix complet (FCFA)")
    thumbnail = models.CharField(max_length=500, blank=True, default="", verbose_name="Image de couverture (URL ou chemin)")
    prerequisites = models.TextField(blank=True, default="Aucun prérequis spécifique. Connaissances de base en informatique recommandées.", verbose_name="Prérequis")
    learning_outcomes = models.TextField(blank=True, default="", verbose_name="Objectifs pédagogiques")
    badge_name = models.CharField(max_length=100, blank=True, default="Cyber Defender", verbose_name="Nom du badge")
    is_published = models.BooleanField(default=True, verbose_name="Publié")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['title']
        verbose_name = "Certification"
        verbose_name_plural = "Certifications"

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Certification.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    @property
    def total_modules(self):
        return self.modules.count()

    @property
    def total_videos(self):
        return Video.objects.filter(chapter__module__certification=self).count()

    def __str__(self):
        return f"{self.title} ({self.get_level_display()})"


class Module(models.Model):
    certification = models.ForeignKey(Certification, on_delete=models.CASCADE, related_name='modules', verbose_name="Certification")
    title = models.CharField(max_length=255, verbose_name="Titre du module")
    order = models.PositiveIntegerField(default=1, verbose_name="Ordre d'affichage")
    description = models.TextField(blank=True, verbose_name="Description")
    price = models.DecimalField(max_digits=10, decimal_places=0, default=10000, verbose_name="Prix individuel du module (FCFA)")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = "Module"
        verbose_name_plural = "Modules"

    @property
    def total_videos(self):
        return Video.objects.filter(chapter__module=self).count()

    def __str__(self):
        return f"Module {self.order}: {self.title} - ({self.certification.title})"


class Chapter(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='chapters', verbose_name="Module")
    title = models.CharField(max_length=255, verbose_name="Titre du chapitre")
    order = models.PositiveIntegerField(default=1, verbose_name="Ordre d'affichage")
    description = models.TextField(blank=True, verbose_name="Description")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = "Chapitre"
        verbose_name_plural = "Chapitres"

    def __str__(self):
        return f"Chapitre {self.order}: {self.title} ({self.module.title})"


class Video(models.Model):
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='videos', verbose_name="Chapitre")
    title = models.CharField(max_length=255, verbose_name="Titre de la vidéo")
    order = models.PositiveIntegerField(default=1, verbose_name="Ordre d'affichage")
    video_url = models.CharField(max_length=500, blank=True, default='', verbose_name="Ancienne URL de la vidéo")
    video_file = models.FileField(upload_to='videos/', blank=True, null=True, verbose_name="Fichier vidéo")
    duration_seconds = models.PositiveIntegerField(default=420, verbose_name="Durée en secondes")
    is_free_override = models.BooleanField(default=False, verbose_name="Forcer l'accès gratuit")
    resources_notes = models.TextField(blank=True, verbose_name="Notes de cours / Téléchargements")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = "Vidéo"
        verbose_name_plural = "Vidéos"

    @property
    def module(self):
        return self.chapter.module

    @property
    def is_free_by_rule(self):
        """
        Règle : Les 2 premières vidéos de chaque module sont gratuites.
        Ou si is_free_override est True.
        """
        if self.is_free_override:
            return True
        # Récupérer toutes les vidéos du module ordonnées par chapitre.order et video.order
        module_videos = list(
            Video.objects.filter(chapter__module=self.chapter.module)
            .order_by('chapter__order', 'order', 'id')
            .values_list('id', flat=True)
        )
        if self.id in module_videos[:2]:
            return True
        return False

    def is_accessible_to_user(self, user):
        if self.is_free_by_rule:
            return True
        if not user or not user.is_authenticated:
            return False
        if user.is_admin_user:
            return True
        # Vérifier si l'utilisateur possède une inscription active pour le module OU pour la certification
        from payments.models import Enrollment
        has_enrollment = Enrollment.objects.filter(
            user=user,
            is_active=True
        ).filter(
            models.Q(module=self.chapter.module) | 
            models.Q(certification=self.chapter.module.certification)
        ).exists()
        return has_enrollment

    def __str__(self):
        free_tag = "[GRATUIT]" if self.is_free_by_rule else "[PAYANT]"
        return f"{self.title} {free_tag} (Ch. {self.chapter.order})"
