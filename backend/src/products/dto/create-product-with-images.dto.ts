import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for creating a product with image uploads via multipart/form-data.
 * Fields are received as strings from form-data and transformed to proper types.
 */
export class CreateProductWithImagesDto {
    @ApiProperty({ example: 'Wireless Headphones' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 2999.99 })
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    price: number;

    @ApiProperty({
        example: 'High-quality wireless headphones with noise cancellation',
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 50 })
    @IsNumber()
    @Type(() => Number)
    @Min(0)
    stock: number;
}
