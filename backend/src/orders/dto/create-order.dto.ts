import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateOrderDto {
    @ApiProperty({ example: 'address-id' })
    @IsString()
    addressId: string;

    @ApiProperty({ example: 'Please deliver before 5 PM', required: false })
    @IsString()
    @IsOptional()
    notes?: string;

    @ApiProperty({
        example: 'COD',
        enum: ['COD', 'PREPAID', 'UPI'],
        required: false,
        description: 'Payment method. Defaults to COD when omitted.',
    })
    @IsString()
    @IsOptional()
    @IsIn(['COD', 'PREPAID', 'UPI'])
    paymentMethod?: string;
}
