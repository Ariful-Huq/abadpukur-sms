import uuid
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse
from .models import FeePayment, Student, FeeStructure
from .utils_pdf import render_to_pdf

class MFSInitPaymentView(APIView):
    def post(self, request):
        student_id = request.data.get('student_id')
        fee_type_id = request.data.get('fee_type_id')
        amount = request.data.get('amount')

        # PREVENT DOUBLE PAYMENT:
        # Check if this student has already paid this specific fee
        already_paid = FeePayment.objects.filter(
            student_id=student_id, 
            fee_type_id=fee_type_id, 
            status='COMPLETED'
        ).exists()

        if already_paid:
            return Response(
                {"error": "This fee has already been paid for this student."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Create a "PENDING" payment record in your DB
        # This ensures the transaction is tracked before they even pay
        transaction_id = f"BKASH-{uuid.uuid4().hex[:8].upper()}"

        # DEMO: We automatically mark it COMPLETED to simulate a successful handshake
        # In a real app, this happens in a separate 'callback' or 'webhook' view
        try:
            student = Student.objects.get(id=student_id)
            fee_type = FeeStructure.objects.get(id=fee_type_id)
            
            FeePayment.objects.create(
                student=student,
                fee_type=fee_type,
                amount_paid=amount,
                payment_method='MFS',
                transaction_id=transaction_id,
                status='COMPLETED' # Auto-complete for demo testing
            )
        except Exception as e:
            return Response({"error": str(e)}, status=400)

        # 2. In a real MFS integration, you'd call bKash API here.
        # For DEMO, we just return a success URL
        # Replace 5173 with your React port if different
        demo_callback_url = f"http://localhost:5173/fees?status=success&trans_id={transaction_id}"

        return Response({
            "status": "success",
            "gateway_url": demo_callback_url,
        })


class DownloadReceiptView(APIView):
    def get(self, request, payment_id):
        try:
            payment = FeePayment.objects.get(id=payment_id, status='COMPLETED')
            data = {
                'student': payment.student,
                'fee': payment.fee_type,
                'amount': payment.amount_paid,
                'date': payment.paid_at,
                'trans_id': payment.transaction_id,
            }
            pdf = render_to_pdf('receipt_template.html', data)
            response = HttpResponse(pdf, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="receipt_{payment_id}.pdf"'
            return response
        except FeePayment.DoesNotExist:
            return Response({"error": "Payment not found"}, status=404)
