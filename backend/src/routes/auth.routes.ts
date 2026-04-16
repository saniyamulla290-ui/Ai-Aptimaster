import { Router } from 'express';
import { body } from 'express-validator';
import {
    register,
    login,
    refreshToken,
    logout,
    getCurrentUser,
    updateProfile,
    changePassword,
} from '../controllers/auth.controller';
import {
    authenticate,
    authRateLimiter,
    passwordResetRateLimiter,
} from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

// Validation schemas
const registerValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('branch')
        .notEmpty()
        .withMessage('Branch is required')
        .isIn(['Mechanical', 'Civil', 'Electrical', 'Electronics', 'IT'])
        .withMessage('Invalid branch selected'),
];

const loginValidation = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

const changePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .notEmpty()
        .withMessage('New password is required')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

const updateProfileValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('branch')
        .optional()
        .isIn(['Mechanical', 'Civil', 'Electrical', 'Electronics', 'IT'])
        .withMessage('Invalid branch selected'),
    body('profile_picture')
        .optional()
        .isURL()
        .withMessage('Profile picture must be a valid URL'),
    body('settings.daily_target')
        .optional()
        .isInt({ min: 5, max: 100 })
        .withMessage('Daily target must be between 5 and 100 questions'),
    body('settings.theme')
        .optional()
        .isIn(['light', 'dark', 'system'])
        .withMessage('Theme must be light, dark, or system'),
];

// Public routes
router.post(
    '/register',
    authRateLimiter,
    registerValidation,
    validateRequest,
    register
);

router.post(
    '/login',
    authRateLimiter,
    loginValidation,
    validateRequest,
    login
);

router.post(
    '/refresh-token',
    refreshToken
);

// Protected routes (require authentication)
router.post(
    '/logout',
    authenticate,
    logout
);

router.get(
    '/me',
    authenticate,
    getCurrentUser
);

router.put(
    '/profile',
    authenticate,
    updateProfileValidation,
    validateRequest,
    updateProfile
);

router.post(
    '/change-password',
    authenticate,
    passwordResetRateLimiter,
    changePasswordValidation,
    validateRequest,
    changePassword
);

// Password reset routes (to be implemented)
router.post(
    '/forgot-password',
    passwordResetRateLimiter,
    [
        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Please provide a valid email address')
            .normalizeEmail(),
    ],
    validateRequest,
    (req, res) => {
        // TODO: Implement password reset logic
        res.status(200).json({
            success: true,
            message: 'Password reset email sent (not implemented yet)',
        });
    }
);

router.post(
    '/reset-password/:token',
    passwordResetRateLimiter,
    [
        body('newPassword')
            .notEmpty()
            .withMessage('New password is required')
            .isLength({ min: 8 })
            .withMessage('New password must be at least 8 characters')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
    ],
    validateRequest,
    (req, res) => {
        // TODO: Implement password reset logic
        res.status(200).json({
            success: true,
            message: 'Password reset successful (not implemented yet)',
        });
    }
);

export default router;