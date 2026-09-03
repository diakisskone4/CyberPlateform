from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Q
from .serializers import (
    UserSerializer, RegisterSerializer, ChangePasswordSerializer,
    AdminUserUpdateSerializer, AdminUserCreateSerializer
)

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Append user profile data directly to login response
        user_data = UserSerializer(self.user).data
        data['user'] = user_data
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'message': "Compte créé avec succès."
        }, status=status.HTTP_201_CREATED)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Ancien mot de passe incorrect."]}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.data.get("new_password"))
            user.save()
            return Response({"message": "Mot de passe modifié avec succès."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IsAdminUserPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin_user)


class AdminUserListView(generics.ListAPIView):
    permission_classes = [IsAdminUserPermission]
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')
        search = self.request.query_params.get('search', None)
        role = self.request.query_params.get('role', None)
        is_active = self.request.query_params.get('is_active', None)

        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(phone_number__icontains=search)
            )
        if role:
            queryset = queryset.filter(role=role)
        if is_active is not None:
            queryset = queryset.filter(is_active=(is_active.lower() == 'true'))
        return queryset


class AdminUserCreateView(generics.CreateAPIView):
    permission_classes = [IsAdminUserPermission]
    queryset = User.objects.all()
    serializer_class = AdminUserCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'user': UserSerializer(user).data,
            'message': 'Compte créé avec succès.'
        }, status=status.HTTP_201_CREATED)


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUserPermission]
    queryset = User.objects.all()
    serializer_class = AdminUserUpdateSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        return Response(UserSerializer(instance).data)


class AdminToggleUserStatusView(APIView):
    permission_classes = [IsAdminUserPermission]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            if user == request.user:
                return Response({"error": "Vous ne pouvez pas désactiver votre propre compte administrateur."}, status=status.HTTP_400_BAD_REQUEST)
            user.is_active = not user.is_active
            user.save()
            status_text = "activé" if user.is_active else "désactivé"
            return Response({
                "message": f"Compte {user.username} {status_text} avec succès.",
                "is_active": user.is_active
            })
        except User.DoesNotExist:
            return Response({"error": "Utilisateur non trouvé."}, status=status.HTTP_404_NOT_FOUND)
