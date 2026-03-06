import {
    Catch,
    ArgumentsHost,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;


        // Extract detailed error message
        let message: string | string[] = 'Internal server error';

        if (exception instanceof HttpException) {
            const response = exception.getResponse();

            // Handle validation errors (array of messages)
            if (typeof response === 'object' && response !== null && 'message' in response) {
                const msg = (response as any).message;
                if (typeof msg === 'string' || Array.isArray(msg)) {
                    message = msg;
                } else {
                    message = exception.message;
                }
            } else if (typeof response === 'string') {
                message = response;
            } else {
                message = exception.message;
            }
        }

        // Log error with details (Skip logging for common noisy 404s like favicon.ico)
        if (request.url !== '/favicon.ico') {
            this.logger.error({
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
                method: request.method,
                message: message as unknown,
                stack: exception instanceof Error ? exception.stack : undefined,
            });
        }

        // Standardized error response
        response.status(status).json({
            success: false,
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
