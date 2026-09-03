from django.db import models
from django.conf import settings
from courses.models import Video, Module, Certification

class VideoProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='video_progresses')
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='user_progresses')
    watched_seconds = models.PositiveIntegerField(default=0, verbose_name="Secondes regardées")
    is_completed = models.BooleanField(default=False, verbose_name="Terminé")
    last_watched_at = models.DateTimeField(auto_now=True, verbose_name="Dernier visionnage")

    class Meta:
        unique_together = ('user', 'video')
        verbose_name = "Progression Vidéo"
        verbose_name_plural = "Progressions Vidéos"

    def __str__(self):
        status = "Validé" if self.is_completed else f"{self.watched_seconds}s"
        return f"{self.user.username} - {self.video.title} ({status})"


class Quiz(models.Model):
    class QuizType(models.TextChoices):
        MODULE_QUIZ = 'MODULE_QUIZ', 'Quiz de fin de module'
        FINAL_EXAM = 'FINAL_EXAM', 'Examen final de certification'

    title = models.CharField(max_length=255, verbose_name="Titre du Quiz / Examen")
    quiz_type = models.CharField(max_length=20, choices=QuizType.choices, default=QuizType.MODULE_QUIZ, verbose_name="Type d'évaluation")
    certification = models.ForeignKey(Certification, on_delete=models.CASCADE, null=True, blank=True, related_name='quizzes', verbose_name="Certification liée")
    module = models.ForeignKey(Module, on_delete=models.CASCADE, null=True, blank=True, related_name='quizzes', verbose_name="Module lié")
    description = models.TextField(blank=True, default="", verbose_name="Instructions / Description")
    pass_percentage = models.PositiveIntegerField(default=75, verbose_name="Score minimum requis (%)")
    time_limit_minutes = models.PositiveIntegerField(default=15, verbose_name="Temps limite (minutes)")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']
        verbose_name = "Quiz / Examen"
        verbose_name_plural = "Quiz & Examens"

    @property
    def total_questions(self):
        return self.questions.count()

    def __str__(self):
        target = self.module.title if self.module else (self.certification.title if self.certification else "Général")
        return f"{self.title} [{self.get_quiz_type_display()}] - {target}"


class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField(verbose_name="Énoncé de la question")
    explanation = models.TextField(blank=True, default="", verbose_name="Explication pédagogique affichée après réponse")
    points = models.PositiveIntegerField(default=1, verbose_name="Points")
    order = models.PositiveIntegerField(default=1, verbose_name="Ordre")

    class Meta:
        ordering = ['order', 'id']
        verbose_name = "Question"
        verbose_name_plural = "Questions"

    def __str__(self):
        return f"Q{self.order}: {self.text[:60]}..."


class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField(max_length=500, verbose_name="Option de réponse")
    is_correct = models.BooleanField(default=False, verbose_name="Est la bonne réponse")

    class Meta:
        verbose_name = "Choix"
        verbose_name_plural = "Choix"

    def __str__(self):
        mark = "✓" if self.is_correct else "✗"
        return f"{mark} {self.text[:50]}"


class QuizAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    score = models.FloatField(default=0.0, verbose_name="Score obtenu")
    total_points = models.FloatField(default=0.0, verbose_name="Points totaux")
    percentage = models.FloatField(default=0.0, verbose_name="Pourcentage obtenu (%)")
    passed = models.BooleanField(default=False, verbose_name="Réussi")
    answers_data = models.JSONField(default=dict, blank=True, verbose_name="Détail des réponses")
    completed_at = models.DateTimeField(auto_now_add=True, verbose_name="Date et heure de passage")

    class Meta:
        ordering = ['-completed_at']
        verbose_name = "Tentative de Quiz"
        verbose_name_plural = "Tentatives de Quiz"

    def __str__(self):
        status = "REUSSI" if self.passed else "ECHOUE"
        return f"{self.user.username} - {self.quiz.title} : {self.percentage}% ({status})"
