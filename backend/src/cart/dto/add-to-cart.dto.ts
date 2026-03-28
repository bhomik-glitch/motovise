import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
    @ApiProperty({ example: 'product-id' })
    @IsString()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({ example: 1, minimum: 1 })
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    quantity: number;
}
