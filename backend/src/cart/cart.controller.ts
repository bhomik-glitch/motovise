import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Post('add')
    @ApiOperation({ summary: 'Add product to cart' })
    addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
        return this.cartService.addToCart(req.user.sub, addToCartDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get user cart' })
    getCart(@Request() req) {
        return this.cartService.getCart(req.user.sub);
    }

    @Patch('update/:productId')
    @ApiOperation({ summary: 'Update cart item quantity' })
    updateCartItem(
        @Request() req,
        @Param('productId') productId: string,
        @Body() updateCartDto: UpdateCartDto,
    ) {
        return this.cartService.updateCartItem(
            req.user.sub,
            productId,
            updateCartDto,
        );
    }

    @Delete('remove/:productId')
    @ApiOperation({ summary: 'Remove product from cart' })
    removeFromCart(@Request() req, @Param('productId') productId: string) {
        return this.cartService.removeFromCart(req.user.sub, productId);
    }

    @Delete('clear')
    @ApiOperation({ summary: 'Clear entire cart' })
    clearCart(@Request() req) {
        return this.cartService.clearCart(req.user.sub);
    }
}
