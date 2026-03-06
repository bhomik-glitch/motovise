import { IsOptional, IsInt, Min, Max, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum OrderStatusFilter {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    REFUNDED = 'REFUNDED',
}

export enum PaymentMethodFilter {
    RAZORPAY = 'RAZORPAY',
    COD = 'COD',
}

export enum RiskLevelFilter {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
}

export class ListOrdersDto {
    @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @ApiPropertyOptional({ description: 'Items per page', default: 20, minimum: 1, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit: number = 20;

    @ApiPropertyOptional({ enum: OrderStatusFilter })
    @IsOptional()
    @IsEnum(OrderStatusFilter)
    status?: OrderStatusFilter;

    @ApiPropertyOptional({ enum: PaymentMethodFilter })
    @IsOptional()
    @IsEnum(PaymentMethodFilter)
    paymentMethod?: PaymentMethodFilter;

    @ApiPropertyOptional({ enum: RiskLevelFilter, description: 'Risk level (maps to rule_score ranges: LOW ≤30, MEDIUM ≤60, HIGH >60)' })
    @IsOptional()
    @IsEnum(RiskLevelFilter)
    riskLevel?: RiskLevelFilter;

    @ApiPropertyOptional({ description: 'Search by order number or customer name (case-insensitive)' })
    @IsOptional()
    @IsString()
    search?: string;
}
