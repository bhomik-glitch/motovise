import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    IsBoolean,
    IsArray,
    IsObject,
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

    @ApiProperty({ example: 'Crystal-clear audio, all day comfort', required: false })
    @IsString()
    @IsOptional()
    shortDescription?: string;

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

    @ApiProperty({ example: ['https://example.com/image1.jpg'], required: false })
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

    @ApiProperty({ example: 'Shop the best wireless headphones', required: false })
    @IsString()
    @IsOptional()
    metaDescription?: string;

    // ── Rich product detail fields ────────────────────────────────────────────────

    @ApiProperty({
        example: [{ icon: 'Wifi', title: 'Wireless', description: 'No cables needed' }],
        required: false,
        description: 'Array of feature objects: [{icon, title, description}]',
    })
    @IsOptional()
    features?: Array<{ icon?: string; title: string; description: string }>;

    @ApiProperty({
        example: { makes: ['Toyota', 'Honda'], years: { from: 2018, to: 2024 } },
        required: false,
        description: 'Compatibility info: {makes: string[], years: {from: number, to: number}}',
    })
    @IsOptional()
    compatibility?: {
        makes?: string[];
        years?: { from: number; to: number };
        note?: string;
    };

    @ApiProperty({
        example: [{ label: 'Connectivity', value: 'Bluetooth 5.0' }],
        required: false,
        description: 'Key/value specification pairs: [{label, value}]',
    })
    @IsOptional()
    specifications?: Array<{ label: string; value: string }>;

    @ApiProperty({
        example: ['1x Device', '1x USB-A Cable', '1x Quick Start Guide'],
        required: false,
        description: "What's in the box",
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    boxContents?: string[];
}
