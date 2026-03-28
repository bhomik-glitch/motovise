import { Injectable, Logger } from '@nestjs/common';
import { Prisma, RiskLevel, ReviewStatus } from '@prisma/client';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface FraudContext {
    /** User whose order is being created */
    userId: string;
    /** Total monetary value of the order (subtotal + tax, i.e. order `total`) */
    orderTotal: number;
    /** Shipping pincode from the selected address */
    pincode: string;
    /**
     * Number of payment attempts for this order attempt.
     * At order-creation time this is always 0 (first attempt).
     * The field is incremented externally on retries.
     */
    paymentAttempts: number;
    /** Sum of quantities across all cart items */
    totalQuantity: number;
}

export interface FraudScoreResult {
    rule_score: number;
    is_manual_review: boolean;
    /** Non-null only when `is_manual_review = true` */
    review_status: ReviewStatus | null;
    /** Structured breakdown for audit logging */
    breakdown: {
        firstTimeBuyer: boolean;
        highValue: boolean;
        highRiskPincode: boolean;
        paymentAttemptsHigh: boolean;
        highQuantity: boolean;
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Scoring constants  (easily extended for future rules)
// ─────────────────────────────────────────────────────────────────────────────

const SCORE_FIRST_TIME_BUYER = 15;
const SCORE_HIGH_VALUE = 20;          // order total > 8000
const SCORE_HIGH_RISK_PINCODE = 30;
const SCORE_PAYMENT_ATTEMPTS = 20;    // payment_attempts >= 3
const SCORE_HIGH_QUANTITY = 15;       // total quantity >= 3
const MANUAL_REVIEW_THRESHOLD = 60;   // strictly greater than — 60 is NOT flagged

// ─────────────────────────────────────────────────────────────────────────────
// FraudService
// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class FraudService {
    private readonly logger = new Logger(FraudService.name);

    /**
     * Calculates the fraud rule score for an order being created.
     *
     * MUST be called with the active transaction client (`tx`) so that:
     *  - All DB reads use the same snapshot as the surrounding order transaction
     *  - Any error triggers a full transaction rollback (atomicity)
     *  - No dirty reads or cross-transaction leakage can occur
     *
     * @param tx  Active Prisma transaction client
     * @param ctx Order context required for scoring
     */
    async calculateFraudScore(
        tx: Prisma.TransactionClient,
        ctx: FraudContext,
    ): Promise<FraudScoreResult> {
        const { userId, orderTotal, pincode, paymentAttempts, totalQuantity } = ctx;

        // ── Rule 1: First-time buyer ──────────────────────────────────────────
        // Count non-cancelled orders INSIDE the transaction.
        // Excludes CANCELLED to avoid misclassifying buyers who tried and cancelled.
        const previousOrderCount = await tx.order.count({
            where: {
                userId,
                orderStatus: { not: 'CANCELLED' },
            },
        });
        const firstTimeBuyer = previousOrderCount === 0;

        // ── Rule 2: High order value ──────────────────────────────────────────
        const highValue = orderTotal > 8000;

        // ── Rule 3: High-risk pincode (DB-driven, no hardcoded list) ──────────
        const riskRecord = await tx.pincodeRisk.findUnique({
            where: { pincode: pincode.trim() },
        });
        const highRiskPincode =
            riskRecord !== null && riskRecord.riskLevel === RiskLevel.HIGH;

        // ── Rule 4: Payment retries ───────────────────────────────────────────
        // Uses ctx.paymentAttempts — does NOT query an existing order row.
        // At creation time this is 0; incremented externally on retries.
        const paymentAttemptsHigh = paymentAttempts >= 3;

        // ── Rule 5: High quantity ─────────────────────────────────────────────
        const highQuantity = totalQuantity >= 3;

        // ── Aggregate score ───────────────────────────────────────────────────
        let rule_score = 0;
        if (firstTimeBuyer) rule_score += SCORE_FIRST_TIME_BUYER;
        if (highValue) rule_score += SCORE_HIGH_VALUE;
        if (highRiskPincode) rule_score += SCORE_HIGH_RISK_PINCODE;
        if (paymentAttemptsHigh) rule_score += SCORE_PAYMENT_ATTEMPTS;
        if (highQuantity) rule_score += SCORE_HIGH_QUANTITY;

        // ── Threshold — STRICT greater-than (60 is NOT flagged) ──────────────
        const is_manual_review = rule_score > MANUAL_REVIEW_THRESHOLD;

        // ── review_status: only set when flagged (no default enum leakage) ────
        const review_status: ReviewStatus | null = is_manual_review
            ? ReviewStatus.PENDING
            : null;

        // ── Structured audit-ready log ────────────────────────────────────────
        const breakdown = {
            firstTimeBuyer,
            highValue,
            highRiskPincode,
            paymentAttemptsHigh,
            highQuantity,
        };

        this.logger.debug(
            `[Phase8D] Fraud score computed`,
            JSON.stringify({
                userId,
                rule_score,
                is_manual_review,
                breakdown,
            }),
        );

        if (is_manual_review) {
            this.logger.warn(
                `[Phase8D] Order flagged for manual review — userId=${userId} rule_score=${rule_score}`,
            );
        }

        return { rule_score, is_manual_review, review_status, breakdown };
    }
}
