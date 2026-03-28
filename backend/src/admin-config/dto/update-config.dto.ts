import { IsNumber, Min, Max, IsBoolean, IsOptional } from 'class-validator';

export class UpdateConfigDto {
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(10)
    maxLoginAttempts?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    fraudRiskThreshold?: number;

    @IsOptional()
    @IsBoolean()
    enableEmailVerification?: boolean;
}
