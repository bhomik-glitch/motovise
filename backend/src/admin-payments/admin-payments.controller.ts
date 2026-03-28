import { Controller, Get, Param, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { AdminPaymentsService } from './admin-payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Admin Payments')
@Controller('admin/payments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('payment.read')
@ApiBearerAuth()
export class AdminPaymentsController {
    constructor(private readonly adminPaymentsService: AdminPaymentsService) { }

    @Get()
    getPayments(@Query(new ValidationPipe({ transform: true, whitelist: true })) query: any) {
        return this.adminPaymentsService.getPayments(query);
    }

    @Get(':id/attempts')
    getPaymentAttempts(@Param('id') id: string) {
        return this.adminPaymentsService.getPaymentAttempts(id);
    }
}
