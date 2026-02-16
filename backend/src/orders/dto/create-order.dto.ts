import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateOrderDto {
    @ApiProperty({ example: 'address-id' })
    @IsString()
    addressId: string;

    @ApiProperty({ example: 'Please deliver before 5 PM', required: false })
    @IsString()
    @IsOptional()
    notes?: string;
}
