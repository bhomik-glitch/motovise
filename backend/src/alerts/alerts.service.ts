import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';
import { MetricsService, ExecutiveMetrics } from '../metrics/metrics.service';
import { AlertType, AlertStatus, Prisma } from '@prisma/client';

@Injectable()
export class AlertsService {
    private readonly logger = new Logger(AlertsService.name);
    // Notification cooldown in milliseconds (24 hours)
    private readonly COOLDOWN_MS = 24 * 60 * 60 * 1000;

    constructor(
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService,
        private readonly metrics: MetricsService
    ) { }

    /**
     * Executes the threshold evaluation using metrics from the single source of truth.
     */
    async evaluateThresholds(): Promise<void> {
        this.logger.log('Starting alert threshold evaluation...');
        // Bypass caching for accurate real-time threshold execution
        const data = await this.metrics.getExecutiveMetrics(true);

        await Promise.all([
            this.checkRule(AlertType.OVERALL_RTO, data.rto_percentage_7d, 25.00, null),
            this.checkRule(AlertType.CHARGEBACK_RATE, data.chargeback_percentage_30d, 0.80, null),
            this.checkRule(AlertType.MANUAL_REVIEW_QUEUE, data.manual_review_pending_count, 50, null),
            ...data.top_high_risk_pincodes.map(p =>
                this.checkRule(AlertType.PINCODE_RTO, p.rtoPercentage, 40.00, p.pincode)
            )
        ]);

        this.logger.log('Alert threshold evaluation complete.');
    }

    /**
     * Evaluates a single rule:
     * If metric > threshold: Create or Remind (respecting cooldown & uniqueness).
     * If metric <= threshold: Resolve if ACTIVE exists.
     */
    private async checkRule(type: AlertType, currentValue: number, threshold: number, pincode: string | null): Promise<void> {
        // Comment 2 — Active Alert Uniqueness Enforcement Logic
        // We find the CURRENT active alert for this specific rule (type + pincode).
        const activeAlert = await this.prisma.alert.findFirst({
            where: {
                type,
                status: AlertStatus.ACTIVE,
                pincode: pincode ?? null,
            },
        });

        const isBreached = currentValue > threshold;

        if (isBreached) {
            if (!activeAlert) {
                // BREACH: Create new Alert
                await this.createAlert(type, currentValue, threshold, pincode);
            } else {
                // BREACH EXISTING: Check Cooldown
                // Comment 4 — Cooldown Enforcement Logic
                // now - lastNotifiedAt >= 24 hours
                const now = new Date();
                const lastNotified = activeAlert.lastNotifiedAt || activeAlert.firstTriggeredAt;

                if (now.getTime() - lastNotified.getTime() >= this.COOLDOWN_MS) {
                    await this.sendReminder(activeAlert.id, type, currentValue, threshold, pincode);
                }
            }
        } else {
            // NOT BREACHED: Resolve if there's an active one
            if (activeAlert) {
                await this.resolveAlert(activeAlert.id, type, currentValue, pincode);
            }
        }
    }

    private async createAlert(type: AlertType, val: number, thresh: number, pincode: string | null) {
        this.logger.warn(`Rule Breach Detected: ${type} ${pincode ? `(${pincode})` : ''} at ${val} (Threshold: ${thresh})`);

        const alert = await this.prisma.alert.create({
            data: {
                type,
                pincode,
                metricValue: val,
                thresholdValue: thresh,
                status: AlertStatus.ACTIVE,
                firstTriggeredAt: new Date(),
                lastNotifiedAt: new Date(),
                metadata: pincode ? { msg: 'Triggered from Top 10 High Risk list' } : {},
            }
        });

        await this.emailService.sendEmail({
            to: process.env.ALERT_EMAILS || 'ops@ecommerce.local',
            subject: `🚨 [CRITICAL ALERT] ${type} Breach`,
            text: `Alert Type: ${type}\nTarget: ${pincode || 'Global'}\nCurrent Value: ${val}\nThreshold: ${thresh}\nTime: ${alert.firstTriggeredAt.toISOString()}\nStatus: ACTIVE`
        });
    }

    private async sendReminder(alertId: string, type: AlertType, val: number, thresh: number, pincode: string | null) {
        this.logger.warn(`Reminder: ${type} ${pincode ? `(${pincode})` : ''} STILL breached at ${val}`);

        const now = new Date();
        await this.prisma.alert.update({
            where: { id: alertId },
            data: { metricValue: val, lastNotifiedAt: now }
        });

        await this.emailService.sendEmail({
            to: process.env.ALERT_EMAILS || 'ops@ecommerce.local',
            subject: `⚠️ [REMINDER] ${type} Still Breached`,
            text: `Alert Type: ${type}\nTarget: ${pincode || 'Global'}\nCurrent Value: ${val}\nThreshold: ${thresh}\nTime: ${now.toISOString()}\nStatus: ACTIVE (Unresolved for > 24h)`
        });
    }

    private async resolveAlert(alertId: string, type: AlertType, val: number, pincode: string | null) {
        this.logger.log(`Resolved: ${type} ${pincode ? `(${pincode})` : ''} dropped to ${val} (Safe)`);

        const now = new Date();
        await this.prisma.alert.update({
            where: { id: alertId },
            data: {
                metricValue: val,
                status: AlertStatus.RESOLVED,
                resolvedAt: now
            }
        });

        await this.emailService.sendEmail({
            to: process.env.ALERT_EMAILS || 'ops@ecommerce.local',
            subject: `✅ [RESOLVED] ${type} Normalized`,
            text: `Alert Type: ${type}\nTarget: ${pincode || 'Global'}\nCurrent Value: ${val}\nTime: ${now.toISOString()}\nStatus: RESOLVED`
        });
    }

    /**
     * Returns paginated and filtered history of alerts.
     */
    async getAlerts(query: {
        status?: AlertStatus;
        type?: AlertType;
        pincode?: string;
        page?: number;
        limit?: number;
    }) {
        const { status, type, pincode, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.AlertWhereInput = {};
        if (status) where.status = status;
        if (type) where.type = type;
        if (pincode) where.pincode = { contains: pincode };

        const [alerts, total] = await Promise.all([
            this.prisma.alert.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.alert.count({ where }),
        ]);

        return {
            alerts,
            total,
            page,
            pages: Math.ceil(total / limit),
        };
    }
}
