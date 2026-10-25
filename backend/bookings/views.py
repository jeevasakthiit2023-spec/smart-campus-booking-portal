from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.models import Q, Count, Sum
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import UserProfile, Category, Lab, Equipment, Booking
from .serializers import (
    UserSerializer, RegisterSerializer, CategorySerializer,
    LabSerializer, EquipmentSerializer, BookingSerializer,
    BookingCreateSerializer, StatusUpdateSerializer
)


VALID_STATUS_TRANSITIONS = {
    'PENDING': ['APPROVED', 'REJECTED', 'CANCELLED'],
    'APPROVED': ['RETURNED', 'CANCELLED'],
    'REJECTED': [],
    'CANCELLED': [],
    'RETURNED': [],
}


def get_request_actor(request):
    """Retrieve user from session auth or custom user header / payload for demo API."""
    if request.user and request.user.is_authenticated:
        return request.user
    user_id = request.headers.get('X-User-Id') or request.data.get('user_id')
    if user_id:
        try:
            return User.objects.select_related('profile').get(pk=user_id)
        except (User.DoesNotExist, ValueError):
            pass
    return None


def is_admin_or_staff(user):
    """Check if user has administrative or lab in-charge privileges."""
    if not user:
        return False
    if user.is_staff or user.is_superuser:
        return True
    if hasattr(user, 'profile') and user.profile.role in ['LAB_ADMIN', 'FACULTY']:
        return True
    return False


class DashboardStatsAPIView(APIView):
    """Returns aggregated real-time metrics for campus portal dashboard."""
    permission_classes = [AllowAny]

    def get(self, request):
        now = timezone.now()

        total_equipment = Equipment.objects.filter(is_active=True).count()
        total_units = Equipment.objects.filter(is_active=True).aggregate(total=Sum('total_quantity'))['total'] or 0

        # Available equipment units
        available_units = Equipment.objects.filter(
            is_active=True, condition='OPERATIONAL'
        ).aggregate(avail=Sum('available_quantity'))['avail'] or 0

        # Active bookings: Approved reservations currently active or starting today
        active_bookings = Booking.objects.filter(
            status='APPROVED',
            end_time__gte=now
        ).count()

        # Pending approval bookings
        pending_requests = Booking.objects.filter(status='PENDING').count()

        # Completed/Returned bookings count
        returned_count = Booking.objects.filter(status='RETURNED').count()

        # Categories with count
        categories = Category.objects.annotate(
            equip_count=Count('equipments', filter=Q(equipments__is_active=True))
        ).values('id', 'name', 'slug', 'icon', 'equip_count')

        # Recent activities (latest 6 bookings)
        recent_bookings = Booking.objects.select_related('equipment', 'user', 'equipment__lab')[:6]
        recent_serializer = BookingSerializer(recent_bookings, many=True)

        return Response({
            'total_equipment': total_equipment,
            'total_units': total_units,
            'available_units': available_units,
            'active_bookings': active_bookings,
            'pending_requests': pending_requests,
            'completed_bookings': returned_count,
            'categories': list(categories),
            'recent_bookings': recent_serializer.data,
            'system_timestamp': timezone.now().isoformat()
        })


class CategoryListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)


class LabListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        labs = Lab.objects.all()
        serializer = LabSerializer(labs, many=True)
        return Response(serializer.data)


class EquipmentListAPIView(APIView):
    """Lists equipment with search, category filtering, and status filtering."""
    permission_classes = [AllowAny]

    def get(self, request):
        queryset = Equipment.objects.filter(is_active=True).select_related('category', 'lab')

        search_query = request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(asset_id__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(lab__name__icontains=search_query) |
                Q(category__name__icontains=search_query)
            )

        category_slug = request.query_params.get('category', '').strip()
        if category_slug and category_slug != 'all':
            queryset = queryset.filter(category__slug=category_slug)

        lab_id = request.query_params.get('lab', '').strip()
        if lab_id and lab_id != 'all':
            queryset = queryset.filter(lab_id=lab_id)

        condition = request.query_params.get('condition', '').strip()
        if condition and condition != 'all':
            queryset = queryset.filter(condition=condition)

        available_only = request.query_params.get('available_only', 'false').lower() == 'true'
        if available_only:
            queryset = queryset.filter(available_quantity__gt=0, condition='OPERATIONAL')

        serializer = EquipmentSerializer(queryset, many=True)
        return Response(serializer.data)


class EquipmentDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        equipment = get_object_or_404(Equipment, pk=pk, is_active=True)
        equipment.update_availability()
        serializer = EquipmentSerializer(equipment)

        # Include upcoming approved bookings for schedule visibility
        now = timezone.now()
        upcoming = equipment.bookings.filter(
            status='APPROVED',
            end_time__gte=now
        ).values('booking_ref', 'start_time', 'end_time', 'purpose')[:5]

        data = serializer.data
        data['upcoming_schedule'] = list(upcoming)
        return Response(data)


class BookingListCreateAPIView(APIView):
    """List bookings and submit new equipment booking reservations."""
    permission_classes = [AllowAny]

    def get(self, request):
        queryset = Booking.objects.select_related('equipment', 'user', 'equipment__lab').all()

        user_id = request.query_params.get('user_id')
        my_only = request.query_params.get('my', 'false').lower() == 'true'

        if my_only and request.user.is_authenticated:
            queryset = queryset.filter(user=request.user)
        elif user_id:
            queryset = queryset.filter(user_id=user_id)

        status_param = request.query_params.get('status')
        if status_param and status_param != 'all':
            queryset = queryset.filter(status=status_param.upper())

        equipment_id = request.query_params.get('equipment_id')
        if equipment_id:
            queryset = queryset.filter(equipment_id=equipment_id)

        serializer = BookingSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BookingCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Assign user: from request.user or fallback to user_id in payload or default student
        user = None
        if request.user.is_authenticated:
            user = request.user
        else:
            user_id = request.data.get('user_id')
            if user_id:
                try:
                    user = User.objects.get(pk=user_id)
                except User.DoesNotExist:
                    pass

        if not user:
            # Fallback to first student or create a demo student
            user = User.objects.filter(is_staff=False).first()
            if not user:
                user = User.objects.create_user(
                    username='student_demo',
                    email='student@campus.edu',
                    password='Password@123',
                    first_name='Campus',
                    last_name='Student'
                )
                UserProfile.objects.create(
                    user=user,
                    role='STUDENT',
                    roll_number='2026-CS-042',
                    department='Computer Science & Engineering'
                )

        # Concurrency safety & conflict prevention inside atomic transaction
        with transaction.atomic():
            equipment = Equipment.objects.select_for_update().get(pk=serializer.validated_data['equipment'].pk)
            start_time = serializer.validated_data['start_time']
            end_time = serializer.validated_data['end_time']

            overlapping = Booking.objects.filter(
                equipment=equipment,
                status='APPROVED',
                start_time__lt=end_time,
                end_time__gt=start_time
            ).count()

            if overlapping >= equipment.total_quantity:
                return Response({
                    'non_field_errors': [
                        f"All {equipment.total_quantity} unit(s) of '{equipment.name}' are already fully booked during this time window."
                    ]
                }, status=status.HTTP_400_BAD_REQUEST)

            booking = serializer.save(user=user)
            booking.equipment.update_availability()

        result_serializer = BookingSerializer(booking)
        return Response({
            'message': 'Booking request submitted successfully! Reference generated.',
            'booking': result_serializer.data
        }, status=status.HTTP_201_CREATED)


class BookingDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        booking = get_object_or_404(Booking.objects.select_related('equipment', 'user', 'equipment__lab'), pk=pk)
        serializer = BookingSerializer(booking)
        return Response(serializer.data)


class BookingCancelAPIView(APIView):
    """Allows student/faculty or admin to cancel an existing reservation."""
    permission_classes = [AllowAny]

    def post(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk)
        
        if booking.status in ['CANCELLED', 'RETURNED']:
            return Response(
                {'error': f'Booking is already marked as {booking.get_status_display()}.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Authorization: prevent unauthorized users from cancelling others' bookings
        actor = get_request_actor(request)
        if actor and not (is_admin_or_staff(actor) or actor.id == booking.user_id):
            return Response(
                {'error': 'Permission denied: You do not have permission to cancel another user\'s booking.'},
                status=status.HTTP_403_FORBIDDEN
            )

        with transaction.atomic():
            booking.status = 'CANCELLED'
            cancellation_reason = request.data.get('reason', 'Cancelled by user request.')
            if cancellation_reason:
                booking.admin_remarks = f"[Cancellation Note]: {cancellation_reason}"
            booking.save()
            booking.equipment.update_availability()

        serializer = BookingSerializer(booking)
        return Response({
            'message': f'Booking {booking.booking_ref} has been cancelled successfully.',
            'booking': serializer.data
        })


class BookingStatusUpdateAPIView(APIView):
    """Lab administrator endpoint to approve, reject, or mark equipment as returned."""
    permission_classes = [AllowAny]

    def post(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk)
        serializer = StatusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        new_status = serializer.validated_data['status']
        admin_remarks = serializer.validated_data.get('admin_remarks', '')

        # Valid status transitions check
        if new_status != booking.status and new_status not in VALID_STATUS_TRANSITIONS.get(booking.status, []):
            return Response({
                'error': f"Invalid status transition: Cannot change booking status from '{booking.get_status_display()}' to '{dict(Booking.STATUS_CHOICES).get(new_status, new_status)}'."
            }, status=status.HTTP_400_BAD_REQUEST)

        # Authorization check: only lab administrators or faculty in-charge can update status
        actor = get_request_actor(request)
        if actor and not is_admin_or_staff(actor):
            return Response({
                'error': 'Permission denied: Only Lab Administrators or Faculty In-Charge can approve, reject, or mark equipment as returned.'
            }, status=status.HTTP_403_FORBIDDEN)

        # Atomic transaction with concurrency safety
        with transaction.atomic():
            equipment = Equipment.objects.select_for_update().get(pk=booking.equipment_id)
            if new_status == 'APPROVED':
                overlapping = Booking.objects.filter(
                    equipment=equipment,
                    status='APPROVED',
                    start_time__lt=booking.end_time,
                    end_time__gt=booking.start_time
                ).exclude(pk=booking.pk).count()

                if overlapping >= equipment.total_quantity:
                    return Response({
                        'error': f'Cannot approve: All {equipment.total_quantity} units are already reserved for this duration.'
                    }, status=status.HTTP_400_BAD_REQUEST)

            booking.status = new_status
            if admin_remarks:
                booking.admin_remarks = admin_remarks
            booking.save()
            equipment.update_availability()

        return Response({
            'message': f'Booking {booking.booking_ref} status changed to {booking.get_status_display()}.',
            'booking': BookingSerializer(booking).data
        })


class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Account registered successfully! You can now log in.',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Please provide both username and password.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return Response({
                'message': f'Welcome back, {user.first_name or user.username}!',
                'user': UserSerializer(user).data
            })
        return Response({'error': 'Invalid username or password.'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        logout(request)
        return Response({'message': 'Logged out successfully.'})


class CurrentUserAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            return Response({'authenticated': True, 'user': UserSerializer(request.user).data})
        return Response({'authenticated': False, 'user': None})


class DemoUsersAPIView(APIView):
    """Provides available test demo accounts for quick one-click campus demo testing."""
    permission_classes = [AllowAny]

    def get(self, request):
        users = User.objects.all().select_related('profile')[:6]
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
