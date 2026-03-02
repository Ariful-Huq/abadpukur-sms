from rest_framework import viewsets, filters, serializers
from django_filters.rest_framework import DjangoFilterBackend
from .models import Teacher, Student, Attendance, Grade 
from .serializers import StudentSerializer, AttendanceSerializer, GradeSerializer, TeacherSerializer
from .views_mfs import MFSInitPaymentView, DownloadReceiptView
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from rest_framework.views import APIView


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

    @action(detail=False, methods=['post'])
    def bulk_mark(self, request):
        attendance_data = request.data.get('records', []) # Expecting list of {student_id, status, date}
        
        for entry in attendance_data:
            Attendance.objects.update_or_create(
                student_id=entry['student_id'],
                date=entry['date'],
                defaults={'status': entry['status']}
            )
        return Response({"message": "Attendance marked successfully"}, status=201)

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
