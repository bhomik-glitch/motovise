import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post()
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('category.create')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create category (Admin only)' })
    create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoriesService.create(createCategoryDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all categories (flat list)' })
    findAll() {
        return this.categoriesService.findAll();
    }

    @Get('hierarchical')
    @ApiOperation({ summary: 'Get categories in hierarchical structure' })
    findAllHierarchical() {
        return this.categoriesService.findAllHierarchical();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get category by ID with products' })
    findOne(@Param('id') id: string) {
        return this.categoriesService.findOne(id);
    }

    @Get('slug/:slug')
    @ApiOperation({ summary: 'Get category by slug with products' })
    findBySlug(@Param('slug') slug: string) {
        return this.categoriesService.findBySlug(slug);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('category.update')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update category (Admin only)' })
    update(
        @Param('id') id: string,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ) {
        return this.categoriesService.update(id, updateCategoryDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('category.delete')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete category (Admin only)' })
    remove(@Param('id') id: string) {
        return this.categoriesService.remove(id);
    }
}
