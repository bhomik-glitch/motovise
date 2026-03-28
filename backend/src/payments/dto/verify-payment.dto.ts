import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPaymentDto {
    @ApiProperty({
        description: 'Order ID',
        example: 'clx123456789',
    })
    @IsString()
    orderId: string;

    @ApiProperty({
        description: 'Gateway payment ID',
        example: 'pay_123456789',
    })
    @IsString()
    paymentId: string;

    @ApiProperty({
        description: 'Payment signature for verification',
        example: 'valid_signature',
    })
    @IsString()
    signature: string;
}
