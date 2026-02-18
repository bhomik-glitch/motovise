import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import helmet from 'helmet';

async function bootstrap() {
    const isProduction = process.env.NODE_ENV === 'production';

    // ============================================
    // BOOT-TIME SECURITY VALIDATION
    // ============================================
    const jwtSecret = process.env.JWT_SECRET || '';
    if (jwtSecret.length < 64) {
        console.error(
            `❌ FATAL: JWT_SECRET must be at least 64 characters. Current length: ${jwtSecret.length}. Application will not start.`,
        );
        process.exit(1);
    }

    const refreshSecret = process.env.REFRESH_TOKEN_SECRET || '';
    if (refreshSecret.length < 64) {
        console.error(
            `❌ FATAL: REFRESH_TOKEN_SECRET must be at least 64 characters. Current length: ${refreshSecret.length}. Application will not start.`,
        );
        process.exit(1);
    }

    // ============================================
    // CREATE APP WITH PRODUCTION LOG LEVELS
    // ============================================
    const app = await NestFactory.create(AppModule, {
        logger: isProduction
            ? ['error', 'warn']
            : ['log', 'error', 'warn', 'debug', 'verbose'],
    });

    const logger = new Logger('Bootstrap');

    // ============================================
    // SECURITY MIDDLEWARE
    // ============================================

    // Helmet — security headers (disable CSP for API-only)
    app.use(helmet({ contentSecurityPolicy: false }));

    // Trust Railway / reverse-proxy for correct client IP
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.set('trust proxy', 1);

    // Global exception filter for standardized error handling
    app.useGlobalFilters(new AllExceptionsFilter());

    // Global response interceptor for standardized responses
    app.useGlobalInterceptors(new TransformInterceptor());

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // ============================================
    // CORS — Function-based origin validator
    // ============================================
    const allowedOrigins = process.env.FRONTEND_URL
        ? process.env.FRONTEND_URL.split(',').map((o) => o.trim())
        : ['http://localhost:3000'];

    app.enableCors({
        origin: (origin, callback) => {
            // Allow requests with no origin (server-to-server, curl, etc.)
            if (!origin) {
                callback(null, true);
                return;
            }
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error(`Origin ${origin} not allowed by CORS`));
            }
        },
        credentials: true,
    });

    // Global prefix
    app.setGlobalPrefix('v1');

    // ============================================
    // SWAGGER — Development only
    // ============================================
    if (!isProduction) {
        const config = new DocumentBuilder()
            .setTitle('E-commerce API')
            .setDescription('E-commerce platform REST API')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api/docs', app, document);
        logger.log('📚 Swagger loaded at /api/docs');
    }

    // ============================================
    // GRACEFUL SHUTDOWN
    // ============================================
    app.enableShutdownHooks();

    // ============================================
    // START SERVER
    // ============================================
    const port = process.env.PORT || 4000;
    await app.listen(port);
    logger.log(`🚀 Server running on port ${port} [${process.env.NODE_ENV || 'development'}]`);
}

bootstrap();
