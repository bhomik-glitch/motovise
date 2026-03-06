import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AlertStatus, AlertType } from '@prisma/client';

export class GetAlertsDto {
    @IsOptional()
    @IsEnum(AlertStatus)
    status?: AlertStatus;

    @IsOptional()
    @IsEnum(AlertType)
    type?: AlertType;

    @IsOptional()
    @IsString()
    pincode?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 20;
}
