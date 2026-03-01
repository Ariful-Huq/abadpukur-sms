from django.contrib import admin
from .models import Student, Grade, Attendance, FeeStructure, FeePayment

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('registration_number', 'first_name', 'last_name', 'is_active')
    search_fields = ('registration_number', 'first_name', 'last_name')

admin.site.register(Grade)
admin.site.register(Attendance)
admin.site.register(FeeStructure)
admin.site.register(FeePayment)
