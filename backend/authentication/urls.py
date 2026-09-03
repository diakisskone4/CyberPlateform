from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView, RegisterView, UserProfileView, ChangePasswordView,
    AdminUserListView, AdminUserCreateView, AdminUserDetailView, AdminToggleUserStatusView
)

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('register/', RegisterView.as_view(), name='register'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # Admin User management
    path('admin/users/', AdminUserListView.as_view(), name='admin_user_list'),
    path('admin/users/create/', AdminUserCreateView.as_view(), name='admin_user_create'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin_user_detail'),
    path('admin/users/<int:pk>/toggle-status/', AdminToggleUserStatusView.as_view(), name='admin_user_toggle_status'),
]
