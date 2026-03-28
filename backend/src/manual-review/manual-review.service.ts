import {
    Injectable,
    Logger,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewAction } from './dto/review-action.dto';
import { ReviewStatus, OrderStatus } from '@prisma/client';
import { RedisService } from '../redis/redis.service';

// ---------------------------------------------------------------------------
// Allowed lifecycle transitions for review_status
// ---------------------------------------------------------------------------
const ALLOWED_TRANSITIONS: Record<ReviewStatus, ReviewStatus[]> = {
    PENDING: [ReviewStatus.APPROVED, ReviewStatus.REJECTED, ReviewStatus.CALLED],
    CALLED: [ReviewStatus.APPROVED, ReviewStatus.REJECTED],
    APPROVED: [],   // Terminal — no further transitions
    REJECTED: [],   // Terminal — no further transitions
};

// Map action string → target ReviewStatus
const ACTION_TO_STATUS: Record<ReviewAction, ReviewStatus> = {
    [ReviewAction.APPROVE]: ReviewStatus.APPROVED,
    [ReviewAction.REJECT]: ReviewStatus.REJECTED,
    [ReviewAction.MARK_CALLED]: ReviewStatus.CALLED,
};

// ---------------------------------------------------------------------------
// Query shape
// ---------------------------------------------------------------------------
export interface ReviewQueueQuery {
    page?: number;
    limit?: number;
    review_status?: ReviewStatus;
    min_rule_score?: number;
    pincode?: string;
}

@Injectable()
export class ManualReviewService {
    private readonly logger = new Logger(ManualReviewService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
    ) { }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /admin/manual-review
    // ─────────────────────────────────────────────────────────────────────────
    async getReviewQueue(query: ReviewQueueQuery) {
        const {
            page = 1,
            limit = 20,
            review_status = ReviewStatus.PENDING,
            min_rule_score,
            pincode,
        } = query;

        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {
            is_manual_review: true,
            review_status,
        };

        if (min_rule_score !== undefined) {
            where.rule_score = { gte: min_rule_score };
        }

        if (pincode) {
            where.shippingPincode = pincode;
        }

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                select: {
                    id: true,
                    userId: true,
                    total: true,
                    rule_score: true,
                    review_status: true,
                    shippingPincode: true,
                    paymentMethod: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.order.count({ where }),
        ]);

        return {
            data: orders.map((o) => ({
                orderId: o.id,
                userId: o.userId,
                totalAmount: o.total,
                rule_score: o.rule_score,
                review_status: o.review_status,
                pincode: o.shippingPincode,
                payment_method: o.paymentMethod,
                createdAt: o.createdAt,
            })),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PATCH /admin/manual-review/:orderId
    // ─────────────────────────────────────────────────────────────────────────
    async processReviewAction(
        orderId: string,
        action: ReviewAction,
        actorUserId: string,
        actorRole: string | null,
    ) {
        // 1. Load the order
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            select: {
                id: true,
                is_manual_review: true,
                review_status: true,
                orderStatus: true,
                items: {
                    select: {
                        productId: true,
                        quantity: true,
                    },
                },
            },
        });

        if (!order) {
            throw new NotFoundException(`Order ${orderId} not found`);
        }

        // 2. Must be a manual-review order
        if (!order.is_manual_review) {
            throw new BadRequestException(
                `Order ${orderId} is not flagged for manual review`,
            );
        }

        // 3. Must have a review_status set (sanity guard)
        if (!order.review_status) {
            throw new BadRequestException(
                `Order ${orderId} has no review_status — data integrity issue`,
            );
        }

        const previousStatus = order.review_status;
        const targetStatus = ACTION_TO_STATUS[action];

        // 4. Lifecycle transition validation
        const allowedTargets = ALLOWED_TRANSITIONS[previousStatus];
        if (!allowedTargets.includes(targetStatus)) {
            throw new BadRequestException(
                `Invalid transition: ${previousStatus} → ${targetStatus}. ` +
                `Allowed from ${previousStatus}: [${allowedTargets.join(', ') || 'none'}]`,
            );
        }

        // 5. Execute the action
        const timestamp = new Date();

        if (action === ReviewAction.REJECT) {
            // ── REJECT: atomic transaction ──────────────────────────────────
            // Phase 8E strictly:
            //   - review_status = REJECTED
            //   - orderStatus   = CANCELLED
            //   - Restore stock for all items
            // Does NOT: refund, notify, modify fraud score, payment attempts
            await this.prisma.$transaction(async (tx) => {
                // Update order
                await tx.order.update({
                    where: { id: orderId },
                    data: {
                        review_status: ReviewStatus.REJECTED,
                        orderStatus: OrderStatus.CANCELLED,
                    },
                });

                // Restore stock for each item
                for (const item of order.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } },
                    });
                }

                this.logger.log(
                    `[Phase8E][REJECT] Order ${orderId} cancelled, stock restored for ` +
                    `${order.items.length} item(s). Actor: ${actorUserId} (${actorRole})`,
                );
            });
        } else if (action === ReviewAction.APPROVE) {
            // ── APPROVE: only clears the manual-review gate ─────────────────
            // Does NOT change orderStatus, trigger fulfillment, payment, or shipping
            await this.prisma.order.update({
                where: { id: orderId },
                data: { review_status: ReviewStatus.APPROVED },
            });

            this.logger.log(
                `[ManualReview] Order ${orderId} resolved -> ${action} by user ${actorUserId} (${actorRole || 'SYSTEM'})`,
            );

            // Cache Invalidation
            await this.redis.del('dashboard:mtd');
        } else {
            // ── MARK_CALLED: only updates review_status ──────────────────────
            // Does NOT change order state
            await this.prisma.order.update({
                where: { id: orderId },
                data: { review_status: ReviewStatus.CALLED },
            });

            this.logger.log(
                `[Phase8E][MARK_CALLED] Order ${orderId} marked as CALLED. ` +
                `Actor: ${actorUserId} (${actorRole})`,
            );
        }

        // 6. Return audit-ready metadata (prepares for Phase 10 audit log)
        return {
            orderId,
            previous_status: previousStatus,
            new_status: targetStatus,
            acted_by_user_id: actorUserId,
            acted_by_role: actorRole,
            timestamp,
        };
    }
}
