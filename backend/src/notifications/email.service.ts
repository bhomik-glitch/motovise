import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface SendEmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter: nodemailer.Transporter | null = null;
    private readonly isMockMode: boolean;

    constructor() {
        const host = process.env.SMTP_HOST;
        const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        if (!host || !user || !pass) {
            this.logger.warn('SMTP configuration missing (SMTP_HOST, SMTP_USER, SMTP_PASS). Emails will be MOCKED natively securely.');
            this.isMockMode = true;
        } else {
            this.isMockMode = false;
            this.transporter = nodemailer.createTransport({
                host,
                port,
                secure: port === 465,
                auth: { user, pass },
            });
            this.logger.log(`SMTP configured for ${host}:${port}`);
        }
    }

    /**
     * Sends an email or logs a robust mock structure if SMTP is unavailable.
     * 
     * Architecture Comment 6 implementation:
     * - If SMTP is present -> send real email.
     * - If SMTP is missing -> log mock output instead of crashing (dev/CI friendly).
     */
    async sendEmail(options: SendEmailOptions): Promise<void> {
        if (this.isMockMode) {
            this.logger.log(`[MOCK EMAIL SENT]`);
            this.logger.log(`  To:      ${options.to}`);
            this.logger.log(`  Subject: ${options.subject}`);
            this.logger.log(`  Body:    \n${options.text || '<html>...</html>'}`);
            return;
        }

        try {
            await this.transporter!.sendMail({
                from: process.env.SMTP_FROM || '"E-Commerce Alerts" <alerts@ecommerce.local>',
                ...options,
            });
            this.logger.log(`Email dispatched successfully to ${options.to}`);
        } catch (error) {
            this.logger.error(`Failed to send email to ${options.to}`, error);
            // Optionally rethrow if you want upstream features to halt on mail failure,
            // but for alerting crons we usually swallow local network issues to let the cron finish cleanly.
        }
    }
}
