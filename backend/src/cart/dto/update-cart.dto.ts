import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCartDto {
    @ApiProperty({ example: 2, minimum: 1 })
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    quantity: number;
}
