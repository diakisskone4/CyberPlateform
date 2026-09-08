from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UpdateVideoProgressView, ResumeCourseView, MarkChapterCompleteView,
    StudentQuizDetailView, ModuleQuizDetailView, QuizSubmitView, AdminQuizViewSet,
    AdminQuestionViewSet, AdminChoiceViewSet
)

router = DefaultRouter()
router.register('admin/quizzes', AdminQuizViewSet, basename='admin_quizzes')
router.register('admin/questions', AdminQuestionViewSet, basename='admin_questions')
router.register('admin/choices', AdminChoiceViewSet, basename='admin_choices')

urlpatterns = [
    # Progress & Auto-resume
    path('progress/update/', UpdateVideoProgressView.as_view(), name='update_video_progress'),
    path('progress/resume/<int:cert_id>/', ResumeCourseView.as_view(), name='resume_course'),
    path('chapters/<int:chapter_id>/complete/', MarkChapterCompleteView.as_view(), name='mark_chapter_complete'),

    # Student Quiz
    path('quizzes/<int:pk>/', StudentQuizDetailView.as_view(), name='student_quiz_detail'),
    path('quizzes/<int:pk>/submit/', QuizSubmitView.as_view(), name='student_quiz_submit'),
    path('modules/<int:module_id>/quiz/', ModuleQuizDetailView.as_view(), name='module_quiz_detail'),

    # Admin Quiz Management
    path('', include(router.urls)),
]
