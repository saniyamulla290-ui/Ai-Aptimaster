import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

/**
 * Middleware to handle 404 Not Found errors
 * This should be placed after all routes but before the error handler
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    const error = new AppError(
        `Route not found: ${req.method} ${req.originalUrl}`,
        404
    );
    next(error);
};

/**
 * Alternative version that returns a JSON response directly
 * Useful for API-only applications
 */
export const notFoundHandlerJson = (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.originalUrl} not found`,
            timestamp: new Date().toISOString(),
        },
    });
};

/**
 * Static file not found handler
 * For serving static files, returns a 404 with appropriate content type
 */
export const staticNotFoundHandler = (req: Request, res: Response) => {
    if (req.accepts('html')) {
        // Return HTML for browser requests
        res.status(404).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>404 Not Found - AptiMaster AI</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    h1 { color: #e74c3c; }
                    p { color: #666; }
                    a { color: #3498db; text-decoration: none; }
                </style>
            </head>
            <body>
                <h1>404 - Page Not Found</h1>
                <p>The requested URL ${req.originalUrl} was not found on this server.</p>
                <p><a href="/">Go to Homepage</a></p>
            </body>
            </html>
        `);
    } else if (req.accepts('json')) {
        // Return JSON for API requests
        res.status(404).json({
            success: false,
            error: {
                code: 'NOT_FOUND',
                message: `Resource not found: ${req.originalUrl}`,
                timestamp: new Date().toISOString(),
            },
        });
    } else {
        // Default to plain text
        res.status(404).type('txt').send(`404 Not Found: ${req.originalUrl}`);
    }
};

export default notFoundHandler;