import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';
import { AppError } from '../middlewares/errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-change-in-production';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

// Generate JWT token
const generateToken = (userId: string): string => {
    return jwt.sign({ id: userId }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN as any,
    });
};

// Generate refresh token
const generateRefreshToken = (userId: string): string => {
    return jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN as any,
    });
};

// Verify JWT token
const verifyToken = (token: string): any => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new AppError('Invalid or expired token', 401);
    }
};

// Verify refresh token
const verifyRefreshToken = (token: string): any => {
    try {
        return jwt.verify(token, REFRESH_TOKEN_SECRET);
    } catch (error) {
        throw new AppError('Invalid or expired refresh token', 401);
    }
};

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { name, email, password, branch } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError('User with this email already exists', 409);
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
            branch,
            profile_picture: req.body.profile_picture || '',
        });

        await user.save();

        // Generate tokens
        const accessToken = generateToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());

        // Update last login
        user.last_login = new Date();
        await user.save();

        // Set refresh token as HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    branch: user.branch,
                    profile_picture: user.profile_picture,
                    streak: user.streak,
                    total_points: user.total_points,
                    level: user.level,
                    settings: user.settings,
                    created_at: user.created_at,
                },
                tokens: {
                    accessToken,
                    expiresIn: JWT_EXPIRES_IN,
                },
            },
            message: 'User registered successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            throw new AppError('Invalid email or password', 401);
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new AppError('Invalid email or password', 401);
        }

        // Generate tokens
        const accessToken = generateToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());

        // Update last login
        user.last_login = new Date();
        await user.save();

        // Set refresh token as HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    branch: user.branch,
                    profile_picture: user.profile_picture,
                    streak: user.streak,
                    total_points: user.total_points,
                    level: user.level,
                    settings: user.settings,
                    last_login: user.last_login,
                },
                tokens: {
                    accessToken,
                    expiresIn: JWT_EXPIRES_IN,
                },
            },
            message: 'Login successful',
        });
    } catch (error) {
        next(error);
    }
};

export const refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!refreshToken) {
            throw new AppError('Refresh token is required', 400);
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Find user
        const user = await User.findById(decoded.id);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Generate new access token
        const newAccessToken = generateToken(user._id.toString());

        res.status(200).json({
            success: true,
            data: {
                accessToken: newAccessToken,
                expiresIn: JWT_EXPIRES_IN,
            },
            message: 'Token refreshed successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Clear refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const getCurrentUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // User ID should be attached by auth middleware
        const userId = (req as any).user?.id;

        if (!userId) {
            throw new AppError('User not authenticated', 401);
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    branch: user.branch,
                    profile_picture: user.profile_picture,
                    streak: user.streak,
                    total_points: user.total_points,
                    level: user.level,
                    achievements: user.achievements,
                    settings: user.settings,
                    last_login: user.last_login,
                    created_at: user.created_at,
                },
            },
            message: 'User profile retrieved successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const updates = req.body;

        if (!userId) {
            throw new AppError('User not authenticated', 401);
        }

        // Remove fields that shouldn't be updated directly
        delete updates.password;
        delete updates.email;
        delete updates._id;
        delete updates.created_at;
        delete updates.updated_at;

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    branch: user.branch,
                    profile_picture: user.profile_picture,
                    streak: user.streak,
                    total_points: user.total_points,
                    level: user.level,
                    settings: user.settings,
                },
            },
            message: 'Profile updated successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const { currentPassword, newPassword } = req.body;

        if (!userId) {
            throw new AppError('User not authenticated', 401);
        }

        // Find user with password
        const user = await User.findById(userId).select('+password');
        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            throw new AppError('Current password is incorrect', 401);
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        next(error);
    }
};

// Export token utilities for use in other modules
export { generateToken, verifyToken };