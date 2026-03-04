import csv
from rest_framework import viewsets, filters, serializers
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from django.utils import timezone
from rest_framework.views import APIView
from .models import Teacher, Student, Attendance, Grade, FeeStructure, FeePayment
from .serializers import StudentSerializer, AttendanceSerializer, GradeSerializer, TeacherSerializer, FeeStructureSerializer, FeePaymentSerializer
from .views_mfs import MFSInitPaymentView, DownloadReceiptView



class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer

class GradeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'grade']
    search_fields = ['first_name', 'last_name', 'registration_number']
    
    # FIX: Change 'created_at' to 'enrollment_date'
    ordering_fields = ['enrollment_date', 'first_name']
    ordering = ['-enrollment_date'] # Show newest students first

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

    @action(detail=False, methods=['get'])
    def monthly(self, request):
        grade_id = request.query_params.get('grade')
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        
        if not all([grade_id, month, year]):
            return Response({"error": "Missing parameters"}, status=400)

        # Fetch records for all students in that grade for the specific month
        records = Attendance.objects.filter(
            student__grade_id=grade_id,
            date__month=month,
            date__year=year
        )
        
        data = [
            {
                "student": r.student_id, 
                "date": r.date.strftime('%Y-%m-%d'), 
                "status": r.status
            } for r in records
        ]
        return Response(data)

    @action(detail=False, methods=['post'])
    def bulk_mark(self, request):
        attendance_data = request.data.get('records', []) # Expecting list of {student_id, status, date}
        
        created_count = 0
        try:
            for entry in attendance_data:
                if not entry.get('status'):
                    continue
                Attendance.objects.update_or_create(
                    student_id=entry['student_id'],
                    date=entry['date'],
                    defaults={'status': entry['status']}
                )
                created_count += 1
            return Response({"message": f"Successfully updated {created_count} records"}, status=201)
        except Exception as e:
            print(f"ATTENDANCE ERROR: {str(e)}")
            return Response({"error": str(e)}, status=500)

class FeeStructureViewSet(viewsets.ModelViewSet):
    queryset = FeeStructure.objects.all()
    serializer_class = FeeStructureSerializer

class FeePaymentViewSet(viewsets.ModelViewSet):
    queryset = FeePayment.objects.all()
    serializer_class = FeePaymentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['student', 'status', 'payment_method']

class DashboardStatsView(APIView):
    def get(self, request):
        today = timezone.now().date()
        total_students = Student.objects.filter(is_active=True).count()
        total_teachers = Teacher.objects.filter(is_active=True).count()
        
        # Calculate today's attendance percentage
        attended_today = Attendance.objects.filter(date=today, status='P').count()
        attendance_rate = (attended_today / total_students * 100) if total_students > 0 else 0
        
        return Response({
            "total_students": total_students,
            "total_teachers": total_teachers,
            "attendance_rate": round(attendance_rate, 1),
            "today": today
        })

class ExportFeeReportView(APIView):
    def get(self, request):
        # Create the HttpResponse object with the appropriate CSV header.
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="fee_report_2026.csv"'

        writer = csv.writer(response)
        # Header Row
        writer.writerow(['Student', 'Registration', 'Fee Type', 'Amount', 'Method', 'Date', 'Status'])

        # Data Rows
        payments = FeePayment.objects.select_related('student', 'fee_type').all()
        for p in payments:
            writer.writerow([
                f"{p.student.first_name} {p.student.last_name}",
                p.student.registration_number,
                p.fee_type.name,
                p.amount_paid,
                p.get_payment_method_display(),
                p.paid_at.strftime('%Y-%m-%d'),
                p.status
            ])

        return response
