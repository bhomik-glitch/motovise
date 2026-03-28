import {
    Controller,
    Get,
    Patch,
    Param,
    Body,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiResponse,
    ApiQuery,
    ApiParam,
    ApiBody,
} from '@nestjs/swagger';
import { ManualReviewService } from './manual-review.service';
import { ReviewActionDto } from './dto/review-action.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { RbacService } from '../rbac/rbac.service';
import { ReviewStatus } from '@prisma/client';

@ApiTags('Manual Review')
@Controller('admin/manual-review')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ManualReviewController {
    constructor(
        private readonly manualReviewService: ManualReviewService,
        private readonly rbacService: RbacService,
    ) { }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /admin/manual-review
    // ─────────────────────────────────────────────────────────────────────────
    @Get()
    @UseGuards(PermissionsGuard)
    @RequirePermissions('order.review.view')
    @ApiOperation({
        summary: 'Get manual review queue',
        description:
            'Returns paginated list of orders flagged for manual review. ' +
            'Default filter: review_status = PENDING. ' +
            'Requires permission: order.review.view (Admin, Finance, Support).',
    })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
    @ApiQuery({
        name: 'review_status',
        required: false,
        enum: ReviewStatus,
        description: 'Filter by review status. Default: PENDING.',
    })
    @ApiQuery({
        name: 'min_rule_score',
        required: false,
        type: Number,
        description: 'Minimum rule_score to include in results.',
    })
    @ApiQuery({
        name: 'pincode',
        required: false,
        type: String,
        description: 'Filter by shipping pincode.',
    })
    @ApiResponse({
        status: 200,
        description: 'Paginated manual review queue.',
        schema: {
            example: {
                data: [
                    {
                        orderId: 'clxyz...',
                        userId: 'clusr...',
                        totalAmount: '11800.00',
                        rule_score: 80,
                        review_status: 'PENDING',
                        pincode: '400001',
                        payment_method: 'COD',
                        createdAt: '2026-02-25T12:00:00.000Z',
                    },
                ],
                meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized — no valid JWT.' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden — missing order.review.view permission.',
    })
    getReviewQueue(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('review_status') review_status?: ReviewStatus,
        @Query('min_rule_score') min_rule_score?: number,
        @Query('pincode') pincode?: string,
    ) {
        return this.manualReviewService.getReviewQueue({
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 20,
            review_status,
            min_rule_score: min_rule_score ? Number(min_rule_score) : undefined,
            pincode,
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PATCH /admin/manual-review/:orderId
    // ─────────────────────────────────────────────────────────────────────────
    @Patch(':orderId')
    @UseGuards(PermissionsGuard)
    @RequirePermissions('order.review.action')
    @ApiOperation({
        summary: 'Take a review action on an order',
        description:
            'Enforces lifecycle transitions: PENDING → APPROVE/REJECT/MARK_CALLED, ' +
            'CALLED → APPROVE/REJECT. Terminal states (APPROVED/REJECTED) cannot be changed. ' +
            'REJECT is atomic: cancels order + restores stock. ' +
            'APPROVE only clears the review gate — does not change order lifecycle. ' +
            'Requires permission: order.review.action (Admin, Finance only).',
    })
    @ApiParam({ name: 'orderId', description: 'The order ID to review.' })
    @ApiBody({ type: ReviewActionDto })
    @ApiResponse({
        status: 200,
        description: 'Action applied. Returns audit-ready metadata.',
        schema: {
            example: {
                orderId: 'clxyz...',
                previous_status: 'PENDING',
                new_status: 'APPROVED',
                acted_by_user_id: 'clusr...',
                acted_by_role: 'Admin',
                timestamp: '2026-02-25T16:00:00.000Z',
            },
        },
    })
    @ApiResponse({
        status: 400,
        description:
            'Invalid transition (e.g. APPROVED → REJECT), or order is not a manual-review order.',
        schema: {
            example: {
                statusCode: 400,
                message: 'Invalid transition: APPROVED → REJECTED. Allowed from APPROVED: [none]',
                error: 'Bad Request',
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized — no valid JWT.' })
    @ApiResponse({
        status: 403,
        description: 'Forbidden — missing order.review.action permission.',
    })
    @ApiResponse({ status: 404, description: 'Order not found.' })
    async processAction(
        @Param('orderId') orderId: string,
        @Body() reviewActionDto: ReviewActionDto,
        @Request() req,
    ) {
        const actorUserId: string = req.user?.userId || req.user?.sub;
        const actorRole: string | null = await this.rbacService.getRoleName(actorUserId);

        return this.manualReviewService.processReviewAction(
            orderId,
            reviewActionDto.action,
            actorUserId,
            actorRole,
        );
    }
}
