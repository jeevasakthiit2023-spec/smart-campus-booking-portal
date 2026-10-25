from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from rest_framework import status
from .models import UserProfile, Category, Lab, Equipment, Booking


class CampusBookingPortalTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create demo user and profile
        self.user = User.objects.create_user(
            username='jeeva_student',
            email='jeeva@campus.edu',
            password='Password@123',
            first_name='Jeevasakthi',
            last_name='S'
        )
        self.profile = UserProfile.objects.create(
            user=self.user,
            role='STUDENT',
            roll_number='2023-IT-042',
            department='Information Technology'
        )

        # Create admin user
        self.admin_user = User.objects.create_user(
            username='admin_staff',
            email='admin@campus.edu',
            password='Password@123',
            is_staff=True
        )
        self.admin_profile = UserProfile.objects.create(
            user=self.admin_user,
            role='LAB_ADMIN',
            department='Central Instrumentation'
        )

        # Create second student user
        self.other_student = User.objects.create_user(
            username='other_student',
            email='other@campus.edu',
            password='Password@123',
            first_name='Other',
            last_name='Student'
        )
        self.other_profile = UserProfile.objects.create(
            user=self.other_student,
            role='STUDENT',
            roll_number='2023-ECE-999',
            department='Electronics'
        )

        # Create Category & Lab
        self.category = Category.objects.create(
            name='Electronics & IoT',
            slug='electronics-iot',
            icon='Cpu',
            description='Microcontrollers, scopes, and IoT sensors'
        )
        self.lab = Lab.objects.create(
            name='Embedded Systems & IoT Lab',
            code='LAB-IT-301',
            department='Information Technology',
            building='Technology Tower',
            room_number='Lab 305',
            in_charge_name='Dr. Sundaramoorthy',
            in_charge_email='sundar@campus.edu'
        )

        # Create Equipment
        self.equipment = Equipment.objects.create(
            name='Keysight 4-Channel Digital Storage Oscilloscope',
            asset_id='EQP-IOT-001',
            category=self.category,
            lab=self.lab,
            model_number='DSOX1204G',
            manufacturer='Keysight Technologies',
            description='100 MHz, 4 Analog Channels, Built-in Waveform Generator',
            condition='OPERATIONAL',
            total_quantity=2,
            available_quantity=2
        )

    def test_dashboard_stats_endpoint(self):
        response = self.client.get('/api/dashboard/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_equipment', response.data)
        self.assertIn('available_units', response.data)
        self.assertIn('active_bookings', response.data)
        self.assertEqual(response.data['total_equipment'], 1)

    def test_equipment_listing_and_filter(self):
        response = self.client.get('/api/equipment/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        # Filter by category
        res_cat = self.client.get('/api/equipment/?category=electronics-iot')
        self.assertEqual(len(res_cat.data), 1)

        # Search filter
        res_search = self.client.get('/api/equipment/?search=Keysight')
        self.assertEqual(len(res_search.data), 1)

    def test_create_booking_success(self):
        start = timezone.now() + timedelta(days=1)
        end = start + timedelta(hours=3)

        payload = {
            'user_id': self.user.id,
            'equipment': self.equipment.id,
            'start_time': start.isoformat(),
            'end_time': end.isoformat(),
            'purpose': 'Capstone Project Signal Analysis',
            'project_title': 'Smart Grid IoT Monitor',
            'department': 'IT',
            'roll_number': '2023-IT-042'
        }

        response = self.client.post('/api/bookings/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('booking', response.data)
        self.assertTrue(response.data['booking']['booking_ref'].startswith('SCB-'))

    def test_booking_conflict_validation(self):
        start = timezone.now() + timedelta(days=2)
        end = start + timedelta(hours=2)

        # Create 2 approved bookings filling all 2 total units
        for i in range(2):
            Booking.objects.create(
                user=self.user,
                equipment=self.equipment,
                start_time=start,
                end_time=end,
                purpose=f'Conflict Test {i}',
                status='APPROVED'
            )

        # Attempt to book a 3rd overlapping reservation
        payload = {
            'user_id': self.user.id,
            'equipment': self.equipment.id,
            'start_time': start.isoformat(),
            'end_time': end.isoformat(),
            'purpose': 'Overbooking attempt'
        }
        response = self.client.post('/api/bookings/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)

    def test_booking_cancellation(self):
        start = timezone.now() + timedelta(days=3)
        end = start + timedelta(hours=2)

        booking = Booking.objects.create(
            user=self.user,
            equipment=self.equipment,
            start_time=start,
            end_time=end,
            purpose='To be cancelled',
            status='PENDING'
        )

        response = self.client.post(
            f'/api/bookings/{booking.id}/cancel/',
            {'reason': 'Class reschedule', 'user_id': self.user.id},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'CANCELLED')

    def test_admin_status_approval(self):
        start = timezone.now() + timedelta(days=4)
        end = start + timedelta(hours=2)

        booking = Booking.objects.create(
            user=self.user,
            equipment=self.equipment,
            start_time=start,
            end_time=end,
            purpose='Awaiting admin approval',
            status='PENDING'
        )

        response = self.client.post(
            f'/api/bookings/{booking.id}/status/',
            {
                'status': 'APPROVED',
                'admin_remarks': 'Approved by Lab In-Charge',
                'user_id': self.admin_user.id
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'APPROVED')

    def test_invalid_status_transition_prevented(self):
        """Verify that terminal states like RETURNED cannot be reverted to APPROVED or PENDING."""
        start = timezone.now() + timedelta(days=5)
        end = start + timedelta(hours=2)

        booking = Booking.objects.create(
            user=self.user,
            equipment=self.equipment,
            start_time=start,
            end_time=end,
            purpose='Already completed lab session',
            status='RETURNED'
        )

        response = self.client.post(
            f'/api/bookings/{booking.id}/status/',
            {
                'status': 'APPROVED',
                'user_id': self.admin_user.id
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Invalid status transition', response.data.get('error', ''))

    def test_unauthorized_user_cannot_approve_booking(self):
        """Verify that a regular student cannot approve or change booking status."""
        start = timezone.now() + timedelta(days=6)
        end = start + timedelta(hours=2)

        booking = Booking.objects.create(
            user=self.user,
            equipment=self.equipment,
            start_time=start,
            end_time=end,
            purpose='Student unauthorized approval test',
            status='PENDING'
        )

        # Student attempts to approve
        response = self.client.post(
            f'/api/bookings/{booking.id}/status/',
            {
                'status': 'APPROVED',
                'user_id': self.other_student.id
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'PENDING')

    def test_unauthorized_user_cannot_cancel_others_booking(self):
        """Verify that student A cannot cancel student B's reservation."""
        start = timezone.now() + timedelta(days=7)
        end = start + timedelta(hours=2)

        booking = Booking.objects.create(
            user=self.user,
            equipment=self.equipment,
            start_time=start,
            end_time=end,
            purpose='Jeeva reservation',
            status='PENDING'
        )

        # other_student attempts to cancel jeeva's booking
        response = self.client.post(
            f'/api/bookings/{booking.id}/cancel/',
            {
                'reason': 'Malicious cancel attempt',
                'user_id': self.other_student.id
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'PENDING')
