from django.contrib import admin
from .models import UserProfile, Category, Lab, Equipment, Booking


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'roll_number', 'department', 'phone')
    list_filter = ('role', 'department')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'roll_number')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'icon')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


@admin.register(Lab)
class LabAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'department', 'building', 'room_number', 'in_charge_name')
    list_filter = ('department', 'building')
    search_fields = ('name', 'code', 'in_charge_name')


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'asset_id', 'category', 'lab', 'condition', 'total_quantity', 'available_quantity', 'is_active')
    list_filter = ('category', 'condition', 'is_active', 'lab')
    search_fields = ('name', 'asset_id', 'manufacturer', 'model_number')
    actions = ['mark_as_operational', 'mark_under_maintenance']

    @admin.action(description="Mark selected equipment as Operational")
    def mark_as_operational(self, request, queryset):
        queryset.update(condition='OPERATIONAL')

    @admin.action(description="Mark selected equipment as Under Maintenance")
    def mark_under_maintenance(self, request, queryset):
        queryset.update(condition='MAINTENANCE')


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('booking_ref', 'user', 'equipment', 'start_time', 'end_time', 'status', 'created_at')
    list_filter = ('status', 'equipment__category', 'created_at')
    search_fields = ('booking_ref', 'user__username', 'equipment__name', 'roll_number')
    readonly_fields = ('booking_ref', 'created_at', 'updated_at')
    actions = ['approve_bookings', 'reject_bookings', 'mark_returned']

    @admin.action(description="Approve selected bookings")
    def approve_bookings(self, request, queryset):
        for booking in queryset:
            booking.status = 'APPROVED'
            booking.save()
            booking.equipment.update_availability()

    @admin.action(description="Reject selected bookings")
    def reject_bookings(self, request, queryset):
        for booking in queryset:
            booking.status = 'REJECTED'
            booking.save()
            booking.equipment.update_availability()

    @admin.action(description="Mark selected bookings as Returned")
    def mark_returned(self, request, queryset):
        for booking in queryset:
            booking.status = 'RETURNED'
            booking.save()
            booking.equipment.update_availability()
