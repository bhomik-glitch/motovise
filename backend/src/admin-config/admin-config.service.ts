import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateConfigDto } from './dto/update-config.dto';

@Injectable()
export class AdminConfigService {
    private readonly logger = new Logger(AdminConfigService.name);
    private readonly CONFIG_ID = 'DEFAULT_CONFIG';

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Gets the single canonical configuration record.
     */
    async getConfig() {
        const config = await this.prisma.systemConfig.findFirst({
            where: { id: this.CONFIG_ID }
        });

        if (!config) {
            this.logger.error('System configuration not found in database.');
            throw new NotFoundException('System configuration not initialized');
        }

        return config;
    }

    /**
     * Updates the single canonical configuration record transactionally.
     */
    async updateConfig(dto: UpdateConfigDto) {
        // Ensure config is initialized
        await this.getConfig();

        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.systemConfig.update({
                where: { id: this.CONFIG_ID },
                data: {
                    ...(dto.maxLoginAttempts !== undefined && { maxLoginAttempts: dto.maxLoginAttempts }),
                    ...(dto.fraudRiskThreshold !== undefined && { fraudRiskThreshold: dto.fraudRiskThreshold }),
                    ...(dto.enableEmailVerification !== undefined && { enableEmailVerification: dto.enableEmailVerification }),
                }
            });
            this.logger.log('System configuration updated successfully.');
            return updated;
        });
    }
}
