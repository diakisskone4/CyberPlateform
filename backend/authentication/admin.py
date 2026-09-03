from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
	list_display = ('username', 'email', 'role', 'is_active', 'date_joined')
	list_filter = ('role', 'is_active', 'is_staff')
	search_fields = ('username', 'email', 'first_name', 'last_name', 'phone_number')
	fieldsets = UserAdmin.fieldsets + (
		('Profil Cyber WTA', {'fields': ('role', 'phone_number', 'avatar', 'bio')}),
	)
	add_fieldsets = UserAdmin.add_fieldsets + (
		('Profil Cyber WTA', {'fields': ('role', 'email', 'first_name', 'last_name', 'phone_number')}),
	)
