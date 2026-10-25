from django.urls import path
from .views import (
    DashboardStatsAPIView,
    CategoryListAPIView,
    LabListAPIView,
    EquipmentListAPIView,
    EquipmentDetailAPIView,
    BookingListCreateAPIView,
    BookingDetailAPIView,
    BookingCancelAPIView,
    BookingStatusUpdateAPIView,
    RegisterAPIView,
    LoginAPIView,
    LogoutAPIView,
    CurrentUserAPIView,
    DemoUsersAPIView
)

urlpatterns = [
    # Dashboard Metrics
    path('dashboard/stats/', DashboardStatsAPIView.as_view(), name='dashboard-stats'),
    
    # Categories & Labs
    path('categories/', CategoryListAPIView.as_view(), name='category-list'),
    path('labs/', LabListAPIView.as_view(), name='lab-list'),
    
    # Equipment Endpoints
    path('equipment/', EquipmentListAPIView.as_view(), name='equipment-list'),
    path('equipment/<int:pk>/', EquipmentDetailAPIView.as_view(), name='equipment-detail'),
    
    # Bookings Endpoints
    path('bookings/', BookingListCreateAPIView.as_view(), name='booking-list-create'),
    path('bookings/<int:pk>/', BookingDetailAPIView.as_view(), name='booking-detail'),
    path('bookings/<int:pk>/cancel/', BookingCancelAPIView.as_view(), name='booking-cancel'),
    path('bookings/<int:pk>/status/', BookingStatusUpdateAPIView.as_view(), name='booking-status-update'),
    
    # Authentication & User Endpoints
    path('auth/register/', RegisterAPIView.as_view(), name='auth-register'),
    path('auth/login/', LoginAPIView.as_view(), name='auth-login'),
    path('auth/logout/', LogoutAPIView.as_view(), name='auth-logout'),
    path('auth/user/', CurrentUserAPIView.as_view(), name='auth-current-user'),
    path('auth/demo-users/', DemoUsersAPIView.as_view(), name='auth-demo-users'),
]
