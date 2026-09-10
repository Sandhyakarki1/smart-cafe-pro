from django.urls import path
from .views import (
    AdminLoginView, StaffLoginView,
    admin_forgot_password, admin_reset_password, admin_dashboard_stats,
    StaffManagementView, StaffDetailView,
    MenuManagementView, MenuItemDetailView,
    OrderListView, OrderDetailView, PlaceOrderView,
    FeedbackView, SettleBillView, BillDetailView,
    CheckTableStatusView,
    EsewaVerifyView,
    request_signup_otp, 
    verify_signup_otp,
    TableListView, TableDetailView,
    ConfirmOrderView
)
urlpatterns = [
    # ==========================================
    # AUTHENTICATION & DASHBOARD
    # ==========================================
    path('admin/login/', AdminLoginView.as_view(), name='admin_login'),
    path('signup/request-otp/', request_signup_otp, name='signup_request_otp'),
    path('signup/verify/', verify_signup_otp, name='signup_verify_otp'),
    path('staff/login/', StaffLoginView.as_view(), name='staff_login'),
    path('admin/forgot-password/', admin_forgot_password),
    path('admin/reset-password/', admin_reset_password),
    path('stats/', admin_dashboard_stats),
    # ==========================================
    # STAFF MANAGEMENT
    # ==========================================
    path('staff/', StaffManagementView.as_view()),
    path('staff/<int:pk>/', StaffDetailView.as_view()),
    # ==========================================
    # MENU MANAGEMENT
    # ==========================================
    path('menu/', MenuManagementView.as_view()),
    path('menu/<int:pk>/', MenuItemDetailView.as_view()),
    # ==========================================
    # TABLE MANAGEMENT
    # ==========================================
    path('tables/', TableListView.as_view()),
    path('tables/<int:pk>/', TableDetailView.as_view()),
    # ==========================================
    # ORDERS (Kitchen & Tracking)
    # ==========================================
    path('orders/', OrderListView.as_view()),
    path('orders/<int:pk>/', OrderDetailView.as_view()),
    path('orders/<int:pk>/confirm/', ConfirmOrderView.as_view()),
    path('place-order/', PlaceOrderView.as_view()),
    path('check-table/<int:table_id>/', CheckTableStatusView.as_view()),
    # ==========================================
    # PAYMENT VERIFICATION (eSewa)
    # ==========================================
    path('esewa/verify/', EsewaVerifyView.as_view(), name='esewa_verify'),
    # ==========================================
    # BILLING & RECEIPTS
    # ==========================================
    path('settle-bill/<int:pk>/', SettleBillView.as_view()),
    path('bill-detail/<int:pk>/', BillDetailView.as_view()),
    # ==========================================
    # CUSTOMER FEEDBACK
    # ==========================================
    path('feedback/', FeedbackView.as_view()),
]
