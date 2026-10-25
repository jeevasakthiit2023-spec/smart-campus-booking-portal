from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from .models import UserProfile, Category, Lab, Equipment, Booking


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['role', 'roll_number', 'department', 'phone']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'is_staff', 'profile']

    def get_full_name(self, obj):
        name = f"{obj.first_name} {obj.last_name}".strip()
        return name if name else obj.username


class CategorySerializer(serializers.ModelSerializer):
    equipment_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon', 'description', 'equipment_count']

    def get_equipment_count(self, obj):
        return obj.equipments.filter(is_active=True).count()


class LabSerializer(serializers.ModelSerializer):
    equipment_count = serializers.SerializerMethodField()

    class Meta:
        model = Lab
        fields = ['id', 'name', 'code', 'department', 'building', 'room_number', 'in_charge_name', 'in_charge_email', 'equipment_count']

    def get_equipment_count(self, obj):
        return obj.equipments.filter(is_active=True).count()


class EquipmentSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    lab_name = serializers.CharField(source='lab.name', read_only=True)
    lab_location = serializers.CharField(source='lab.room_number', read_only=True)
    active_reservations_count = serializers.SerializerMethodField()

    class Meta:
        model = Equipment
        fields = [
            'id', 'name', 'asset_id', 'category', 'category_name', 'category_slug',
            'lab', 'lab_name', 'lab_location', 'model_number', 'manufacturer',
            'description', 'specifications', 'condition', 'total_quantity',
            'available_quantity', 'hourly_guidelines', 'safety_protocol',
            'image_url', 'is_active', 'active_reservations_count', 'created_at'
        ]

    def get_active_reservations_count(self, obj):
        now = timezone.now()
        return obj.bookings.filter(status='APPROVED', end_time__gte=now).count()


class BookingSerializer(serializers.ModelSerializer):
    equipment_name = serializers.CharField(source='equipment.name', read_only=True)
    equipment_asset_id = serializers.CharField(source='equipment.asset_id', read_only=True)
    equipment_image_url = serializers.CharField(source='equipment.image_url', read_only=True)
    lab_name = serializers.CharField(source='equipment.lab.name', read_only=True)
    user_name = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'booking_ref', 'user', 'user_name', 'user_email',
            'equipment', 'equipment_name', 'equipment_asset_id', 'equipment_image_url',
            'lab_name', 'start_time', 'end_time', 'purpose', 'project_title',
            'supervisor_name', 'department', 'roll_number', 'status',
            'admin_remarks', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'booking_ref', 'user', 'created_at', 'updated_at']

    def get_user_name(self, obj):
        name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return name if name else obj.user.username


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            'equipment', 'start_time', 'end_time', 'purpose',
            'project_title', 'supervisor_name', 'department', 'roll_number'
        ]

    def validate(self, data):
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        equipment = data.get('equipment')

        now = timezone.now()

        if end_time <= start_time:
            raise serializers.ValidationError({"end_time": "Reservation end time must be after the start time."})

        # Allow slight 15-minute buffer in past for client clock differences
        if start_time < now - timezone.timedelta(minutes=15):
            raise serializers.ValidationError({"start_time": "Reservation start time cannot be in the past."})

        # Conflict checking: count overlapping APPROVED bookings for this equipment
        overlapping_approved = Booking.objects.filter(
            equipment=equipment,
            status='APPROVED',
            start_time__lt=end_time,
            end_time__gt=start_time
        ).count()

        if overlapping_approved >= equipment.total_quantity:
            raise serializers.ValidationError({
                "non_field_errors": [
                    f"All {equipment.total_quantity} unit(s) of '{equipment.name}' are already fully booked during this time window. Please choose another time slot."
                ]
            })

        return data


class StatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Booking.STATUS_CHOICES)
    admin_remarks = serializers.CharField(required=False, allow_blank=True)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, default='STUDENT')
    roll_number = serializers.CharField(required=False, allow_blank=True)
    department = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role', 'roll_number', 'department', 'phone']

    def create(self, validated_data):
        role = validated_data.pop('role', 'STUDENT')
        roll_number = validated_data.pop('roll_number', '')
        department = validated_data.pop('department', 'Computer Science & Engineering')
        phone = validated_data.pop('phone', '')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )

        UserProfile.objects.create(
            user=user,
            role=role,
            roll_number=roll_number,
            department=department,
            phone=phone
        )
        return user
