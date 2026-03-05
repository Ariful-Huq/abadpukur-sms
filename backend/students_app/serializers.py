from rest_framework import serializers
from .models import Student, Attendance, Grade, Teacher, FeeStructure, FeePayment

class TeacherSerializer(serializers.ModelSerializer):
    assigned_grades = serializers.SerializerMethodField()

    class Meta:
        model = Teacher
        fields = [
            'id', 'first_name', 'last_name', 'photo', 'email', 
            'phone', 'subject', 'joining_date', 'is_active', 'assigned_grades'
        ]

    def get_assigned_grades(self, obj):
        # Accessing the 'related_name' defined in your Grade model
        try:
            # This assumes your Grade model has a foreign key to Teacher
            # and uses the default related_name 'grade_set' or custom 'grades'
            grades = obj.grades.all() 
            return [f"{g.name} - {g.section}" for g in grades]
        except AttributeError:
            # Fallback if the related_name is different or not yet set
            return []
    
    def update(self, instance, validated_data):
        """
        Handles photo removal if the frontend sends an empty string,
        and ensures physical files are cleaned up from storage.
        """
        if 'photo' in validated_data and validated_data['photo'] == "":
            if instance.photo:
                instance.photo.delete(save=False)
            validated_data['photo'] = None
        
        return super().update(instance, validated_data)

class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = ['id', 'name', 'section', 'teacher']

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.first_name')
    class Meta:
        model = Attendance
        fields = ['id', 'student', 'student_name', 'date', 'status', 'remarks']

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

class StudentSerializer(serializers.ModelSerializer):
    attendance_rate = serializers.SerializerMethodField()
    grade_name = serializers.CharField(source='grade.name', read_only=True)
    payment_history = FeePaymentSerializer(many=True, read_only=True, source='payments')
    attendance_history = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            'id', 'first_name', 'last_name', 'photo', 'registration_number', 
            'gender', 'date_of_birth', 'grade', 'grade_name',
            'parent_name', 'parent_phone', 'address', 'is_active', 'attendance_rate',
            'payment_history', 'attendance_history'
        ]

    def update(self, instance, validated_data):
        # Check if photo is sent as an empty string (from our React 'clear' logic)
        if 'photo' in validated_data and validated_data['photo'] == "":
            # Optional: Delete the file from the physical storage
            if instance.photo:
                instance.photo.delete(save=False)
            validated_data['photo'] = None
        
        return super().update(instance, validated_data)

    def get_attendance_history(self, obj):
        # This manually fetches the records if the related_name is acting up
        records = Attendance.objects.filter(student=obj).order_by('-date')[:30]
        return AttendanceSerializer(records, many=True).data

    def get_attendance_rate(self, obj):
        total = obj.attendance_records.count()
        if total == 0: return 100
        present = obj.attendance_records.filter(status='P').count()
        return round((present / total) * 100, 2)
