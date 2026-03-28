import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    private readonly logger = new Logger(HealthController.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly redisService: RedisService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Health check' })
    @ApiResponse({ status: 200, description: 'Service is healthy' })
    async check() {
        const health = {
            database: 'down',
            redis: 'down',
        };

        // Check Database
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            health.database = 'ok';
        } catch (error) {
            this.logger.error(`Database health check failed: ${error.message}`);
        }

        // Check Redis
        try {
            // isHealthy() relies on connection event listeners initialized in RedisService
            if (this.redisService.isHealthy()) {
                health.redis = 'ok';
            }
        } catch (error) {
            this.logger.error(`Redis health check failed: ${error.message}`);
        }

        return health;
    }
}
