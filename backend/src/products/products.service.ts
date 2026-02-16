import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { slugify, generateUniqueSlug } from '../common/utils/slug.util';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async create(createProductDto: CreateProductDto) {
        const { name, sku, categoryId, ...rest } = createProductDto;

        // Check if SKU already exists
        if (sku) {
            const existingProduct = await this.prisma.product.findUnique({
                where: { sku },
            });

            if (existingProduct) {
                throw new ConflictException('Product with this SKU already exists');
            }
        }

        // Verify category exists
        if (categoryId) {
            const category = await this.prisma.category.findUnique({
                where: { id: categoryId },
            });

            if (!category) {
                throw new BadRequestException('Category not found');
            }
        }

        // Generate unique slug
        const baseSlug = slugify(name);
        const existingProducts = await this.prisma.product.findMany({
            where: {
                slug: {
                    startsWith: baseSlug,
                },
            },
            select: { slug: true },
        });
        const existingSlugs = existingProducts.map((p) => p.slug);
        const slug = generateUniqueSlug(baseSlug, existingSlugs);

        // Create product
        const product = await this.prisma.product.create({
            data: {
                name,
                slug,
                sku,
                categoryId,
                ...rest,
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });

        return product;
    }

    async findAll(filterDto: FilterProductDto) {
        const {
            search,
            categoryId,
            isActive,
            isFeatured,
            page,
            limit,
            sortBy,
            sortOrder,
        } = filterDto;

        const skip = (page - 1) * limit;

        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (isActive !== undefined) {
            where.isActive = isActive;
        }

        if (isFeatured !== undefined) {
            where.isFeatured = isFeatured;
        }

        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [sortBy]: sortOrder,
                },
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            }),
            this.prisma.product.count({ where }),
        ]);

        return {
            data: products,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    async findBySlug(slug: string) {
        const product = await this.prisma.product.findUnique({
            where: { slug },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    async update(id: string, updateProductDto: UpdateProductDto) {
        const { name, sku, categoryId, ...rest } = updateProductDto;

        // Check if product exists
        const existingProduct = await this.prisma.product.findUnique({
            where: { id },
        });

        if (!existingProduct) {
            throw new NotFoundException('Product not found');
        }

        // Check if SKU is being updated and already exists
        if (sku && sku !== existingProduct.sku) {
            const skuExists = await this.prisma.product.findUnique({
                where: { sku },
            });

            if (skuExists) {
                throw new ConflictException('Product with this SKU already exists');
            }
        }

        // Verify category exists
        if (categoryId) {
            const category = await this.prisma.category.findUnique({
                where: { id: categoryId },
            });

            if (!category) {
                throw new BadRequestException('Category not found');
            }
        }

        // Generate new slug if name is being updated
        let slug = existingProduct.slug;
        if (name && name !== existingProduct.name) {
            const baseSlug = slugify(name);
            const existingProducts = await this.prisma.product.findMany({
                where: {
                    slug: {
                        startsWith: baseSlug,
                    },
                    id: {
                        not: id,
                    },
                },
                select: { slug: true },
            });
            const existingSlugs = existingProducts.map((p) => p.slug);
            slug = generateUniqueSlug(baseSlug, existingSlugs);
        }

        // Update product
        const product = await this.prisma.product.update({
            where: { id },
            data: {
                name,
                slug,
                sku,
                categoryId,
                ...rest,
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });

        return product;
    }

    async remove(id: string) {
        // Check if product exists
        const product = await this.prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        // Delete product
        await this.prisma.product.delete({
            where: { id },
        });

        return { message: 'Product deleted successfully' };
    }

    async getFeatured() {
        return this.prisma.product.findMany({
            where: {
                isFeatured: true,
                isActive: true,
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
            take: 10,
        });
    }
}
