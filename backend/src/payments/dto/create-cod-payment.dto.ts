import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCodPaymentDto {
    @ApiProperty({ example: 'order-id-here' })
    @IsString()
    @IsNotEmpty()
    orderId: string;
}
