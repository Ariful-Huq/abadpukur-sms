# students_app/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StudentViewSet, AttendanceViewSet, GradeViewSet, TeacherViewSet, RoutineViewSet,
    DashboardStatsView, FeeStructureViewSet, FeePaymentViewSet, ExportFeeReportView
)
from .views_mfs import MFSInitPaymentView, DownloadReceiptView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'teachers', TeacherViewSet)
router.register(r'grades', GradeViewSet)
router.register(r'routine', RoutineViewSet)
router.register(r'fee-structures', FeeStructureViewSet)
router.register(r'fee-payments', FeePaymentViewSet)

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('payment/init/', MFSInitPaymentView.as_view(), name='mfs-init'),
    path('receipt/<int:payment_id>/', DownloadReceiptView.as_view(), name='receipt-download'),
    path('dashboard-stats/', DashboardStatsView.as_view()),
    path('export-fees/', ExportFeeReportView.as_view(), name='export-fees'),
    # This must be at the bottom so the specific paths above take priority
    path('', include(router.urls)),
]
