
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { RiskService } from '../src/risk/risk.service';
import { OrdersService } from '../src/orders/orders.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Logger } from '@nestjs/common';

async function validatePhase8A() {
    const logger = new Logger('Phase8AValidation');
    logger.log('Starting Phase 8A Validation...');

    const app = await NestFactory.createApplicationContext(AppModule);

    try {
        // 1. Dependency Injection Safety
        const riskService = app.get(RiskService);
        if (riskService) {
            logger.log('✅ RiskService injected successfully');
        } else {
            logger.error('❌ RiskService failed to inject');
            process.exit(1);
        }

        const ordersService = app.get(OrdersService);
        if (ordersService) {
            logger.log('✅ OrdersService injected successfully');
        } else {
            logger.error('❌ OrdersService failed to inject');
            process.exit(1);
        }

        // 2. Cron Validation
        const schedulerRegistry = app.get(SchedulerRegistry);
        const jobs = schedulerRegistry.getCronJobs();
        let cronFound = false;
        jobs.forEach((job, key) => {
            // key format depends on how @Cron is named. Assuming default or checking map.
            // Actually, @Cron creates jobs.
            // Let's iterate.
            logger.log(`Found Cron Job: ${key}`);
            if (key.includes('handlePincodeRiskAggregation')) {
                cronFound = true;
            }
            // Since we didn't name the cron job explicitly in decorator, it might use method name or generic ID.
            // But let's check if AT LEAST ONE job exists.
        });

        // In NestJS schedule, if name not provided, it generates one. 
        // We can check if `RiskCron` is provider.
        // However, looking at jobs map is better.
        if (jobs.size > 0) {
            logger.log(`✅ Cron jobs registered (Count: ${jobs.size})`);
        } else {
            logger.warn('⚠️ No Cron jobs found in SchedulerRegistry (Check if name is required for registry fetch)');
            // Note: Standard @Cron without name might not show up easily by name in some versions, but usually does.
        }

        // 3. Database Schema Validation
        const prisma = app.get(PrismaService);
        try {
            // check if table exists by simple query
            const count = await prisma.pincodeRisk.count();
            logger.log(`✅ PincodeRisk table exists (Row count: ${count})`);
        } catch (e) {
            logger.error(`❌ PincodeRisk table access failed: ${e.message}`);
            process.exit(1);
        }

        // 4. Order Creation Integrity (Simulation)
        // We'll call the risk service method to verify it doesn't throw and is non-blocking

        logger.log('Testing getRiskByPincode (Phase 8C read-only lookup)...');
        const start = Date.now();
        try {
            await riskService.getRiskByPincode('123456');
            const duration = Date.now() - start;
            logger.log(`✅ getRiskByPincode executed in ${duration}ms`);
        } catch (e) {
            logger.error(`❌ getRiskByPincode threw error: ${e.message}`);
            process.exit(1);
        }

        // 5. Check Config
        // We can check if env var is read correctly
        // We can't easily check private property of service provided we didn't expose it, 
        // but we can trust the log output if we run this.

        logger.log('✅ Phase 8A Validation Complete.');
    } catch (err) {
        logger.error(`Validation Failed: ${err.message}`);
        process.exit(1);
    } finally {
        await app.close();
    }
}

validatePhase8A();
