from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import VideoProgress, Quiz, Question, Choice, QuizAttempt
from .serializers import (
    VideoProgressSerializer, VideoProgressUpdateSerializer,
    StudentQuizSerializer, AdminQuizSerializer, AdminQuestionSerializer,
    AdminChoiceSerializer, QuizSubmitSerializer, QuizAttemptSerializer
)
from courses.models import Video, Chapter, Module, Certification
from certificates.models import Certificate
from interactions.models import Notification, AuditLog
from authentication.views import IsAdminUserPermission

class UpdateVideoProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = VideoProgressUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        video_id = serializer.validated_data['video_id']
        watched_seconds = serializer.validated_data.get('watched_seconds', 0)
        is_completed = serializer.validated_data.get('is_completed', False)

        video = get_object_or_404(Video, pk=video_id)

        # Auto-complete if watched >= 90% of duration
        if video.duration_seconds > 0 and watched_seconds >= (video.duration_seconds * 0.9):
            is_completed = True

        progress, created = VideoProgress.objects.get_or_create(
            user=request.user,
            video=video,
            defaults={
                'watched_seconds': watched_seconds,
                'is_completed': is_completed
            }
        )

        if not created:
            progress.watched_seconds = max(progress.watched_seconds, watched_seconds)
            if is_completed:
                progress.is_completed = True
            progress.save()

        # Calculate module progress
        module = video.chapter.module
        total_module_videos = Video.objects.filter(chapter__module=module).count()
        completed_module_videos = VideoProgress.objects.filter(
            user=request.user,
            video__chapter__module=module,
            is_completed=True
        ).count()
        module_percent = round((completed_module_videos / total_module_videos) * 100) if total_module_videos > 0 else 0

        return Response({
            "success": True,
            "video_id": video.id,
            "watched_seconds": progress.watched_seconds,
            "is_completed": progress.is_completed,
            "module_percent": module_percent
        })


class ResumeCourseView(APIView):
    """
    Returns the exact video to resume for a given certification.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, cert_id):
        certification = get_object_or_404(Certification, pk=cert_id)
        all_videos = Video.objects.filter(
            chapter__module__certification=certification
        ).order_by('chapter__module__order', 'chapter__order', 'order', 'id')

        if not all_videos.exists():
            return Response({"error": "Aucune vidéo disponible dans cette certification."}, status=status.HTTP_404_NOT_FOUND)

        # Find the last video watched with progress
        last_progress = VideoProgress.objects.filter(
            user=request.user,
            video__in=all_videos
        ).order_by('-last_watched_at').first()

        target_video = None
        if last_progress and not last_progress.is_completed:
            target_video = last_progress.video
            resume_seconds = last_progress.watched_seconds
        else:
            # Look for the first uncompleted video
            completed_ids = set(VideoProgress.objects.filter(
                user=request.user,
                video__in=all_videos,
                is_completed=True
            ).values_list('video_id', flat=True))

            for v in all_videos:
                if v.id not in completed_ids:
                    target_video = v
                    break
            
            # If all are completed, default to the first video
            if not target_video:
                target_video = all_videos.first()
            resume_seconds = 0

        return Response({
            "video_id": target_video.id,
            "video_title": target_video.title,
            "chapter_id": target_video.chapter.id,
            "chapter_title": target_video.chapter.title,
            "module_id": target_video.chapter.module.id,
            "module_title": target_video.chapter.module.title,
            "certification_id": certification.id,
            "certification_title": certification.title,
            "resume_seconds": resume_seconds
        })


class MarkChapterCompleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, chapter_id):
        chapter = get_object_or_404(Chapter, pk=chapter_id)
        for video in chapter.videos.all():
            prog, _ = VideoProgress.objects.get_or_create(user=request.user, video=video)
            prog.is_completed = True
            prog.watched_seconds = video.duration_seconds
            prog.save()
        return Response({"message": f"Chapitre '{chapter.title}' marqué comme terminé avec succès."})


class StudentQuizDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        quiz = get_object_or_404(Quiz, pk=pk)
        serializer = StudentQuizSerializer(quiz)
        
        # Check previous attempts
        previous_attempts = QuizAttempt.objects.filter(user=request.user, quiz=quiz)
        has_passed = previous_attempts.filter(passed=True).exists()
        best_score = previous_attempts.order_by('-percentage').first()

        return Response({
            "quiz": serializer.data,
            "has_passed": has_passed,
            "best_percentage": best_score.percentage if best_score else None,
            "total_attempts": previous_attempts.count()
        })


class ModuleQuizDetailView(APIView):
    """
    Résout le quiz rattaché à un module donné (le frontend ne connaît que
    l'ID du module, pas l'ID du quiz lui-même).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, module_id):
        quiz = get_object_or_404(
            Quiz, module_id=module_id, quiz_type=Quiz.QuizType.MODULE_QUIZ
        )
        serializer = StudentQuizSerializer(quiz)

        previous_attempts = QuizAttempt.objects.filter(user=request.user, quiz=quiz)
        has_passed = previous_attempts.filter(passed=True).exists()
        best_score = previous_attempts.order_by('-percentage').first()

        return Response({
            "quiz": serializer.data,
            "has_passed": has_passed,
            "best_percentage": best_score.percentage if best_score else None,
            "total_attempts": previous_attempts.count()
        })


class QuizSubmitView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        quiz = get_object_or_404(Quiz, pk=pk)
        serializer = QuizSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_answers = serializer.validated_data['answers'] # { "q_id": choice_id }
        total_points = 0.0
        earned_points = 0.0
        results_breakdown = []

        questions = quiz.questions.all()
        for q in questions:
            q_points = q.points
            total_points += q_points
            
            chosen_choice_id = user_answers.get(str(q.id)) or user_answers.get(q.id)
            correct_choice = q.choices.filter(is_correct=True).first()
            
            is_q_correct = False
            if correct_choice and chosen_choice_id and (int(chosen_choice_id) == correct_choice.id):
                is_q_correct = True
                earned_points += q_points

            results_breakdown.append({
                "question_id": q.id,
                "question_text": q.text,
                "chosen_choice_id": chosen_choice_id,
                "correct_choice_id": correct_choice.id if correct_choice else None,
                "is_correct": is_q_correct,
                "explanation": q.explanation,
                "points_earned": q_points if is_q_correct else 0
            })

        percentage = round((earned_points / total_points) * 100, 1) if total_points > 0 else 100.0
        passed = percentage >= quiz.pass_percentage

        attempt = QuizAttempt.objects.create(
            user=request.user,
            quiz=quiz,
            score=earned_points,
            total_points=total_points,
            percentage=percentage,
            passed=passed,
            answers_data=results_breakdown
        )

        # Notify user
        if passed:
            Notification.objects.create(
                user=request.user,
                title=f"Félicitations ! Évaluation réussie : {quiz.title}",
                message=f"Vous avez obtenu {percentage}% au quiz '{quiz.title}'.",
                notification_type=Notification.Type.QUIZ_PASSED
            )

        # Check certification completion if final exam or certification-level evaluation passed
        certificate_issued = False
        certificate_code = None
        cert = quiz.certification or (quiz.module.certification if quiz.module else None)

        if cert and passed:
            # Check conditions for certificate:
            # 1. Final exam passed (if exists)
            # 2. All videos completed
            total_vids = Video.objects.filter(chapter__module__certification=cert).count()
            completed_vids = VideoProgress.objects.filter(
                user=request.user,
                video__chapter__module__certification=cert,
                is_completed=True
            ).count()

            if total_vids > 0 and completed_vids >= total_vids:
                # Issue certificate!
                certif_obj, created = Certificate.objects.get_or_create(
                    user=request.user,
                    certification=cert,
                    defaults={'final_score': percentage}
                )
                if not certif_obj.qr_code_data_uri:
                    certif_obj.generate_qr_code()
                    certif_obj.save()

                certificate_issued = True
                certificate_code = certif_obj.certificate_code

                if created:
                    Notification.objects.create(
                        user=request.user,
                        title=f"Certificat Obtenu : {cert.title}",
                        message=f"Félicitations ! Votre certificat d'accomplissement en cybersécurité pour '{cert.title}' est maintenant disponible avec le numéro unique {certificate_code}.",
                        notification_type=Notification.Type.CERTIFICATE_ISSUED,
                        link_url=f"/certificates"
                    )

        return Response({
            "attempt_id": attempt.id,
            "score": earned_points,
            "total_points": total_points,
            "percentage": percentage,
            "passed": passed,
            "pass_percentage": quiz.pass_percentage,
            "results_breakdown": results_breakdown,
            "certificate_issued": certificate_issued,
            "certificate_code": certificate_code
        })


# Admin Quiz ViewSets
class AdminQuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all().order_by('id')
    serializer_class = AdminQuizSerializer
    permission_classes = [IsAdminUserPermission]


class AdminQuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all().order_by('order', 'id')
    serializer_class = AdminQuestionSerializer
    permission_classes = [IsAdminUserPermission]


class AdminChoiceViewSet(viewsets.ModelViewSet):
    queryset = Choice.objects.all().order_by('id')
    serializer_class = AdminChoiceSerializer
    permission_classes = [IsAdminUserPermission]
