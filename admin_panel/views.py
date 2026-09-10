import random
import requests
import base64
import json
from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Sum

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated

from .models import Profile, Order, OrderItem, MenuItem, Feedback, Table, Cafe
from .serializers import (
    UserSerializer,
    MenuItemSerializer,
    OrderSerializer,
    FeedbackSerializer,
    TableSerializer
)

# ==================================================
# 1. DASHBOARD & STATS
# ==================================================
@api_view(['GET'])
@permission_classes([AllowAny])
def admin_dashboard_stats(request):
    today = timezone.now().date()
    revenue = Order.objects.filter(status='Paid', created_at__date=today).aggregate(Sum('total_price'))['total_price__sum'] or 0
    return Response({
        "today_revenue": float(revenue),
        "total_orders": Order.objects.count(),
        "pending_orders": Order.objects.filter(status='Pending').count(),
        "total_menu": MenuItem.objects.count(),
        "total_staff": User.objects.filter(is_superuser=False, is_active=True).count(),
        "active_tables": Order.objects.exclude(status='Paid').count()
    })

# ==================================================
# 2. AUTHENTICATION & OTP
# ==================================================
class AdminLoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email, password = request.data.get("email"), request.data.get("password")
        user_obj = get_object_or_404(User, email=email)
        user = authenticate(username=user_obj.username, password=password)
        if user and user.profile.role == "Admin":
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "Login successful",
                "username": user.username,
                "cafe_id": user.profile.cafe_id,
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            })
        return Response({"error": "Invalid credentials"}, status=401)

class StaffLoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email, password, role = request.data.get("email"), request.data.get("password"), request.data.get("role")
        user_obj = get_object_or_404(User, email=email)
        user = authenticate(username=user_obj.username, password=password)
        if user and user.profile.role == role:
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "Login successful",
                "username": user.username,
                "role": user.profile.role,
                "cafe_id": user.profile.cafe_id,
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            })
        return Response({"error": "Invalid credentials"}, status=401)

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_forgot_password(request):
    email = request.data.get("email")
    user = get_object_or_404(User, email=email)
    otp = str(random.randint(100000, 999999))
    user.profile.otp = otp
    user.profile.save()
    send_mail("SmartCafe OTP", f"Your OTP is: {otp}", settings.DEFAULT_FROM_EMAIL, [email])
    return Response({"message": "OTP sent"})

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_reset_password(request):
    email, otp, password = request.data.get("email"), request.data.get("otp"), request.data.get("password")
    user = get_object_or_404(User, email=email)
    if str(user.profile.otp) == str(otp):
        user.set_password(password)
        user.profile.otp = None
        user.profile.save()
        user.save()
        return Response({"message": "Password updated"})
    return Response({"error": "Invalid OTP"}, status=400)

# ==================================================
#  ADMIN REGISTRATION & OTP VERIFICATION
# ==================================================
signup_temp_storage = {} 

@api_view(['POST'])
@permission_classes([AllowAny])
def request_signup_otp(request):
    username = request.data.get("username")
    email = request.data.get("email", "").lower().strip()
    password = request.data.get("password")

    if not email.endswith("@gmail.com"):
        return Response({"error": "Only @gmail.com is allowed"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already taken"}, status=400)

    otp = str(random.randint(100000, 999999))
    
    signup_temp_storage[email] = {
        "username": username,
        "password": password,
        "otp": otp,
        "role": "Admin" 
    }

    try:
        send_mail("Admin Verification Code", f"Code: {otp}", settings.DEFAULT_FROM_EMAIL, [email])
        return Response({"message": "OTP sent to Gmail"})
    except Exception:
        return Response({"error": "Email error"}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_signup_otp(request):
    email = request.data.get("email", "").lower().strip()
    otp = request.data.get("otp")
    
    temp_data = signup_temp_storage.get(email)
    if not temp_data or temp_data['otp'] != str(otp):
        return Response({"error": "Invalid OTP"}, status=400)

    try:
        with transaction.atomic():
            user = User.objects.create_user(
                username=temp_data['username'],
                email=email,
                password=temp_data['password']
            )
            user.is_staff = True 
            user.save()

            from .models import Profile
            Profile.objects.update_or_create(
                user=user, 
                defaults={'role': 'Admin'}
            )

        del signup_temp_storage[email]
        return Response({"success": "Admin created!"})
    except Exception as e:
        return Response({"error": "Could not create Admin: " + str(e)}, status=500)
    
# ==================================================
# 3. STAFF MANAGEMENT
# ==================================================
class StaffManagementView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        cafe = request.user.profile.cafe
        staff = User.objects.filter(is_superuser=False, profile__cafe=cafe)
        return Response(UserSerializer(staff, many=True).data)

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.profile.cafe = request.user.profile.cafe
            user.profile.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StaffDetailView(APIView):
    # This handles the Edit Details button
    def put(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    #  This makes the Deactivate/Toggle Status button work
    def patch(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        # partial=True allows changing JUST the is_active field
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

# ==================================================
# 4. MENU MANAGEMENT
# ==================================================
class MenuManagementView(APIView):
    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get(self, request):
        if request.user and request.user.is_authenticated:
            items = MenuItem.objects.filter(cafe=request.user.profile.cafe)
        else:
            # Public customer view — single-cafe setup for now
            items = MenuItem.objects.filter(cafe=Cafe.objects.first())
        return Response(MenuItemSerializer(items, many=True).data)

    def post(self, request):
        data = request.data.copy()
        serializer = MenuItemSerializer(data=data)
        if serializer.is_valid():
            serializer.save(cafe=request.user.profile.cafe)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MenuItemDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pk):
        item = get_object_or_404(MenuItem, pk=pk, cafe=request.user.profile.cafe)
        return Response(MenuItemSerializer(item).data)
    
    def put(self, request, pk):
        item = get_object_or_404(MenuItem, pk=pk, cafe=request.user.profile.cafe)
        serializer = MenuItemSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    def delete(self, request, pk):
        get_object_or_404(MenuItem, pk=pk, cafe=request.user.profile.cafe).delete()
        return Response({"message": "Deleted"})

# ==================================================
# TABLE MANAGEMENT
# ==================================================
class TableListView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get(self, request):
        if request.user and request.user.is_authenticated:
            cafe = request.user.profile.cafe
        else:
            # Public customer view — single-cafe setup for now
            cafe = Cafe.objects.first()
        tables = Table.objects.filter(cafe=cafe).order_by('number')
        return Response(TableSerializer(tables, many=True).data)

    def post(self, request):
        cafe = request.user.profile.cafe
        number = request.data.get("number")
        if not number:
            return Response({"error": "Table number is required"}, status=400)
        if Table.objects.filter(cafe=cafe, number=number).exists():
            return Response({"error": f"Table {number} already exists"}, status=400)
        table = Table.objects.create(cafe=cafe, number=number)
        return Response(TableSerializer(table).data, status=201)

class TableDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def delete(self, request, pk):
        table = get_object_or_404(Table, pk=pk, cafe=request.user.profile.cafe)
        table.delete()
        return Response({"message": "Table deleted"})

#==================================================
# 5. ORDER & TABLE LOGIC
# ==================================================
class OrderListView(APIView):
    def get(self, request):

        orders = Order.objects.all().order_by('-id')
        return Response(OrderSerializer(orders, many=True).data)


class OrderDetailView(APIView):
    def get(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        return Response(OrderSerializer(order).data)

    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        new_status = request.data.get("status", order.status)
        if new_status == "Served" and order.status != "Served":
            order.served_at = timezone.now()
        order.status = new_status
        order.payment_method = request.data.get("payment_method", order.payment_method)
        order.save()
        return Response({"message": "Updated"})

class PlaceOrderView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        data = request.data
        with transaction.atomic():
            table_id = data.get("table_id")
            table_obj = None
            table_num = data.get("table_number")

            if table_id:
                table_obj = get_object_or_404(Table, id=table_id)
                table_num = table_obj.number
                table_obj.is_occupied = True
                table_obj.save()

            # QR/customer orders (with a table_id) start unconfirmed —
            # invisible to the kitchen until a waiter verifies the table is occupied.
            # Manual admin orders (no table_id) go straight to Pending.
            initial_status = "Awaiting Confirmation" if table_id else "Pending"

            order = Order.objects.create(
                cafe=table_obj.cafe if table_obj else Cafe.objects.first(),
                table=table_obj,
                table_number=table_num,
                payment_method=data.get("payment_method", "Cash"),
                status=initial_status
            )
            total = 0
            for item in data["items"]:
                menu = MenuItem.objects.get(id=item["id"])
                OrderItem.objects.create(
                    order=order, menu_item=menu, quantity=item["qty"],
                    price=menu.price, instructions=item.get("instructions", "")
                )
                total += menu.price * item["qty"]
            order.total_price = total
            order.save()
        return Response({"message": "Order placed", "order_id": order.id})


class ConfirmOrderView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        if order.status == "Awaiting Confirmation":
            order.status = "Pending"
            order.save()
            return Response({"message": "Order confirmed", "status": order.status})
        return Response({"error": "Order is not awaiting confirmation"}, status=400)

class CheckTableStatusView(APIView):
    permission_classes = [AllowAny]
    def get(self, request, table_id):
        table = get_object_or_404(Table, id=table_id)
        return Response({"occupied": table.is_occupied})

# ==================================================
# 6. PAYMENT & BILLING
# ==================================================
class EsewaVerifyView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        token = request.data.get("token")
        order_id = request.data.get("order_id")
        if token == "ESEWA_VIVA_SUCCESS_TOKEN":
            order = get_object_or_404(Order, id=order_id)
            order.status = "Paid"
            order.payment_method = "eSewa"
            order.save()
            return Response({"message": "Verified"}, status=200)
        return Response({"error": "Invalid Token"}, status=400)

class SettleBillView(APIView):
    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        order.status = "Paid"
        order.payment_method = "cash"
        order.save()
        return Response({"message": "Bill settled"})

class BillDetailView(APIView):
    def get(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        total = float(order.total_price)
        net = round(total / 1.13, 2)
        vat = round(total - net, 2)
        return Response({"table": order.table_number, "total": total, "net": net, "vat": vat})

# ==================================================
# 7. FEEDBACK
# ==================================================
class FeedbackView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        feedbacks = Feedback.objects.all().order_by('-created_at')
        return Response(FeedbackSerializer(feedbacks, many=True).data)
    def post(self, request):
        order = get_object_or_404(Order, id=request.data.get("order_id"))
        Feedback.objects.create(order=order, rating=request.data.get("rating"), comment=request.data.get("comment"))
        return Response({"message": "Success"})
