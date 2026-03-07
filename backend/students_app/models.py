from django.db import models
from django.core.validators import MinValueValidator


class Teacher(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    photo = models.ImageField(upload_to='teacher_photos/', null=True, blank=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    subject = models.CharField(max_length=100, help_text="Primary subject taught")
    joining_date = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Grade(models.Model):
    name = models.CharField(max_length=20)  # e.g., "Grade 10"
    section = models.CharField(max_length=5) # e.g., "A"
    room_number = models.CharField(max_length=10, blank=True)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True, related_name='grades')

    def __str__(self):
        return f"{self.name} - {self.section}"

class Student(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    registration_number = models.CharField(max_length=20, unique=True)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    photo = models.ImageField(upload_to='student_photos/', null=True, blank=True)

    # Relationships
    grade = models.ForeignKey(Grade, on_delete=models.PROTECT, related_name='students')
    
    # Contact Info
    parent_name = models.CharField(max_length=200)
    parent_phone = models.CharField(max_length=15)
    address = models.TextField()
    
    enrollment_date = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.registration_number})"
    
class Attendance(models.Model):
    STATUS_CHOICES = [
        ('P', 'Present'),
        ('A', 'Absent'),
        ('L', 'Late'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default='P')
    remarks = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('student', 'date') # Prevents double entry for the same day
        ordering = ['-date']

    def __str__(self):
        return f"{self.student.first_name} - {self.date} - {self.status}"

class Routine(models.Model):
    DAYS_OF_WEEK = [
        (0, 'Sunday'), (1, 'Monday'), (2, 'Tuesday'), 
        (3, 'Wednesday'), (4, 'Thursday')
    ]
    grade = models.ForeignKey(Grade, on_delete=models.CASCADE)
    day = models.IntegerField(choices=DAYS_OF_WEEK)
    slot_number = models.IntegerField() # 1, 2, 3...
    subject = models.CharField(max_length=100)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        unique_together = ('grade', 'day', 'slot_number')


class FeeStructure(models.Model):
    name = models.CharField(max_length=100) # e.g., "Monthly Tuition - Grade 10"
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    due_date = models.DateField()

    def __str__(self):
        return f"{self.name} - (৳{self.amount})"

class FeePayment(models.Model):
    METHOD_CHOICES = [
        ('CASH', 'Cash'),
        ('MFS', 'Mobile Financial Service (bkash/Nagad)'),
        ('Bank', 'Bank Transfer'),

    ]
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='payments')
    fee_type = models.ForeignKey(FeeStructure, on_delete=models.PROTECT)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    paid_at = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(max_length=10, choices=METHOD_CHOICES, default='Cash')
    transaction_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    remarks = models.TextField(blank=True)

    def __str__(self):
        return f"{self.student.first_name} - {self.fee_type.name} - ৳{self.amount_paid}"
