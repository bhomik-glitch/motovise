import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

export class RevenueQueryDto {
    @ApiProperty({
        example: '2024-01-01',
        description: 'Start date (YYYY-MM-DD)',
    })
    @IsDateString()
    @IsNotEmpty()
    from: string;

    @ApiProperty({
        example: '2024-01-31',
        description: 'End date (YYYY-MM-DD)',
    })
    @IsDateString()
    @IsNotEmpty()
    to: string;

    validate() {
        const fromDate = new Date(this.from);
        const toDate = new Date(this.to);

        if (fromDate > toDate) {
            throw new BadRequestException('from date must be before or equal to to date');
        }

        const daysDiff =
            (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > 365) {
            throw new BadRequestException('Date range cannot exceed 365 days');
        }
    }
}
