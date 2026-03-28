import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
    constructor(private prisma: PrismaService) { }

    // HIGH PRIORITY FIX: Transaction isolation for cart operations
    async addToCart(userId: string, addToCartDto: AddToCartDto) {
        const { productId, quantity } = addToCartDto;

        // Use transaction to ensure atomicity
        return await this.prisma.$transaction(async (tx) => {
            // Verify product exists and is active
            const product = await tx.product.findUnique({
                where: { id: productId },
            });

            if (!product) {
                throw new NotFoundException('Product not found');
            }

            if (!product.isActive) {
                throw new BadRequestException('Product is not available');
            }

            // Check stock
            if (product.stock < quantity) {
                throw new BadRequestException(
                    `Insufficient stock. Available: ${product.stock}`,
                );
            }

            // Get or create cart
            let cart = await tx.cart.findUnique({
                where: { userId },
            });

            if (!cart) {
                cart = await tx.cart.create({
                    data: { userId },
                });
            }

            // Check if adding more would exceed stock
            const existingItem = await tx.cartItem.findUnique({
                where: {
                    cartId_productId: {
                        cartId: cart.id,
                        productId,
                    },
                },
            });

            if (existingItem) {
                const newQuantity = existingItem.quantity + quantity;
                if (product.stock < newQuantity) {
                    throw new BadRequestException(
                        `Insufficient stock. Available: ${product.stock}, Current in cart: ${existingItem.quantity}`,
                    );
                }
            }

            // Atomic upsert - prevents race conditions
            await tx.cartItem.upsert({
                where: {
                    cartId_productId: {
                        cartId: cart.id,
                        productId,
                    },
                },
                update: {
                    quantity: { increment: quantity },
                },
                create: {
                    cartId: cart.id,
                    productId,
                    quantity,
                },
            });

            // Read back within the same transaction so we see the upserted item
            const updatedCart = await tx.cart.findUnique({
                where: { userId },
                include: this.cartInclude,
            });

            const items = updatedCart?.items ?? [];
            const subtotal = items.reduce(
                (sum, i) => sum + Number(i.product.price) * i.quantity,
                0,
            );

            return {
                id: updatedCart!.id,
                items: items.map((i) => ({
                    id: i.id,
                    productId: i.productId,
                    product: i.product,
                    quantity: i.quantity,
                    itemTotal: Number(i.product.price) * i.quantity,
                })),
                subtotal,
                itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
            };
        });
    }

    private readonly cartInclude = {
        items: {
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        price: true,
                        compareAtPrice: true,
                        thumbnail: true,
                        images: true,
                        stock: true,
                        isActive: true,
                    },
                },
            },
        },
    } as const;

    async getCart(userId: string) {
        let cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: this.cartInclude,
        });

        if (!cart) {
            cart = await this.prisma.cart.create({
                data: { userId },
                include: this.cartInclude,
            });
        }

        // Calculate totals
        const subtotal = cart.items.reduce((sum, item) => {
            return sum + Number(item.product.price) * item.quantity;
        }, 0);

        return {
            id: cart.id,
            items: cart.items.map((item) => ({
                id: item.id,
                productId: item.productId,
                product: item.product,
                quantity: item.quantity,
                itemTotal: Number(item.product.price) * item.quantity,
            })),
            subtotal,
            itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        };
    }

    async updateCartItem(
        userId: string,
        productId: string,
        updateCartDto: UpdateCartDto,
    ) {
        const { quantity } = updateCartDto;

        // Get cart
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            throw new NotFoundException('Cart not found');
        }

        // Get cart item
        const cartItem = await this.prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId,
                },
            },
            include: {
                product: true,
            },
        });

        if (!cartItem) {
            throw new NotFoundException('Product not in cart');
        }

        // Check stock
        if (cartItem.product.stock < quantity) {
            throw new BadRequestException(
                `Insufficient stock. Available: ${cartItem.product.stock}`,
            );
        }

        // Update quantity
        await this.prisma.cartItem.update({
            where: { id: cartItem.id },
            data: { quantity },
        });

        return this.getCart(userId);
    }

    async removeFromCart(userId: string, productId: string) {
        // Get cart
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
        });

        if (!cart) {
            throw new NotFoundException('Cart not found');
        }

        // Get cart item
        const cartItem = await this.prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId,
                },
            },
        });

        if (!cartItem) {
            throw new NotFoundException('Product not in cart');
        }

        // Delete item
        await this.prisma.cartItem.delete({
            where: { id: cartItem.id },
        });

        return this.getCart(userId);
    }

    async clearCart(userId: string) {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
        });

        if (cart) {
            await this.prisma.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
        }

        return { message: 'Cart cleared successfully' };
    }
}
