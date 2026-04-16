import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest';
import * as userController from '../controllers/user.controller';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route GET /api/v1/users/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', userController.getProfile);

/**
 * @route PUT /api/v1/users/profile
 * @desc Update user profile
 * @access Private
 */
router.put(
    '/profile',
    [
        body('name').optional().isString().trim().isLength({ min: 2, max: 50 }),
        body('branch').optional().isString().trim().isIn(['Mechanical', 'Civil', 'Electrical', 'Electronics', 'IT', 'Computer Science']),
        body('profile_picture').optional().isURL(),
        body('settings.notifications').optional().isBoolean(),
        body('settings.daily_target').optional().isInt({ min: 1, max: 50 }),
        body('settings.theme').optional().isString(),
    ],
    validateRequest,
    userController.updateProfile
);

/**
 * @route GET /api/v1/users/progress
 * @desc Get user progress and statistics
 * @access Private
 */
router.get('/progress', userController.getProgress);

/**
 * @route GET /api/v1/users/leaderboard
 * @desc Get leaderboard (global or branch-specific)
 * @access Private
 */
router.get(
    '/leaderboard',
    [
        body('branch').optional().isString(),
        body('limit').optional().isInt({ min: 1, max: 100 }).default(10),
        body('page').optional().isInt({ min: 1 }).default(1),
    ],
    validateRequest,
    userController.getLeaderboard
);

/**
 * @route GET /api/v1/users/achievements
 * @desc Get user achievements
 * @access Private
 */
router.get('/achievements', userController.getAchievements);

/**
 * @route POST /api/v1/users/change-password
 * @desc Change user password
 * @access Private
 */
router.post(
    '/change-password',
    [
        body('currentPassword').isString().notEmpty(),
        body('newPassword').isString().isLength({ min: 6 }),
        body('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
    ],
    validateRequest,
    userController.changePassword
);

/**
 * @route DELETE /api/v1/users/account
 * @desc Delete user account
 * @access Private
 */
router.delete('/account', userController.deleteAccount);

/**
 * @route GET /api/v1/users/daily-target
 * @desc Get today's target status
 * @access Private
 */
router.get('/daily-target', userController.getDailyTarget);

/**
 * @route POST /api/v1/users/daily-target
 * @desc Set or update daily target
 * @access Private
 */
router.post(
    '/daily-target',
    [
        body('target_questions').isInt({ min: 1, max: 50 }),
    ],
    validateRequest,
    userController.setDailyTarget
);

export default router;