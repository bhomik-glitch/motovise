import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { slugify, generateUniqueSlug } from '../common/utils/slug.util';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async create(createCategoryDto: CreateCategoryDto) {
        const { name, parentId, ...rest } = createCategoryDto;

        // Verify parent category exists if provided
        if (parentId) {
            const parentCategory = await this.prisma.category.findUnique({
                where: { id: parentId },
            });

            if (!parentCategory) {
                throw new BadRequestException('Parent category not found');
            }
        }

        // Generate unique slug
        const baseSlug = slugify(name);
        const existingCategories = await this.prisma.category.findMany({
            where: {
                slug: {
                    startsWith: baseSlug,
                },
            },
            select: { slug: true },
        });
        const existingSlugs = existingCategories.map((c) => c.slug);
        const slug = generateUniqueSlug(baseSlug, existingSlugs);

        // Create category
        const category = await this.prisma.category.create({
            data: {
                name,
                slug,
                parentId,
                ...rest,
            },
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                children: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });

        return category;
    }

    async findAll() {
        return this.prisma.category.findMany({
            where: {
                isActive: true,
            },
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                children: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
            orderBy: {
                sortOrder: 'asc',
            },
        });
    }

    async findAllHierarchical() {
        // Get all root categories (no parent)
        const rootCategories = await this.prisma.category.findMany({
            where: {
                parentId: null,
                isActive: true,
            },
            include: {
                children: {
                    where: {
                        isActive: true,
                    },
                    include: {
                        children: {
                            where: {
                                isActive: true,
                            },
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                image: true,
                                sortOrder: true,
                            },
                            orderBy: {
                                sortOrder: 'asc',
                            },
                        },
                        _count: {
                            select: {
                                products: true,
                            },
                        },
                    },
                    orderBy: {
                        sortOrder: 'asc',
                    },
                },
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
            orderBy: {
                sortOrder: 'asc',
            },
        });

        return rootCategories;
    }

    async findOne(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                children: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        image: true,
                    },
                },
                products: {
                    where: {
                        isActive: true,
                    },
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        price: true,
                        thumbnail: true,
                        isFeatured: true,
                    },
                    take: 10,
                },
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    async findBySlug(slug: string) {
        const category = await this.prisma.category.findUnique({
            where: { slug },
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                children: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        image: true,
                    },
                },
                products: {
                    where: {
                        isActive: true,
                    },
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        price: true,
                        thumbnail: true,
                        isFeatured: true,
                    },
                    take: 10,
                },
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto) {
        const { name, parentId, ...rest } = updateCategoryDto;

        // Check if category exists
        const existingCategory = await this.prisma.category.findUnique({
            where: { id },
        });

        if (!existingCategory) {
            throw new NotFoundException('Category not found');
        }

        // Prevent circular reference (category can't be its own parent)
        if (parentId === id) {
            throw new BadRequestException('Category cannot be its own parent');
        }

        // Verify parent category exists if provided
        if (parentId) {
            const parentCategory = await this.prisma.category.findUnique({
                where: { id: parentId },
            });

            if (!parentCategory) {
                throw new BadRequestException('Parent category not found');
            }

            // Check if parent is a child of current category (prevent circular reference)
            const isCircular = await this.checkCircularReference(id, parentId);
            if (isCircular) {
                throw new BadRequestException(
                    'Cannot set parent: would create circular reference',
                );
            }
        }

        // Generate new slug if name is being updated
        let slug = existingCategory.slug;
        if (name && name !== existingCategory.name) {
            const baseSlug = slugify(name);
            const existingCategories = await this.prisma.category.findMany({
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
            const existingSlugs = existingCategories.map((c) => c.slug);
            slug = generateUniqueSlug(baseSlug, existingSlugs);
        }

        // Update category
        const category = await this.prisma.category.update({
            where: { id },
            data: {
                name,
                slug,
                parentId,
                ...rest,
            },
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                children: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });

        return category;
    }

    async remove(id: string) {
        // Check if category exists
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                children: true,
                products: true,
            },
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        // Check if category has children
        if (category.children.length > 0) {
            throw new BadRequestException(
                'Cannot delete category with subcategories. Delete or reassign subcategories first.',
            );
        }

        // Check if category has products
        if (category.products.length > 0) {
            throw new BadRequestException(
                'Cannot delete category with products. Delete or reassign products first.',
            );
        }

        // Delete category
        await this.prisma.category.delete({
            where: { id },
        });

        return { message: 'Category deleted successfully' };
    }

    // Helper method to check circular reference
    private async checkCircularReference(
        categoryId: string,
        parentId: string,
    ): Promise<boolean> {
        let currentParentId = parentId;

        while (currentParentId) {
            if (currentParentId === categoryId) {
                return true; // Circular reference detected
            }

            const parent = await this.prisma.category.findUnique({
                where: { id: currentParentId },
                select: { parentId: true },
            });

            currentParentId = parent?.parentId || null;
        }

        return false;
    }
}
