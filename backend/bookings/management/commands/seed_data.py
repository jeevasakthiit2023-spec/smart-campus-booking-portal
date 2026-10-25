from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from bookings.models import UserProfile, Category, Lab, Equipment, Booking


class Command(BaseCommand):
    help = 'Seeds initial campus resources, labs, equipment, demo users, and bookings'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE("Initializing Smart Campus Resource Portal database..."))

        # 1. Create Users
        # Superuser / Lab Admin
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@campus.edu',
                'first_name': 'Dr. Ramanathan',
                'last_name': 'K (Dean / Lab Head)',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            UserProfile.objects.create(
                user=admin_user,
                role='LAB_ADMIN',
                roll_number='EMP-ADM-001',
                department='Dean of Academic Research',
                phone='+91 98401 23456'
            )
            self.stdout.write(self.style.SUCCESS(f"Created admin user: admin / admin123"))

        # Faculty User
        faculty_user, created = User.objects.get_or_create(
            username='prof_sundar',
            defaults={
                'email': 'sundar@campus.edu',
                'first_name': 'Prof. Sundaramoorthy',
                'last_name': 'V',
                'is_staff': False,
            }
        )
        if created:
            faculty_user.set_password('faculty123')
            faculty_user.save()
            UserProfile.objects.create(
                user=faculty_user,
                role='FACULTY',
                roll_number='EMP-FAC-104',
                department='Information Technology',
                phone='+91 98402 34567'
            )
            self.stdout.write(self.style.SUCCESS(f"Created faculty user: prof_sundar / faculty123"))

        # Student 1 (Jeevasakthi)
        student1, created = User.objects.get_or_create(
            username='jeeva_student',
            defaults={
                'email': 'jeeva.it2023@campus.edu',
                'first_name': 'Jeevasakthi',
                'last_name': 'S',
                'is_staff': False,
            }
        )
        if created:
            student1.set_password('student123')
            student1.save()
            UserProfile.objects.create(
                user=student1,
                role='STUDENT',
                roll_number='2023-IT-042',
                department='Information Technology',
                phone='+91 98403 45678'
            )
            self.stdout.write(self.style.SUCCESS(f"Created student user: jeeva_student / student123"))

        # Student 2 (Priya)
        student2, created = User.objects.get_or_create(
            username='priya_student',
            defaults={
                'email': 'priya.ece2023@campus.edu',
                'first_name': 'Priya',
                'last_name': 'R',
                'is_staff': False,
            }
        )
        if created:
            student2.set_password('student123')
            student2.save()
            UserProfile.objects.create(
                user=student2,
                role='STUDENT',
                roll_number='2023-ECE-108',
                department='Electronics & Communication Engineering',
                phone='+91 98404 56789'
            )

        # 2. Create Categories
        categories_data = [
            {
                'name': 'Electronics & IoT',
                'slug': 'electronics-iot',
                'icon': 'Cpu',
                'description': 'Oscilloscopes, spectrum analyzers, signal generators, microcontroller testbeds & IoT gateways.'
            },
            {
                'name': 'AI & High Performance Computing',
                'slug': 'ai-hpc',
                'icon': 'Server',
                'description': 'NVIDIA Tensor Core clusters, edge AI accelerators, and neural network training workstations.'
            },
            {
                'name': 'Robotics & Automation',
                'slug': 'robotics-automation',
                'icon': 'Bot',
                'description': 'Collaborative robotic arms, mobile AGVs, LiDAR scanners, drone development rigs, and servo test benches.'
            },
            {
                'name': '3D Printing & FabLab',
                'slug': '3d-printing-fablab',
                'icon': 'Printer',
                'description': 'Industrial grade FDM & SLA 3D printers, laser cutters, CNC PCB milling, and rapid prototyping tools.'
            },
            {
                'name': 'Biotechnology & Analytical Chemistry',
                'slug': 'biotech-analytical',
                'icon': 'FlaskConical',
                'description': 'HPLC systems, UV-Vis spectrophotometers, PCR thermal cyclers, centrifuges, and laminar flow hoods.'
            },
        ]

        cat_objs = {}
        for cdata in categories_data:
            cat, _ = Category.objects.get_or_create(slug=cdata['slug'], defaults=cdata)
            cat_objs[cat.slug] = cat

        # 3. Create Labs
        labs_data = [
            {
                'name': 'Advanced Embedded Systems & IoT Lab',
                'code': 'LAB-EE-302',
                'department': 'Electronics & Communication',
                'building': 'Technology Tower',
                'room_number': 'Room 302',
                'in_charge_name': 'Dr. S. Sundaramoorthy',
                'in_charge_email': 'sundar@campus.edu'
            },
            {
                'name': 'NVIDIA AI & Deep Learning Studio',
                'code': 'LAB-CS-401',
                'department': 'Computer Science & Engineering',
                'building': 'Alan Turing Block',
                'room_number': 'Room 401',
                'in_charge_name': 'Dr. K. Ramanathan',
                'in_charge_email': 'ramanathan@campus.edu'
            },
            {
                'name': 'Center for Robotics & Autonomous Systems',
                'code': 'LAB-ME-105',
                'department': 'Mechanical & Mechatronics',
                'building': 'Sir M. Visvesvaraya Hall',
                'room_number': 'Room 105',
                'in_charge_name': 'Dr. Ananya Sharma',
                'in_charge_email': 'ananya.me@campus.edu'
            },
            {
                'name': 'Smart FabLab & Additive Prototyping',
                'code': 'LAB-FAB-110',
                'department': 'Design & Innovation Center',
                'building': 'Kalam Innovation Hub',
                'room_number': 'Room 110',
                'in_charge_name': 'Er. Rajesh Kumar',
                'in_charge_email': 'fablab@campus.edu'
            },
            {
                'name': 'Central Analytical & Nano-Bio Facility',
                'code': 'LAB-BIO-214',
                'department': 'Biotechnology & Chemistry',
                'building': 'Science Complex',
                'room_number': 'Room 214',
                'in_charge_name': 'Dr. Mythili Venkat',
                'in_charge_email': 'mythili@campus.edu'
            },
        ]

        lab_objs = {}
        for ldata in labs_data:
            lab, _ = Lab.objects.get_or_create(code=ldata['code'], defaults=ldata)
            lab_objs[lab.code] = lab

        # 4. Create Equipment
        equipment_data = [
            {
                'name': 'Keysight 4-Channel Digital Storage Oscilloscope (1 GHz)',
                'asset_id': 'EQP-OSC-0101',
                'category': cat_objs['electronics-iot'],
                'lab': lab_objs['LAB-EE-302'],
                'model_number': 'InfiniiVision DSOX3014T',
                'manufacturer': 'Keysight Technologies',
                'description': '1 GHz bandwidth, 4 analog channels, 5 GSa/s sample rate with integrated 20 MHz arbitrary function generator and touch screen UI.',
                'specifications': '1 GHz Bandwidth | 5 GSa/s | 4 Channels | Built-in Waveform Gen | SPI/I2C Protocol Decode',
                'condition': 'OPERATIONAL',
                'total_quantity': 3,
                'available_quantity': 3,
                'hourly_guidelines': 'Maximum booking 4 hours per slot. Handle active probes with care and do not exceed 50V input without attenuator.',
                'safety_protocol': 'Anti-static wrist strap mandatory. Power down target board before probe attachment.',
                'image_url': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
            },
            {
                'name': 'NVIDIA DGX A100 Deep Learning Workstation',
                'asset_id': 'EQP-AI-0202',
                'category': cat_objs['ai-hpc'],
                'lab': lab_objs['LAB-CS-401'],
                'model_number': 'DGX-A100-640GB',
                'manufacturer': 'NVIDIA Corporation',
                'description': 'Supercomputing cluster featuring 8x NVIDIA A100 80GB Tensor Core GPUs, AMD EPYC 7742 128-core CPU, and 2TB RAM for LLM fine-tuning and computer vision.',
                'specifications': '8x A100 GPUs (640GB VRAM) | 5 PFLOPS FP16 | 2TB RAM | Dual 100GbE NICs',
                'condition': 'OPERATIONAL',
                'total_quantity': 2,
                'available_quantity': 2,
                'hourly_guidelines': 'Requires faculty approval. Submit Singularity or Docker container script alongside reservation.',
                'safety_protocol': 'Adhere to thermal dissipation rules. No cryptomining or unauthorized high-bandwidth transfers.',
                'image_url': 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80',
            },
            {
                'name': 'Stratasys F170 Industrial Prototyping 3D Printer',
                'asset_id': 'EQP-3DP-0303',
                'category': cat_objs['3d-printing-fablab'],
                'lab': lab_objs['LAB-FAB-110'],
                'model_number': 'Stratasys F170 Series',
                'manufacturer': 'Stratasys Ltd.',
                'description': 'Industrial grade FDM 3D printer supporting ABS-M30, PLA, and soluble QSR support materials with heated chamber for zero-warp precision parts.',
                'specifications': '254 x 254 x 254 mm Build Volume | 0.127 mm Layer Height | Soluble Supports | Auto-Calibration',
                'condition': 'OPERATIONAL',
                'total_quantity': 2,
                'available_quantity': 2,
                'hourly_guidelines': 'Submit STL file to lab technician 1 hour prior to slot. Bring your own approved spool if using custom materials.',
                'safety_protocol': 'Extruder nozzle operates at 280°C. Never open chamber glass door during active print cycle.',
                'image_url': 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80',
            },
            {
                'name': 'Universal Robots UR5e Collaborative Robotic Arm',
                'asset_id': 'EQP-ROB-0404',
                'category': cat_objs['robotics-automation'],
                'lab': lab_objs['LAB-ME-105'],
                'model_number': 'UR5e e-Series',
                'manufacturer': 'Universal Robots',
                'description': '6-degree-of-freedom collaborative robotic arm with built-in force/torque sensor, 5 kg payload, 850 mm reach, and ROS2 integration support.',
                'specifications': '6 Axis Degrees of Freedom | 5 kg Payload | 850 mm Reach | ±0.03 mm Repeatability | ROS2 / Python API',
                'condition': 'OPERATIONAL',
                'total_quantity': 1,
                'available_quantity': 1,
                'hourly_guidelines': 'Ensure emergency stop cord is tethered within arm reach at all times during automated program execution.',
                'safety_protocol': 'Maintain 1.5-meter clearance perimeter. Hard hats and protective eye gear required.',
                'image_url': 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=800&q=80',
            },
            {
                'name': 'Rigol RSA5065N Real-Time Spectrum Analyzer (6.5 GHz)',
                'asset_id': 'EQP-SPEC-0505',
                'category': cat_objs['electronics-iot'],
                'lab': lab_objs['LAB-EE-302'],
                'model_number': 'RSA5065N',
                'manufacturer': 'Rigol Technologies',
                'description': 'Real-time spectrum analyzer with 40 MHz real-time bandwidth, vector network analysis (VNA) mode, and EMI pre-compliance testing suites.',
                'specifications': '9 kHz - 6.5 GHz | -165 dBm DANL | 40 MHz RTBW | Built-in VNA & Tracking Gen',
                'condition': 'OPERATIONAL',
                'total_quantity': 2,
                'available_quantity': 2,
                'hourly_guidelines': 'Use 50 Ohm dummy loads or calibrated attenuators. Do not feed unknown transmitter signals directly.',
                'safety_protocol': 'Ensure RF connector torque wrench is set to 8 in-lbs to prevent damaging SMA and N-type ports.',
                'image_url': 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
            },
            {
                'name': 'Agilent 1260 Infinity II HPLC System',
                'asset_id': 'EQP-HPLC-0606',
                'category': cat_objs['biotech-analytical'],
                'lab': lab_objs['LAB-BIO-214'],
                'model_number': '1260 Infinity II',
                'manufacturer': 'Agilent Technologies',
                'description': 'High-performance liquid chromatography quaternary system with diode array detector (DAD), autosampler, and OpenLab CDS data processing.',
                'specifications': '600 bar Maximum Pressure | 0.001 - 5 mL/min Flow Rate | DAD UV-Vis Detector | 120 Vial Capacity',
                'condition': 'OPERATIONAL',
                'total_quantity': 1,
                'available_quantity': 1,
                'hourly_guidelines': 'Samples must be filtered through 0.22 um PTFE syringe filters prior to loading. Minimum booking 3 hours.',
                'safety_protocol': 'Wear chemical nitrile gloves and lab coat. Dispose mobile phase waste only in designated amber bottles.',
                'image_url': 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80',
            },
            {
                'name': 'FLIR E8-XT High-Resolution Thermal Imaging Camera',
                'asset_id': 'EQP-THM-0707',
                'category': cat_objs['electronics-iot'],
                'lab': lab_objs['LAB-EE-302'],
                'model_number': 'FLIR E8-XT WiFi',
                'manufacturer': 'Teledyne FLIR',
                'description': 'Infrared thermal inspection camera with MSX multi-spectral dynamic imaging, 320x240 IR resolution, and temperature range up to 550°C.',
                'specifications': '320 x 240 IR Resolution | -20°C to +550°C | MSX Detail Enhancement | WiFi Reporting',
                'condition': 'OPERATIONAL',
                'total_quantity': 2,
                'available_quantity': 2,
                'hourly_guidelines': 'Store in protective padded Pelican case when transporting between lab benches.',
                'safety_protocol': 'Do not point detector lens directly at laser sources or intense solar radiation.',
                'image_url': 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=800&q=80',
            },
            {
                'name': 'Formlabs Form 3+ Stereolithography (SLA) 3D Printer',
                'asset_id': 'EQP-SLA-0808',
                'category': cat_objs['3d-printing-fablab'],
                'lab': lab_objs['LAB-FAB-110'],
                'model_number': 'Form 3+ LFS',
                'manufacturer': 'Formlabs Inc.',
                'description': 'Low Force Stereolithography resin 3D printer for ultra-smooth microfluidics, biomedical prototypes, and micro-mechanical gears.',
                'specifications': '25 um XY Resolution | 145 x 145 x 185 mm Build Vol | 250 mW 405nm Laser | Form Wash & Cure Unit',
                'condition': 'MAINTENANCE',
                'total_quantity': 1,
                'available_quantity': 0,
                'hourly_guidelines': 'Currently undergoing monthly optical mirror recalibration and resin tank replacement.',
                'safety_protocol': 'Handle liquid photopolymer resins only under active fume extraction with neoprene gloves.',
                'image_url': 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80',
            },
        ]

        equip_objs = {}
        for eq_data in equipment_data:
            eq, _ = Equipment.objects.get_or_create(asset_id=eq_data['asset_id'], defaults=eq_data)
            equip_objs[eq.asset_id] = eq

        # 5. Create Sample Bookings
        now = timezone.now()

        bookings_data = [
            {
                'booking_ref': 'SCB-2026-A101',
                'user': student1,
                'equipment': equip_objs['EQP-OSC-0101'],
                'start_time': now + timedelta(days=1, hours=2),
                'end_time': now + timedelta(days=1, hours=5),
                'purpose': 'FPGA Signal Integrity Analysis & Jitter Measurement for B.Tech Final Year Project.',
                'project_title': 'Ultra-Low Latency Edge Sensor Hub',
                'supervisor_name': 'Prof. Sundaramoorthy V',
                'department': 'Information Technology',
                'roll_number': '2023-IT-042',
                'status': 'APPROVED',
                'admin_remarks': 'Approved. Bench slot #4 assigned with passive probe kit.'
            },
            {
                'booking_ref': 'SCB-2026-B204',
                'user': student2,
                'equipment': equip_objs['EQP-AI-0202'],
                'start_time': now + timedelta(days=2, hours=1),
                'end_time': now + timedelta(days=2, hours=6),
                'purpose': 'Distributed Vision Transformer model fine-tuning for biomedical CT slice segmentation.',
                'project_title': 'AI Automated Pathology Assistant',
                'supervisor_name': 'Dr. Ramanathan K',
                'department': 'Electronics & Communication',
                'roll_number': '2023-ECE-108',
                'status': 'APPROVED',
                'admin_remarks': 'Approved. Cluster node partition gpu_queue_a100 allocated.'
            },
            {
                'booking_ref': 'SCB-2026-C307',
                'user': student1,
                'equipment': equip_objs['EQP-3DP-0303'],
                'start_time': now + timedelta(days=3, hours=3),
                'end_time': now + timedelta(days=3, hours=7),
                'purpose': 'Fabrication of lightweight carbon-fiber reinforced drone arm brackets and gimbal enclosure.',
                'project_title': 'Autonomous Disaster Surveillance Quadcopter',
                'supervisor_name': 'Dr. Ananya Sharma',
                'department': 'Information Technology',
                'roll_number': '2023-IT-042',
                'status': 'PENDING',
                'admin_remarks': ''
            },
            {
                'booking_ref': 'SCB-2026-D409',
                'user': faculty_user,
                'equipment': equip_objs['EQP-ROB-0404'],
                'start_time': now + timedelta(days=4, hours=2),
                'end_time': now + timedelta(days=4, hours=5),
                'purpose': 'Trajectory trajectory optimization and impedance control trials for research paper demonstration.',
                'project_title': 'Human-Robot Collaborative Assembly',
                'supervisor_name': 'Self / Research PI',
                'department': 'Information Technology',
                'roll_number': 'EMP-FAC-104',
                'status': 'APPROVED',
                'admin_remarks': 'Priority research booking confirmed.'
            },
            {
                'booking_ref': 'SCB-2026-E511',
                'user': student2,
                'equipment': equip_objs['EQP-HPLC-0606'],
                'start_time': now - timedelta(days=2, hours=4),
                'end_time': now - timedelta(days=2, hours=1),
                'purpose': 'Quantification of secondary metabolites from medicinal plant leaf extracts.',
                'project_title': 'Phytochemical Screening Project',
                'supervisor_name': 'Dr. Mythili Venkat',
                'department': 'Biotechnology',
                'roll_number': '2023-ECE-108',
                'status': 'RETURNED',
                'admin_remarks': 'Completed successfully. Column washed and pressure log verified.'
            },
            {
                'booking_ref': 'SCB-2026-F613',
                'user': student1,
                'equipment': equip_objs['EQP-SPEC-0505'],
                'start_time': now - timedelta(days=1, hours=3),
                'end_time': now - timedelta(days=1, hours=1),
                'purpose': 'LoRa 868 MHz band harmonics and transmission spurious emissions measurement.',
                'project_title': 'Smart Campus Weather Node',
                'supervisor_name': 'Prof. Sundaramoorthy V',
                'department': 'Information Technology',
                'roll_number': '2023-IT-042',
                'status': 'CANCELLED',
                'admin_remarks': '[Cancellation Note]: Component shipment delayed; cancelled by student.'
            },
        ]

        for bdata in bookings_data:
            ref = bdata['booking_ref']
            if not Booking.objects.filter(booking_ref=ref).exists():
                Booking.objects.create(**bdata)

        # Update available quantities
        for eq in Equipment.objects.all():
            eq.update_availability()

        self.stdout.write(self.style.SUCCESS("Successfully seeded Smart Campus Portal database!"))
