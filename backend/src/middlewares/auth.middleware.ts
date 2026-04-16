import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email?: string;
        [key: string]: any;
    };
}

export const authenticate = (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): void => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No token provided', 401);
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            throw new AppError('No token provided', 401);
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        // Attach user to request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            ...decoded,
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new AppError('Invalid token', 401));
        } else if (error instanceof jwt.TokenExpiredError) {
            next(new AppError('Token expired', 401));
        } else {
            next(error);
        }
    }
};

export const optionalAuthenticate = (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];

            if (token) {
                try {
                    const decoded = jwt.verify(token, JWT_SECRET) as any;
                    req.user = {
                        id: decoded.id,
                        email: decoded.email,
                        ...decoded,
                    };
                } catch (error) {
                    // Token is invalid, but we don't throw error for optional auth
                    console.warn('Optional authentication failed:', error);
                }
            }
        }

        next();
    } catch (error) {
        // Don't throw error for optional auth, just continue
        next();
    }
};

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, _res: Response, next: NextFunction): void => {
        try {
            if (!req.user) {
                throw new AppError('Authentication required', 401);
            }

            // In a real application, you would check user roles from database
            // For now, we'll assume all authenticated users have 'user' role
            // and we can add admin check later
            const userRole = 'user'; // This should come from user data

            if (roles.length && !roles.includes(userRole)) {
                throw new AppError('Insufficient permissions', 403);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

export const validateUserOwnership = (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): void => {
    try {
        if (!req.user) {
            throw new AppError('Authentication required', 401);
        }

        const userId = req.params.userId || req.body.userId;

        // Allow users to access their own data
        if (userId && userId !== req.user.id) {
            throw new AppError('Access denied to other user data', 403);
        }

        next();
    } catch (error) {
        next(error);
    }
};

// Rate limiting for authentication endpoints
import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: true,
});

export const passwordResetRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 requests per hour
    message: 'Too many password reset attempts, please try again later.',
});