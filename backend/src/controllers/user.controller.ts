import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import User from '../models/User.model';
import { UserProgress } from '../models/UserProgress.model';
import { AppError } from '../middlewares/errorHandler';
import bcrypt from 'bcryptjs';

/**
 * Get current user profile
 */
export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?.id).select('-password');

        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        throw new AppError('Failed to fetch profile', 500, error);
    }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { name, branch, profile_picture, settings } = req.body;
        const userId = req.user?.id;

        const updateData: any = {};
        if (name) updateData.name = name;
        if (branch) updateData.branch = branch;
        if (profile_picture) updateData.profile_picture = profile_picture;
        if (settings) updateData.settings = { ...req.user?.settings, ...settings };

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user,
        });
    } catch (error) {
        throw new AppError('Failed to update profile', 500, error);
    }
};

/**
 * Get user progress and statistics
 */
export const getProgress = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        // Get user progress
        const progress = await UserProgress.findOne({ user_id: userId })
            .populate('user_id', 'name email branch');

        if (!progress) {
            // Create initial progress record if not exists
            const newProgress = new UserProgress({
                user_id: userId,
                overall_stats: {
                    total_questions_attempted: 0,
                    total_correct_answers: 0,
                    average_accuracy: 0,
                    total_time_spent: 0,
                    current_streak: 0,
                    longest_streak: 0,
                    total_points: 0,
                },
            });
            await newProgress.save();

            return res.status(200).json({
                success: true,
                data: newProgress,
            });
        }

        res.status(200).json({
            success: true,
            data: progress,
        });
    } catch (error) {
        throw new AppError('Failed to fetch progress', 500, error);
    }
};

/**
 * Get leaderboard
 */
export const getLeaderboard = async (req: AuthRequest, res: Response) => {
    try {
        const { branch, limit = 10, page = 1 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        // Build query
        const query: any = {};
        if (branch) {
            query.branch = branch;
        }

        // Get users with their progress
        const users = await User.find(query)
            .select('name branch profile_picture streak total_points level')
            .sort({ total_points: -1, streak: -1 })
            .skip(skip)
            .limit(Number(limit));

        // Get total count for pagination
        const total = await User.countDocuments(query);

        // Add ranks
        const usersWithRank = users.map((user, index) => ({
            rank: skip + index + 1,
            ...user.toObject(),
        }));

        // Get current user's rank
        const currentUser = await User.findById(req.user?.id);
        let currentUserRank = null;

        if (currentUser) {
            const usersAbove = await User.countDocuments({
                total_points: { $gt: currentUser.total_points },
                ...(branch ? { branch } : {}),
            });
            currentUserRank = usersAbove + 1;
        }

        res.status(200).json({
            success: true,
            data: {
                leaderboard: usersWithRank,
                currentUserRank,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit)),
                },
            },
        });
    } catch (error) {
        throw new AppError('Failed to fetch leaderboard', 500, error);
    }
};

/**
 * Get user achievements
 */
export const getAchievements = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?.id).select('achievements');

        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Define all possible achievements
        const allAchievements = [
            { id: 'first_login', name: 'First Login', description: 'Welcome to AptiMaster AI!' },
            { id: 'streak_7', name: '7-Day Streak', description: 'Practice for 7 consecutive days' },
            { id: 'streak_30', name: '30-Day Streak', description: 'Practice for 30 consecutive days' },
            { id: 'accuracy_80', name: 'Accuracy Master', description: 'Achieve 80% accuracy in practice' },
            { id: 'questions_100', name: 'Centurion', description: 'Solve 100 questions' },
            { id: 'questions_500', name: 'Master Solver', description: 'Solve 500 questions' },
            { id: 'top_10', name: 'Top Performer', description: 'Rank in top 10 on leaderboard' },
            { id: 'all_branches', name: 'Versatile Learner', description: 'Practice questions from all branches' },
        ];

        // Mark which achievements user has unlocked
        const achievements = allAchievements.map(achievement => ({
            ...achievement,
            unlocked: user.achievements.includes(achievement.id),
            unlockedAt: user.achievements.includes(achievement.id) ? new Date() : null,
        }));

        res.status(200).json({
            success: true,
            data: achievements,
        });
    } catch (error) {
        throw new AppError('Failed to fetch achievements', 500, error);
    }
};

/**
 * Change user password
 */
export const changePassword = async (req: AuthRequest, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user?.id;

        const user = await User.findById(userId);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new AppError('Current password is incorrect', 400);
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to change password', 500, error);
    }
};

/**
 * Delete user account
 */
export const deleteAccount = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        // Delete user and associated progress
        await Promise.all([
            User.findByIdAndDelete(userId),
            UserProgress.findOneAndDelete({ user_id: userId }),
        ]);

        res.status(200).json({
            success: true,
            message: 'Account deleted successfully',
        });
    } catch (error) {
        throw new AppError('Failed to delete account', 500, error);
    }
};

/**
 * Get today's target status
 */
export const getDailyTarget = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const progress = await UserProgress.findOne({ user_id: userId });

        if (!progress) {
            return res.status(200).json({
                success: true,
                data: {
                    target_questions: 10, // Default target
                    completed_questions: 0,
                    streak_maintained: false,
                    points_earned: 0,
                    date: today,
                    is_completed: false,
                    progress_percentage: 0,
                },
            });
        }

        // Find today's target
        const todayTarget = progress.daily_targets.find(target => {
            const targetDate = new Date(target.date);
            targetDate.setHours(0, 0, 0, 0);
            return targetDate.getTime() === today.getTime();
        });

        const defaultTarget = {
            target_questions: 10,
            completed_questions: 0,
            streak_maintained: false,
            points_earned: 0,
            date: today,
            is_completed: false,
            progress_percentage: 0,
        };

        if (!todayTarget) {
            return res.status(200).json({
                success: true,
                data: defaultTarget,
            });
        }

        const targetData = {
            ...(todayTarget as any).toObject(),
            is_completed: todayTarget.completed_questions >= todayTarget.target_questions,
            progress_percentage: Math.min(
                100,
                (todayTarget.completed_questions / todayTarget.target_questions) * 100
            ),
        };

        res.status(200).json({
            success: true,
            data: targetData,
        });
    } catch (error) {
        throw new AppError('Failed to fetch daily target', 500, error);
    }
};

/**
 * Set or update daily target
 */
export const setDailyTarget = async (req: AuthRequest, res: Response) => {
    try {
        const { target_questions } = req.body;
        const userId = req.user?.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let progress = await UserProgress.findOne({ user_id: userId });

        if (!progress) {
            progress = new UserProgress({
                user_id: userId,
                daily_targets: [],
            });
        }

        // Find today's target
        const todayIndex = progress.daily_targets.findIndex(target => {
            const targetDate = new Date(target.date);
            targetDate.setHours(0, 0, 0, 0);
            return targetDate.getTime() === today.getTime();
        });

        if (todayIndex >= 0) {
            // Update existing target
            progress.daily_targets[todayIndex].target_questions = target_questions;
        } else {
            // Add new target
            progress.daily_targets.push({
                date: today,
                target_questions,
                completed_questions: 0,
                streak_maintained: false,
                points_earned: 0,
            });
        }

        await progress.save();

        res.status(200).json({
            success: true,
            message: 'Daily target updated successfully',
            data: {
                target_questions,
                date: today,
            },
        });
    } catch (error) {
        throw new AppError('Failed to set daily target', 500, error);
    }
};