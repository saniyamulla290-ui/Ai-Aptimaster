import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from './errorHandler';

export const validateRequest = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.type === 'field' ? error.path : error.type,
            message: error.msg,
            value: error.type === 'field' ? (error as any).value : undefined,
        }));

        throw new AppError('Validation failed', 400, errorMessages);
    }

    next();
};

// Custom validation middleware for MongoDB ObjectId
export const validateObjectId = (paramName: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const id = req.params[paramName] || req.body[paramName];

        if (!id) {
            return next(new AppError(`${paramName} is required`, 400));
        }

        // Check if it's a valid MongoDB ObjectId (24 hex characters)
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;

        if (!objectIdRegex.test(id)) {
            return next(new AppError(`Invalid ${paramName} format`, 400));
        }

        next();
    };
};

// Validation for pagination parameters
export const validatePagination = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = parseInt(req.query.skip as string) || 0;

    // Validate page
    if (page < 1) {
        throw new AppError('Page must be greater than 0', 400);
    }

    // Validate limit (between 1 and 100)
    if (limit < 1 || limit > 100) {
        throw new AppError('Limit must be between 1 and 100', 400);
    }

    // Validate skip
    if (skip < 0) {
        throw new AppError('Skip must be greater than or equal to 0', 400);
    }

    // Attach validated pagination to request
    (req as any).pagination = {
        page,
        limit,
        skip: skip || (page - 1) * limit,
    };

    next();
};

// Validation for sorting parameters
export const validateSorting = (allowedFields: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const sortBy = (req.query.sortBy as string) || 'created_at';
        const sortOrder = (req.query.sortOrder as string) || 'desc';

        // Validate sortBy field
        if (!allowedFields.includes(sortBy)) {
            throw new AppError(
                `Invalid sort field. Allowed fields: ${allowedFields.join(', ')}`,
                400
            );
        }

        // Validate sortOrder
        if (!['asc', 'desc'].includes(sortOrder.toLowerCase())) {
            throw new AppError('Sort order must be either "asc" or "desc"', 400);
        }

        // Attach validated sorting to request
        (req as any).sorting = {
            sortBy,
            sortOrder: sortOrder.toLowerCase() as 'asc' | 'desc',
        };

        next();
    };
};

// Validation for date range
export const validateDateRange = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime())) {
            throw new AppError('Invalid start date format', 400);
        }

        if (isNaN(end.getTime())) {
            throw new AppError('Invalid end date format', 400);
        }

        if (start > end) {
            throw new AppError('Start date must be before end date', 400);
        }

        // Limit date range to 1 year
        const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
        if (end.getTime() - start.getTime() > oneYearInMs) {
            throw new AppError('Date range cannot exceed 1 year', 400);
        }

        (req as any).dateRange = { start, end };
    } else if (startDate || endDate) {
        throw new AppError('Both startDate and endDate are required', 400);
    }

    next();
};

// Validation for file uploads
export const validateFileUpload = (
    fieldName: string,
    allowedMimeTypes: string[],
    maxSizeInMB: number
) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const file = (req as any).file || (req as any).files?.[fieldName];

        if (!file) {
            return next(new AppError(`No file uploaded for ${fieldName}`, 400));
        }

        // Check file type
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new AppError(
                `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
                400
            );
        }

        // Check file size (convert MB to bytes)
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
        if (file.size > maxSizeInBytes) {
            throw new AppError(
                `File size exceeds limit of ${maxSizeInMB}MB`,
                400
            );
        }

        next();
    };
};