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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @ApiOperation({ summary: 'Create order from cart' })
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
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Get all orders (Admin only)' })
    getAllOrders(@Query() query: PaginationQueryDto) {
        return this.ordersService.getAllOrders(query.page, query.limit);
    }

    @Patch(':id/status')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Update order status (Admin only)' })
    updateOrderStatus(
        @Param('id') id: string,
        @Body() updateStatusDto: UpdateOrderStatusDto,
    ) {
        return this.ordersService.updateOrderStatus(id, updateStatusDto);
    }
}
