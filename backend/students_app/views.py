from rest_framework import viewsets, filters, serializers
from django_filters.rest_framework import DjangoFilterBackend
from .models import Student, Attendance, Grade, Teacher
from .serializers import StudentSerializer, AttendanceSerializer, GradeSerializer, TeacherSerializer
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
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['student', 'date', 'status']

    def create(self, request, *args, **kwargs):
        # Allow bulk creation for attendance
        if isinstance(request.data, list):
            serializer = self.get_serializer(data=request.data, many=True)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response(serializer.data, status=201)
        return super().create(request, *args, **kwargs)

