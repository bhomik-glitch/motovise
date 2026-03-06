import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateConfigDto } from './dto/update-config.dto';

@Injectable()
export class AdminConfigService {
    private readonly logger = new Logger(AdminConfigService.name);
    private readonly CONFIG_ID = 'singleton';

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Gets the single canonical configuration record.
     * Auto-initializes if it does not exist.
     */
    async getConfig() {
        let config = await this.prisma.systemConfig.findUnique({
            where: { id: this.CONFIG_ID }
        });

        if (!config) {
            this.logger.log('SystemConfig not found, auto-initializing default configuration.');
            config = await this.prisma.systemConfig.create({
                data: {
                    id: this.CONFIG_ID,
                    codThreshold: 0,
                    fraudThreshold: 60,
                    alertThreshold: 10,
                    enforcementMode: 'DISABLE'
                }
            });
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
                    ...(dto.codThreshold !== undefined && { codThreshold: dto.codThreshold }),
                    ...(dto.fraudThreshold !== undefined && { fraudThreshold: dto.fraudThreshold }),
                    ...(dto.alertThreshold !== undefined && { alertThreshold: dto.alertThreshold }),
                    ...(dto.enforcementMode !== undefined && { enforcementMode: dto.enforcementMode }),
                }
            });
            this.logger.log('System configuration updated successfully.');
            return updated;
        });
    }
}
