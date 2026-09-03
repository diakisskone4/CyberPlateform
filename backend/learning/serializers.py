from rest_framework import serializers
from .models import VideoProgress, Quiz, Question, Choice, QuizAttempt

class VideoProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoProgress
        fields = ['video', 'watched_seconds', 'is_completed', 'last_watched_at']


class VideoProgressUpdateSerializer(serializers.Serializer):
    video_id = serializers.IntegerField(required=True)
    watched_seconds = serializers.IntegerField(required=False, default=0)
    is_completed = serializers.BooleanField(required=False, default=False)


# Student Quiz Serializers (hides correct answers)
class StudentChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'text']


class StudentQuestionSerializer(serializers.ModelSerializer):
    choices = StudentChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'points', 'order', 'choices']


class StudentQuizSerializer(serializers.ModelSerializer):
    questions = StudentQuestionSerializer(many=True, read_only=True)
    total_questions = serializers.ReadOnlyField()

    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'quiz_type', 'certification', 'module',
            'description', 'pass_percentage', 'time_limit_minutes',
            'total_questions', 'questions'
        ]


# Admin Quiz Serializers (includes correct answers & explanation)
class AdminChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'question', 'text', 'is_correct']
        read_only_fields = ['id']


class AdminQuestionSerializer(serializers.ModelSerializer):
    choices = AdminChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'quiz', 'text', 'explanation', 'points', 'order', 'choices']


class AdminQuizSerializer(serializers.ModelSerializer):
    questions = AdminQuestionSerializer(many=True, read_only=True)
    total_questions = serializers.ReadOnlyField()

    class Meta:
        model = Quiz
        fields = '__all__'


class QuizSubmitSerializer(serializers.Serializer):
    # Mapping of question_id (as str or int) -> choice_id (or list of choice_ids)
    answers = serializers.DictField(child=serializers.IntegerField(), required=True)


class QuizAttemptSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    quiz_type = serializers.CharField(source='quiz.quiz_type', read_only=True)

    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'quiz', 'quiz_title', 'quiz_type', 'score',
            'total_points', 'percentage', 'passed', 'answers_data',
            'completed_at'
        ]
