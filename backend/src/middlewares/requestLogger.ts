import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

// Create Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
    }));
}

/**
 * Request logging middleware
 * Logs all incoming requests with method, URL, status code, response time, and user agent
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Log request
    logger.info('Incoming request', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        timestamp: new Date().toISOString(),
    });

    // Capture response finish to log response details
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

        logger.log(logLevel, 'Request completed', {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            contentLength: res.get('content-length'),
            timestamp: new Date().toISOString(),
        });
    });

    next();
};

/**
 * Error logging utility
 */
export const logError = (error: Error, context?: string) => {
    logger.error('Error occurred', {
        error: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
    });
};

export default logger;