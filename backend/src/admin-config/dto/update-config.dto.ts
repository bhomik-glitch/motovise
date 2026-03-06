import { IsNumber, Min, Max, IsEnum, IsOptional } from 'class-validator';
import { EnforcementMode } from '@prisma/client';

export class UpdateConfigDto {
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    codThreshold?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    fraudThreshold?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    alertThreshold?: number;

    @IsOptional()
    @IsEnum(EnforcementMode)
    enforcementMode?: EnforcementMode;
}
