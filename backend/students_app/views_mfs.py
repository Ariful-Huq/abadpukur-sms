from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse
from .models import FeePayment
from .utils_pdf import render_to_pdf

class MFSInitPaymentView(APIView):
    def post(self, request):
        # Your payment initiation logic here
        return Response({"message": "Payment initiated"})

# THIS IS THE MISSING PIECE:
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
