import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductWithImagesDto } from './dto/create-product-with-images.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { slugify, generateUniqueSlug } from '../common/utils/slug.util';
import { UploadService, UploadedImage } from '../upload/upload.service';

@Injectable()
export class ProductsService {
    private readonly logger = new Logger(ProductsService.name);

    constructor(
        private prisma: PrismaService,
        private uploadService: UploadService,
    ) { }

    /**
     * Create product with images — Atomic transaction + cloud safety.
     * 
     * Flow:
     * 1. Validate + upload images to cloud
     * 2. Start Prisma transaction: create Product + ProductImage rows
     * 3. On DB failure: rollback all cloud uploads
     * 4. Cloud cleanup uses Promise.allSettled (never crashes)
     */
    async createWithImages(
        dto: CreateProductWithImagesDto,
        files: Express.Multer.File[],
    ) {
        // Step 1: Upload all images to cloud storage
        let uploadedImages: UploadedImage[] = [];
        try {
            uploadedImages = await this.uploadService.uploadFiles(files);
        } catch (error) {
            this.logger.error(`Upload failed: ${error.message}`, error.stack);
            throw new InternalServerErrorException(
                'Failed to upload images. No product was created.',
            );
        }

        // Step 2: Atomic database transaction
        try {
            const { name, price, description, stock } = dto;

            // Generate unique slug
            const baseSlug = slugify(name);
            const existingProducts = await this.prisma.product.findMany({
                where: { slug: { startsWith: baseSlug } },
                select: { slug: true },
            });
            const existingSlugs = existingProducts.map((p) => p.slug);
            const slug = generateUniqueSlug(baseSlug, existingSlugs);

            const product = await this.prisma.$transaction(async (tx) => {
                // Create product
                const newProduct = await tx.product.create({
                    data: {
                        name,
                        slug,
                        price,
                        description,
                        stock,
                    },
                });

                // Create ProductImage rows — first image is primary
                const imageCreateData = uploadedImages.map((img, index) => ({
                    url: img.url,
                    publicId: img.publicId,
                    isPrimary: index === 0,
                    productId: newProduct.id,
                }));

                await tx.productImage.createMany({
                    data: imageCreateData,
                });

                // Fetch complete product with images
                return tx.product.findUnique({
                    where: { id: newProduct.id },
                    include: {
                        category: {
                            select: { id: true, name: true, slug: true },
                        },
                        productImages: true,
                    },
                });
            });

            this.logger.log(
                `Product "${name}" created with ${uploadedImages.length} image(s)`,
            );

            return product;
        } catch (error) {
            // Step 3: Rollback cloud uploads on DB failure
            this.logger.error(
                `Database transaction failed. Rolling back ${uploadedImages.length} cloud upload(s): ${error.message}`,
            );

            await this.uploadService.deleteFiles(
                uploadedImages.map((img) => img.publicId),
            );

            throw new InternalServerErrorException(
                'Failed to create product. All uploaded images have been cleaned up.',
            );
        }
    }

    /**
     * Delete product with cloud image cleanup.
     * 
     * Flow:
     * 1. Fetch product with associated images
     * 2. Extract cloud publicIds
     * 3. Delete product from DB (cascade removes ProductImage rows)
     * 4. Delete cloud images via Promise.allSettled (never crashes)
     */
    async removeWithImages(id: string) {
        // Fetch product with images
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: { productImages: true },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const publicIds = product.productImages.map((img) => img.publicId);

        // Delete product from DB (cascade deletes ProductImage rows)
        await this.prisma.product.delete({ where: { id } });

        // Clean up cloud images (never throws)
        if (publicIds.length > 0) {
            this.logger.log(
                `Cleaning up ${publicIds.length} cloud image(s) for deleted product ${id}`,
            );
            await this.uploadService.deleteFiles(publicIds);
        }

        return { message: 'Product and associated images deleted successfully' };
    }

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

    async findOne(idOrSlug: string) {
        const product = await this.prisma.product.findFirst({
            where: {
                OR: [
                    { id: idOrSlug },
                    { slug: idOrSlug },
                ],
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
