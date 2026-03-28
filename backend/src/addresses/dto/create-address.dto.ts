import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsBoolean,
} from 'class-validator';

export class CreateAddressDto {
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @ApiProperty({ example: '+91 9876543210', required: false })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({ example: '123 Main Street' })
    @IsString()
    @IsNotEmpty()
    addressLine1: string;

    @ApiProperty({ example: 'Apartment 4B', required: false })
    @IsString()
    @IsOptional()
    addressLine2?: string;

    @ApiProperty({ example: 'Mumbai' })
    @IsString()
    @IsNotEmpty()
    city: string;

    @ApiProperty({ example: 'Maharashtra' })
    @IsString()
    @IsNotEmpty()
    state: string;

    @ApiProperty({ example: '400001' })
    @IsString()
    @IsNotEmpty()
    postalCode: string;

    @ApiProperty({ example: 'India', default: 'India' })
    @IsString()
    @IsOptional()
    country?: string;

    @ApiProperty({ example: false, required: false })
    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;
}
