"""
Views for payments app — integrated with Zibal IPG (درگاه پرداخت زیبال).

Flow:
  1. POST  /pay/{bailfine_id}/request_payment/  → calls Zibal /v1/request → returns redirect URL
  2. GET   /pay/{bailfine_id}/payment_callback/ → called by Zibal after user pays → verifies via /v1/verify
  3. POST  /pay/{bailfine_id}/payment_inquiry/  → calls Zibal /v1/inquiry → returns full transaction status
"""
import logging
import requests
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.utils import timezone
from core.permissions import IsSergeant
from .models import BailFine, PaymentTransaction
from .serializers import (
    BailFineSerializer, BailFineCreateSerializer,
    PaymentTransactionSerializer
)

logger = logging.getLogger(__name__)

ZIBAL_BASE_URL = 'https://gateway.zibal.ir'
ZIBAL_REQUEST_URL = f'{ZIBAL_BASE_URL}/v1/request'
ZIBAL_VERIFY_URL = f'{ZIBAL_BASE_URL}/v1/verify'
ZIBAL_INQUIRY_URL = f'{ZIBAL_BASE_URL}/v1/inquiry'
ZIBAL_START_URL = f'{ZIBAL_BASE_URL}/start/{{track_id}}'


# ---------------------------------------------------------------------------
# Zibal result code → human-readable messages
# ---------------------------------------------------------------------------
ZIBAL_REQUEST_MESSAGES = {
    100: 'با موفقیت تایید شد.',
    102: 'merchant یافت نشد.',
    103: 'merchant غیرفعال / عدم امضا قرارداد درگاه مربوطه',
    104: 'merchant نامعتبر',
    105: 'amount بایستی بزرگتر از 1,000 ریال باشد.',
    106: 'callbackUrl نامعتبر می‌باشد.',
    107: 'percentMode نامعتبر می‌باشد.',
    108: 'یک یا چند ذینفع در multiplexingInfos نامعتبر می‌باشند.',
    109: 'یک یا چند ذینفع در multiplexingInfos غیرفعال می‌باشند.',
    110: 'id = self در multiplexingInfos وجود ندارد.',
    111: 'amount با مجموع سهم‌ها در multiplexingInfos برابر نمی‌باشد.',
    112: 'موجودی کیف پول کارمزد جهت کسر کارمزد کافی نیست.',
    113: 'مبلغ تراکنش از سقف میزان تراکنش بیشتر است.',
    114: 'کدملی ارسالی نامعتبر است.',
    115: 'ip شما در پنل کاربری ثبت نشده است.',
}

ZIBAL_VERIFY_MESSAGES = {
    100: 'با موفقیت تایید شد.',
    102: 'merchant یافت نشد.',
    103: 'merchant غیرفعال',
    104: 'merchant نامعتبر',
    201: 'قبلا تایید شده',
    202: 'سفارش پرداخت نشده یا ناموفق بوده است.',
    203: 'trackId نامعتبر می‌باشد.',
}

ZIBAL_STATUS_MESSAGES = {
    -1: 'در انتظار پرداخت',
    -2: 'خطای داخلی',
    1: 'پرداخت شده - تایید شده',
    2: 'پرداخت شده - تایید نشده',
    3: 'لغو شده توسط کاربر',
    4: 'شماره کارت نامعتبر می‌باشد.',
    5: 'موجودی حساب کافی نمی‌باشد.',
    6: 'رمز وارد شده اشتباه می‌باشد.',
    7: 'تعداد درخواست‌ها بیش از حد مجاز می‌باشد.',
    8: 'تعداد پرداخت اینترنتی روزانه بیش از حد مجاز می‌باشد.',
    9: 'مبلغ پرداخت اینترنتی روزانه بیش از حد مجاز می‌باشد.',
    10: 'صادرکننده‌ی کارت نامعتبر می‌باشد.',
    11: 'خطای سوییچ',
    12: 'کارت قابل دسترسی نمی‌باشد.',
    15: 'تراکنش استرداد شده',
    16: 'تراکنش در حال استرداد',
    18: 'تراکنش ریورس شده',
    21: 'پذیرنده نامعتبر است',
}


def _to_rials(decimal_amount) -> int:
    """
    Convert the stored decimal amount (treated as Rials) to an integer.
    Zibal expects the amount in Rials as an integer.

    If your app stores amounts in Tomans, multiply by 10 here:
        return int(decimal_amount) * 10
    """
    return int(decimal_amount)


class BailFineViewSet(viewsets.ModelViewSet):
    """
    ViewSet for BailFine management with Zibal IPG integration.
    """
    queryset = BailFine.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return BailFineCreateSerializer
        return BailFineSerializer

    def get_queryset(self):
        """Filter bail/fines by case, suspect, and/or status."""
        queryset = BailFine.objects.select_related('case', 'suspect', 'set_by')

        case_id = self.request.query_params.get('case', None)
        if case_id:
            queryset = queryset.filter(case_id=case_id)

        suspect_id = self.request.query_params.get('suspect', None)
        if suspect_id:
            queryset = queryset.filter(suspect_id=suspect_id)

        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset

    def get_permissions(self):
        """Only sergeants can create bails; others just need authentication."""
        if self.action == 'create':
            return [IsSergeant()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        """Create bail/fine and record the officer who set it."""
        serializer.save(set_by=self.request.user)

    # ------------------------------------------------------------------
    # 1. REQUEST PAYMENT  →  POST /pay/{id}/request_payment/
    # ------------------------------------------------------------------
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def request_payment(self, request, pk=None):
        """
        Step 1 – Initiate a payment session with Zibal.

        Calls Zibal POST /v1/request and returns a redirect URL that the
        frontend should navigate the user to.

        Returns:
            {
                "track_id": 15966442233311,
                "redirect_url": "https://gateway.zibal.ir/start/15966442233311"
            }
        """
        bail_fine = self.get_object()

        if bail_fine.status == 'Paid':
            return Response(
                {'error': 'Bail/fine has already been paid.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        merchant = getattr(settings, 'ZIBAL_MERCHANT', 'zibal')
        callback_base = getattr(settings, 'ZIBAL_CALLBACK_BASE_URL', 'http://localhost:8000')
        callback_url = f'{callback_base}/api/payments/{bail_fine.pk}/payment_callback/'

        payload = {
            'merchant': merchant,
            'amount': _to_rials(bail_fine.amount),
            'callbackUrl': callback_url,
            'description': (
                f'{bail_fine.type} for case #{bail_fine.case_id} '
                f'(suspect: {bail_fine.suspect})'
            ),
            'orderId': str(bail_fine.pk),
        }

        # Optional: attach suspect mobile if available on the suspect model
        mobile = getattr(bail_fine.suspect, 'mobile', None) or getattr(bail_fine.suspect, 'phone', None)
        if mobile:
            payload['mobile'] = str(mobile)

        try:
            resp = requests.post(ZIBAL_REQUEST_URL, json=payload, timeout=15)
            resp.raise_for_status()
            data = resp.json()
        except requests.exceptions.Timeout:
            logger.error('Zibal /v1/request timed out for bail_fine=%s', bail_fine.pk)
            return Response(
                {'error': 'درگاه پرداخت در دسترس نیست (timeout). دوباره تلاش کنید.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except requests.exceptions.RequestException as exc:
            logger.exception('Zibal /v1/request network error for bail_fine=%s: %s', bail_fine.pk, exc)
            return Response(
                {'error': 'خطا در ارتباط با درگاه پرداخت.'},
                status=status.HTTP_502_BAD_GATEWAY
            )

        result_code = data.get('result')
        if result_code != 100:
            msg = ZIBAL_REQUEST_MESSAGES.get(result_code, data.get('message', 'خطای ناشناخته'))
            logger.warning('Zibal /v1/request failed for bail_fine=%s: code=%s msg=%s', bail_fine.pk, result_code, msg)
            return Response(
                {'error': msg, 'zibal_result': result_code},
                status=status.HTTP_400_BAD_REQUEST
            )

        track_id = data['trackId']
        redirect_url = ZIBAL_START_URL.format(track_id=track_id)

        # Persist a Pending transaction so we can match the callback later
        PaymentTransaction.objects.create(
            bail_fine=bail_fine,
            transaction_id=str(track_id),
            amount=bail_fine.amount,
            currency='IRR',
            status='Pending',
            gateway_response=data,
        )

        return Response({
            'track_id': track_id,
            'redirect_url': redirect_url,
        }, status=status.HTTP_200_OK)

    # ------------------------------------------------------------------
    # 2. PAYMENT CALLBACK  →  GET /pay/{id}/payment_callback/
    #    Zibal calls this URL after the user finishes (or abandons) payment.
    # ------------------------------------------------------------------
    @action(detail=True, methods=['get'], permission_classes=[])
    def payment_callback(self, request, pk=None):
        """
        Step 2 – Called by Zibal via GET with query params:
            ?trackId=&success=&status=&orderId=

        If success=1, we call Zibal POST /v1/verify to confirm the payment.

        Returns a JSON summary (adjust to redirect to a frontend page if needed).
        """
        bail_fine = self.get_object()

        track_id = request.query_params.get('trackId')
        success = request.query_params.get('success')
        zibal_status_code = request.query_params.get('status')
        order_id = request.query_params.get('orderId')

        if not track_id:
            return Response(
                {'error': 'trackId پارامتر یافت نشد.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Retrieve the pending transaction we saved in request_payment
        transaction = PaymentTransaction.objects.filter(
            bail_fine=bail_fine,
            transaction_id=str(track_id),
        ).order_by('-created_date').first()

        callback_data = {
            'trackId': track_id,
            'success': success,
            'status': zibal_status_code,
            'orderId': order_id,
        }

        # Payment was not successful — update and return early
        if success != '1':
            status_msg = ZIBAL_STATUS_MESSAGES.get(
                int(zibal_status_code) if zibal_status_code else -2,
                'پرداخت ناموفق بود.'
            )
            if transaction:
                transaction.status = 'Failed'
                transaction.gateway_response = callback_data
                transaction.save()
            return Response({
                'success': False,
                'message': status_msg,
                'zibal_status': zibal_status_code,
            }, status=status.HTTP_200_OK)

        # ---- Payment was reportedly successful — VERIFY with Zibal ----
        merchant = getattr(settings, 'ZIBAL_MERCHANT', 'zibal')
        verify_payload = {
            'merchant': merchant,
            'trackId': int(track_id),
        }

        try:
            resp = requests.post(ZIBAL_VERIFY_URL, json=verify_payload, timeout=15)
            resp.raise_for_status()
            verify_data = resp.json()
        except requests.exceptions.Timeout:
            logger.error('Zibal /v1/verify timed out for trackId=%s', track_id)
            return Response(
                {'error': 'تایید پرداخت fail شد (timeout). با پشتیبانی تماس بگیرید.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except requests.exceptions.RequestException as exc:
            logger.exception('Zibal /v1/verify error for trackId=%s: %s', track_id, exc)
            return Response(
                {'error': 'خطا در تایید پرداخت از درگاه.'},
                status=status.HTTP_502_BAD_GATEWAY
            )

        verify_result = verify_data.get('result')

        # result=201 means already verified — treat as success to stay idempotent
        if verify_result in (100, 201):
            if transaction:
                transaction.status = 'Success'
                transaction.gateway_response = {**callback_data, **verify_data}
                transaction.completed_date = timezone.now()
                transaction.save()

            # Only update bail_fine if it hasn't been marked Paid yet
            if bail_fine.status != 'Paid':
                bail_fine.status = 'Paid'
                bail_fine.paid_date = timezone.now()
                bail_fine.payment_transaction_id = str(track_id)
                bail_fine.save()

            return Response({
                'success': True,
                'message': ZIBAL_VERIFY_MESSAGES.get(verify_result, 'پرداخت تایید شد.'),
                'bail_fine': BailFineSerializer(bail_fine).data,
                'transaction': PaymentTransactionSerializer(transaction).data if transaction else None,
            }, status=status.HTTP_200_OK)

        # Verification failed
        verify_msg = ZIBAL_VERIFY_MESSAGES.get(verify_result, verify_data.get('message', 'خطا در تایید.'))
        if transaction:
            transaction.status = 'Failed'
            transaction.gateway_response = {**callback_data, **verify_data}
            transaction.save()

        logger.warning(
            'Zibal /v1/verify failed for trackId=%s bail_fine=%s: code=%s msg=%s',
            track_id, bail_fine.pk, verify_result, verify_msg
        )
        return Response({
            'success': False,
            'message': verify_msg,
            'zibal_result': verify_result,
        }, status=status.HTTP_200_OK)

    # ------------------------------------------------------------------
    # 3. PAYMENT INQUIRY  →  POST /pay/{id}/payment_inquiry/
    # ------------------------------------------------------------------
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def payment_inquiry(self, request, pk=None):
        """
        Step 3 (optional) – Query Zibal /v1/inquiry for the full transaction status.

        Body (optional): { "track_id": 15966442233311 }
        If omitted, the latest PaymentTransaction for this bail_fine is used.

        Returns the raw Zibal inquiry response plus local transaction data.
        """
        bail_fine = self.get_object()

        track_id = request.data.get('track_id')
        if not track_id:
            # Fall back to the most recent transaction
            latest = PaymentTransaction.objects.filter(bail_fine=bail_fine).order_by('-created_date').first()
            if not latest:
                return Response(
                    {'error': 'هیچ تراکنشی برای این جریمه/ضمانت یافت نشد.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            track_id = latest.transaction_id

        merchant = getattr(settings, 'ZIBAL_MERCHANT', 'zibal')
        payload = {
            'merchant': merchant,
            'trackId': int(track_id),
        }

        try:
            resp = requests.post(ZIBAL_INQUIRY_URL, json=payload, timeout=15)
            resp.raise_for_status()
            inquiry_data = resp.json()
        except requests.exceptions.Timeout:
            return Response(
                {'error': 'استعلام پرداخت fail شد (timeout).'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except requests.exceptions.RequestException as exc:
            logger.exception('Zibal /v1/inquiry error for trackId=%s: %s', track_id, exc)
            return Response(
                {'error': 'خطا در ارتباط با درگاه برای استعلام.'},
                status=status.HTTP_502_BAD_GATEWAY
            )

        inquiry_result = inquiry_data.get('result')
        if inquiry_result != 100:
            return Response({
                'error': ZIBAL_REQUEST_MESSAGES.get(inquiry_result, 'خطا در استعلام.'),
                'zibal_result': inquiry_result,
                'raw': inquiry_data,
            }, status=status.HTTP_400_BAD_REQUEST)

        zibal_txn_status = inquiry_data.get('status')
        status_description = ZIBAL_STATUS_MESSAGES.get(zibal_txn_status, 'نامشخص')

        return Response({
            'track_id': track_id,
            'zibal_status': zibal_txn_status,
            'status_description': status_description,
            'amount': inquiry_data.get('amount'),
            'paid_at': inquiry_data.get('paidAt'),
            'card_number': inquiry_data.get('cardNumber'),
            'raw': inquiry_data,
        }, status=status.HTTP_200_OK)
