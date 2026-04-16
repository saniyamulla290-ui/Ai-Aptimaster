import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    details?: any;

    constructor(message: string, statusCode: number, details?: any) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.details = details;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Default error response
    let statusCode = 500;
    let message = 'Internal Server Error';
    let errors: any[] | undefined;

    // Handle AppError instances
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }

    // Handle validation errors (you can extend this for specific error types)
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        // Extract validation errors if available
        if ('errors' in err) {
            errors = Object.values((err as any).errors).map((error: any) => ({
                field: error.path,
                message: error.message,
            }));
        }
    }

    // Handle MongoDB duplicate key error
    if ((err as any).code === 11000) {
        statusCode = 409;
        message = 'Duplicate key error';
        const field = Object.keys((err as any).keyPattern)[0];
        errors = [{ field, message: `${field} already exists` }];
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', {
            message: err.message,
            stack: err.stack,
            statusCode,
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString(),
        });
    }

    // Production error response (hide sensitive info)
    const errorResponse: any = {
        success: false,
        message,
        timestamp: new Date().toISOString(),
        path: req.path,
    };

    // Include errors array if available
    if (errors && errors.length > 0) {
        errorResponse.errors = errors;
    }

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
    }

    res.status(statusCode).json(errorResponse);
};