import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentMethod {
    RAZORPAY = 'RAZORPAY',
    COD = 'COD',
}

export class CreatePaymentDto {
    @ApiProperty({
        description: 'Order ID to initiate payment for',
        example: 'clx123456789',
    })
    @IsString()
    orderId: string;

    @ApiProperty({
        description: 'Payment method',
        enum: PaymentMethod,
        example: PaymentMethod.RAZORPAY,
    })
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;
}
