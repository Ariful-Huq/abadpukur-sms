from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, AttendanceViewSet, GradeViewSet, TeacherViewSet, DashboardStatsView
from .views_mfs import MFSInitPaymentView, DownloadReceiptView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'teachers', TeacherViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('payment/init/', MFSInitPaymentView.as_view(), name='mfs-init'),
    path('receipt/<int:payment_id>/', DownloadReceiptView.as_view(), name='receipt-download'),
    path('dashboard-stats/', DashboardStatsView.as_view()),
]
