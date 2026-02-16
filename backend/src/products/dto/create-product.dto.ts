import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    IsBoolean,
    IsArray,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
    @ApiProperty({ example: 'Wireless Headphones' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'High-quality wireless headphones with noise cancellation', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 2999.99 })
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    price: number;

    @ApiProperty({ example: 3999.99, required: false })
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    @IsOptional()
    compareAtPrice?: number;

    @ApiProperty({ example: 'WH-1000XM4', required: false })
    @IsString()
    @IsOptional()
    sku?: string;

    @ApiProperty({ example: 50 })
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    stock: number;

    @ApiProperty({ example: 10, required: false })
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    @IsOptional()
    lowStockAlert?: number;

    @ApiProperty({ example: 'category-id', required: false })
    @IsString()
    @IsOptional()
    categoryId?: string;

    @ApiProperty({ example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'], required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    images?: string[];

    @ApiProperty({ example: 'https://example.com/thumbnail.jpg', required: false })
    @IsString()
    @IsOptional()
    thumbnail?: string;

    @ApiProperty({ example: true, required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({ example: false, required: false })
    @IsBoolean()
    @IsOptional()
    isFeatured?: boolean;

    @ApiProperty({ example: 'Best Wireless Headphones 2024', required: false })
    @IsString()
    @IsOptional()
    metaTitle?: string;

    @ApiProperty({ example: 'Shop the best wireless headphones with noise cancellation', required: false })
    @IsString()
    @IsOptional()
    metaDescription?: string;
}
