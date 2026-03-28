import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ReviewAction {
    APPROVE = 'APPROVE',
    REJECT = 'REJECT',
    MARK_CALLED = 'MARK_CALLED',
}

export class ReviewActionDto {
    @ApiProperty({
        enum: ReviewAction,
        description: 'The manual review decision to apply to the order.',
        example: ReviewAction.APPROVE,
    })
    @IsEnum(ReviewAction, {
        message: `action must be one of: ${Object.values(ReviewAction).join(', ')}`,
    })
    @IsNotEmpty()
    action: ReviewAction;
}
