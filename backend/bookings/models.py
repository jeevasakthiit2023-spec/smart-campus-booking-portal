from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone
import uuid


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('STUDENT', 'Student'),
        ('FACULTY', 'Faculty / Researcher'),
        ('LAB_ADMIN', 'Lab Administrator / In-Charge'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')
    roll_number = models.CharField(max_length=50, blank=True, null=True, help_text="Student Roll No or Staff ID")
    department = models.CharField(max_length=100, default='Computer Science & Engineering')
    phone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} ({self.get_role_display()})"


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    icon = models.CharField(max_length=50, default='Cpu', help_text="Lucide icon identifier")
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Lab(models.Model):
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=50, unique=True)
    department = models.CharField(max_length=100)
    building = models.CharField(max_length=100, default='Engineering Block')
    room_number = models.CharField(max_length=50, default='Room 201')
    in_charge_name = models.CharField(max_length=100)
    in_charge_email = models.EmailField(blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"


class Equipment(models.Model):
    CONDITION_CHOICES = [
        ('OPERATIONAL', 'Operational & Calibrated'),
        ('MAINTENANCE', 'Under Scheduled Maintenance'),
        ('RESERVED_TRAINING', 'Reserved for Lab Practicals'),
    ]

    name = models.CharField(max_length=200)
    asset_id = models.CharField(max_length=50, unique=True, help_text="Unique Campus Asset Tag")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='equipments')
    lab = models.ForeignKey(Lab, on_delete=models.CASCADE, related_name='equipments')
    model_number = models.CharField(max_length=100, blank=True)
    manufacturer = models.CharField(max_length=100, blank=True)
    description = models.TextField()
    specifications = models.TextField(blank=True, help_text="Key specifications (e.g. Bandwidth, Resolution, Voltage)")
    condition = models.CharField(max_length=30, choices=CONDITION_CHOICES, default='OPERATIONAL')
    total_quantity = models.PositiveIntegerField(default=1)
    available_quantity = models.PositiveIntegerField(default=1)
    hourly_guidelines = models.TextField(blank=True, default="Please clean work area and sanitize probe terminals after use.")
    safety_protocol = models.TextField(blank=True, default="Wear ESD anti-static wrist strap and safety goggles at all times.")
    image_url = models.CharField(max_length=500, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Equipment'

    def __str__(self):
        return f"{self.name} [{self.asset_id}]"

    def update_availability(self):
        """Calculate and update available units based on active approved bookings."""
        now = timezone.now()
        active_approved_count = self.bookings.filter(
            status='APPROVED',
            start_time__lte=now,
            end_time__gte=now
        ).count()
        self.available_quantity = max(0, self.total_quantity - active_approved_count)
        self.save(update_fields=['available_quantity'])


class Booking(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending Approval'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('CANCELLED', 'Cancelled'),
        ('RETURNED', 'Returned / Completed'),
    ]

    booking_ref = models.CharField(max_length=30, unique=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='bookings')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    purpose = models.TextField(help_text="Academic/Research project or course practical reason")
    project_title = models.CharField(max_length=200, blank=True)
    supervisor_name = models.CharField(max_length=100, blank=True)
    department = models.CharField(max_length=100, blank=True)
    roll_number = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    admin_remarks = models.TextField(blank=True, help_text="Remarks by Lab Administrator or Approver")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def clean(self):
        if self.start_time and self.end_time:
            if self.end_time <= self.start_time:
                raise ValidationError("Reservation end time must be after the start time.")
            if self.start_time < timezone.now() - timezone.timedelta(minutes=10):
                # allow minimal 10 min grace for submission network delay
                raise ValidationError("Reservation start time cannot be in the past.")

    def save(self, *args, **kwargs):
        if not self.booking_ref:
            short_id = uuid.uuid4().hex[:6].upper()
            year = timezone.now().year
            self.booking_ref = f"SCB-{year}-{short_id}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.booking_ref} - {self.equipment.name} by {self.user.username}"
