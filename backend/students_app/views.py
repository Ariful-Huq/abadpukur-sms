import csv
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Teacher, Student, Attendance, Grade, FeeStructure, FeePayment
from .serializers import (
    StudentSerializer, AttendanceSerializer, GradeSerializer, 
    TeacherSerializer, FeeStructureSerializer, FeePaymentSerializer
)

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer

class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'grade']
    search_fields = ['first_name', 'last_name', 'registration_number']
    ordering_fields = ['enrollment_date', 'first_name']
    ordering = ['-enrollment_date']

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
        attendance_data = request.data.get('records', [])
        for entry in attendance_data:
            if entry.get('status'):
                Attendance.objects.update_or_create(
                    student_id=entry['student_id'],
                    date=entry['date'],
                    defaults={'status': entry['status']}
                )
            else:
                Attendance.objects.filter(
                    student_id=entry['student_id'],
                    date=entry['date'],
                ).delete()
        return Response({"message": "Successfully synchronized records"}, status=201)

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
        
        # 1. Base Stats
        total_students = Student.objects.filter(is_active=True).count()
        total_teachers = Teacher.objects.filter(is_active=True).count()
        
        # 2. Attendance Stats
        # P = Present, L = Late
        attendance_records = Attendance.objects.filter(date=today)
        present_today = attendance_records.filter(status='P').count()
        late_today = attendance_records.filter(status='L').count()
        
        # Total "In-School" (Present + Late)
        total_in_school = present_today + late_today
        attendance_rate = (total_in_school / total_students * 100) if total_students > 0 else 0
        
        # 3. Financial Stats
        total_fees = FeePayment.objects.filter(status='COMPLETED').aggregate(Sum('amount_paid'))['amount_paid__sum'] or 0
        
        # 4. Fee Trend
        fee_trend = FeePayment.objects.filter(status='COMPLETED') \
            .annotate(month=TruncMonth('paid_at')) \
            .values('month') \
            .annotate(total=Sum('amount_paid')) \
            .order_by('month')

        # 5. Grade Distribution
        grade_dist = Grade.objects.annotate(
            student_count=Count('students')
        ).values('name', 'section', 'student_count').order_by('name', 'section')

        formatted_grade_dist = [
            {
                "display_name": f"{g['name']} ({g['section']})",
                "count": g['student_count']
            } for g in grade_dist if g['student_count'] > 0
        ]        

        return Response({
            "total_students": total_students,
            "total_teachers": total_teachers,
            "attendance_rate": round(attendance_rate, 1),
            "late_today": late_today,
            "present_today": present_today,
            "total_fees": float(total_fees),
            "fee_trend": list(fee_trend),
            "grade_distribution": formatted_grade_dist,
            "today": today
        })

class ExportFeeReportView(APIView):
    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="fee_report_2026.csv"'
        writer = csv.writer(response)
        writer.writerow(['Student', 'Registration', 'Fee Type', 'Amount', 'Method', 'Date', 'Status'])

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
