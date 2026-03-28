import {
    Controller,
    Post,
    Delete,
    Param,
    Body,
    UseGuards,
    UseInterceptors,
    UploadedFiles,
    Logger,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiConsumes,
    ApiBody,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductWithImagesDto } from './dto/create-product-with-images.dto';
import { FileValidationPipe } from '../upload/pipes/file-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

@ApiTags('Admin Products')
@Controller('admin/products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AdminProductsController {
    private readonly logger = new Logger(AdminProductsController.name);

    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @ApiOperation({ summary: 'Create product with images (Admin only)' })
    @RequirePermissions('product.create')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['name', 'price', 'stock', 'images'],
            properties: {
                name: { type: 'string', example: 'Wireless Headphones' },
                price: { type: 'number', example: 2999.99 },
                description: { type: 'string', example: 'High-quality headphones' },
                stock: { type: 'number', example: 50 },
                images: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                    description: 'Product images (1-8 files, max 5MB each, JPEG/PNG/WebP)',
                },
            },
        },
    })
    @UseInterceptors(
        FilesInterceptor('images', 8, {
            limits: { fileSize: 5 * 1024 * 1024 },
        }),
    )
    async createWithImages(
        @Body() dto: CreateProductWithImagesDto,
        @UploadedFiles(new FileValidationPipe()) files: Express.Multer.File[],
    ) {
        this.logger.log(`Creating product "${dto.name}" with ${files.length} image(s)`);
        return this.productsService.createWithImages(dto, files);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete product with cloud image cleanup (Admin only)' })
    @RequirePermissions('product.delete')
    async removeWithImages(@Param('id') id: string) {
        this.logger.log(`Deleting product ${id} with image cleanup`);
        return this.productsService.removeWithImages(id);
    }
}
