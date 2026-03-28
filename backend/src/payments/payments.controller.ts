import {
    Controller,
    Post,
    Body,
    UseGuards,
    Req,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('initiate')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Initiate payment for an order',
        description:
            'Initiates payment for an order. Supports RAZORPAY (mock) and COD payment methods. ' +
            'For RAZORPAY, creates a gateway order. For COD, directly confirms the order.',
    })
    @ApiResponse({
        status: 200,
        description: 'Payment initiated successfully',
        schema: {
            example: {
                success: true,
                gatewayOrderId: 'mock_order_1234567890',
                amount: 99900,
                currency: 'INR',
                orderNumber: 'ORD2602160001',
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Bad request (invalid order, payment method locked, etc.)' })
    @ApiResponse({ status: 403, description: 'Forbidden (not your order)' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async initiatePayment(@Req() req, @Body() dto: CreatePaymentDto) {
        return this.paymentsService.initiatePayment(req.user.sub, dto);
    }

    @Post('verify')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Verify payment signature',
        description:
            'Verifies payment signature from gateway. On success, confirms order, deducts stock, and clears cart. ' +
            'All operations are atomic - if any step fails, entire transaction rolls back. ' +
            'Idempotent - can be called multiple times safely.',
    })
    @ApiResponse({
        status: 200,
        description: 'Payment verified successfully or already processed',
        schema: {
            example: {
                success: true,
                message: 'Payment verified successfully',
                order: {
                    id: 'clx123456789',
                    orderNumber: 'ORD2602160001',
                    status: 'CONFIRMED',
                    paymentStatus: 'PAID',
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Invalid signature (allows retry)',
        schema: {
            example: {
                success: false,
                message: 'Invalid payment signature',
                canRetry: true,
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Bad request (invalid data, insufficient stock, etc.)' })
    @ApiResponse({ status: 403, description: 'Forbidden (not your order)' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    @ApiResponse({ status: 409, description: 'Conflict (payment already processed)' })
    async verifyPayment(@Req() req, @Body() dto: VerifyPaymentDto) {
        return this.paymentsService.verifyPayment(req.user.sub, dto);
    }

    @SkipThrottle()
    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Handle payment gateway webhook',
        description:
            'Processes webhook notifications from payment gateway (mock). ' +
            'No authentication required. Idempotent - can handle duplicate webhooks safely.',
    })
    @ApiResponse({
        status: 200,
        description: 'Webhook processed successfully',
        schema: {
            example: {
                success: true,
                message: 'Webhook processed',
            },
        },
    })
    @ApiResponse({ status: 404, description: 'Order not found for gateway order ID' })
    async handleWebhook(@Body() payload: any) {
        return this.paymentsService.handleWebhook(payload);
    }
}
