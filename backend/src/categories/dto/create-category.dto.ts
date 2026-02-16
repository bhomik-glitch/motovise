import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsBoolean,
    IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Electronics' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Electronic devices and accessories', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'https://example.com/category-image.jpg', required: false })
    @IsString()
    @IsOptional()
    image?: string;

    @ApiProperty({ example: 'electronics-icon', required: false })
    @IsString()
    @IsOptional()
    icon?: string;

    @ApiProperty({ example: 'parent-category-id', required: false })
    @IsString()
    @IsOptional()
    parentId?: string;

    @ApiProperty({ example: true, required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({ example: 1, required: false })
    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    sortOrder?: number;

    @ApiProperty({ example: 'Best Electronics Category', required: false })
    @IsString()
    @IsOptional()
    metaTitle?: string;

    @ApiProperty({ example: 'Shop the best electronics online', required: false })
    @IsString()
    @IsOptional()
    metaDescription?: string;
}
