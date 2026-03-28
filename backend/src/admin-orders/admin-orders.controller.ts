import {
    Controller,
    Get,
    Param,
    Query,
    UseGuards,
    ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { AdminOrdersService } from './admin-orders.service';
import { ListOrdersDto } from './dto/list-orders.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

@ApiTags('Admin Orders')
@Controller('admin/orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('order.read')
@ApiBearerAuth()
export class AdminOrdersController {
    constructor(private readonly adminOrdersService: AdminOrdersService) { }

    /**
     * GET /v1/admin/orders
     * List all orders with filters, search, and pagination.
     */
    @Get()
    @ApiOperation({ summary: 'List all orders (admin)' })
    @ApiOkResponse({ description: 'Paginated order list' })
    listOrders(
        @Query(new ValidationPipe({ transform: true, whitelist: true }))
        query: ListOrdersDto,
    ) {
        return this.adminOrdersService.listOrders(query);
    }

    /**
     * GET /v1/admin/orders/:id
     * Get full order details by ID (read-only).
     */
    @Get(':id')
    @ApiOperation({ summary: 'Get order details by ID (admin)' })
    @ApiOkResponse({ description: 'Full order detail' })
    getOrderById(@Param('id') id: string) {
        return this.adminOrdersService.getOrderById(id);
    }
}
