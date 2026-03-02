from rest_framework import serializers
from .models import Student, Attendance, Grade, Teacher, FeeStructure, FeePayment

class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = '__all__'

class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = ['id', 'name', 'section']

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.first_name')
    class Meta:
        model = Attendance
        fields = ['id', 'student', 'student_name', 'date', 'status', 'remarks']

class StudentSerializer(serializers.ModelSerializer):
    attendance_rate = serializers.SerializerMethodField()
    grade_name = serializers.CharField(source='grade.name', read_only=True)

    class Meta:
        model = Student
        fields = [
            'id', 'first_name', 'last_name', 'registration_number', 
            'gender', 'date_of_birth', 'grade', 'grade_name',
            'parent_name', 'parent_phone', 'address', 'is_active', 'attendance_rate'
        ]

    def get_attendance_rate(self, obj):
        total = obj.attendance_records.count()
        if total == 0: return 100
        present = obj.attendance_records.filter(status='P').count()
        return round((present / total) * 100, 2)

class FeeStructureSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeStructure
        fields = '__all__'

class FeePaymentSerializer(serializers.ModelSerializer):
    # Helpful for displaying names in the React table without extra API calls
    student_name = serializers.ReadOnlyField(source='student.first_name')
    fee_name = serializers.ReadOnlyField(source='fee_type.name')

    class Meta:
        model = FeePayment
        fields = '__all__'

