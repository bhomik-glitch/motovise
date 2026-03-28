import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    UseGuards,
    Request,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @ApiOperation({ summary: 'Create order from cart' })
    @ApiResponse({
        status: 201,
        description:
            'Order created. Response includes fraud scoring fields: ' +
            'rule_score (Int), is_manual_review (Boolean), ' +
            'review_status (Pending | null — non-null only when is_manual_review=true).',
    })
    @ApiResponse({
        status: 400,
        description: 'COD not available for high-risk pincode, or cart is empty',
    })
    createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.createOrder(req.user.sub, createOrderDto);
    }

    @Get('my')
    @ApiOperation({ summary: 'Get my orders' })
    getMyOrders(@Request() req, @Query() query: PaginationQueryDto) {
        return this.ordersService.getMyOrders(
            req.user.sub,
            query.page,
            query.limit,
        );
    }

    @Get('my/:id')
    @ApiOperation({ summary: 'Get my order by ID' })
    getMyOrder(@Request() req, @Param('id') id: string) {
        return this.ordersService.getOrderById(req.user.sub, id);
    }

    @Get()
    @UseGuards(PermissionsGuard)
    @RequirePermissions('order.read')
    @ApiOperation({ summary: 'Get all orders (Admin only)' })
    getAllOrders(@Query() query: PaginationQueryDto) {
        return this.ordersService.getAllOrders(query.page, query.limit);
    }

    @Patch(':id/status')
    @UseGuards(PermissionsGuard)
    @RequirePermissions('order.update')
    @ApiOperation({ summary: 'Update order status (Admin only)' })
    updateOrderStatus(
        @Param('id') id: string,
        @Body() updateStatusDto: UpdateOrderStatusDto,
    ) {
        return this.ordersService.updateOrderStatus(id, updateStatusDto);
    }
}
