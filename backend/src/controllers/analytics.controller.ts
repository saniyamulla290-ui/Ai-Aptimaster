import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { UserProgress } from '../models/UserProgress.model';
import User from '../models/User.model';
import { AppError } from '../middlewares/errorHandler';

/**
 * Get user analytics dashboard
 */
export const getDashboardAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        // Get user progress
        const progress = await UserProgress.findOne({ user_id: userId });
        const user = await User.findById(userId).select('name email branch streak total_points level');

        if (!progress || !user) {
            throw new AppError('User data not found', 404);
        }

        // Calculate weekly progress
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const weeklyTargets = progress.daily_targets.filter(
            target => new Date(target.date) >= oneWeekAgo
        );

        const weeklyCompleted = weeklyTargets.reduce(
            (sum, target) => sum + target.completed_questions,
            0
        );
        const weeklyTarget = weeklyTargets.reduce(
            (sum, target) => sum + target.target_questions,
            0
        );

        // Calculate weak areas
        const weakAreas = progress.weak_areas
            .sort((a, b) => a.accuracy - b.accuracy)
            .slice(0, 5)
            .map(area => ({
                topic: area.topic,
                accuracy: area.accuracy,
                improvement_score: area.improvement_score,
                total_attempts: area.total_attempts,
            }));

        // Calculate streak information
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const hasPracticedToday = progress.daily_targets.some(target => {
            const targetDate = new Date(target.date);
            targetDate.setHours(0, 0, 0, 0);
            return targetDate.getTime() === today.getTime() && target.completed_questions > 0;
        });

        const hasPracticedYesterday = progress.daily_targets.some(target => {
            const targetDate = new Date(target.date);
            targetDate.setHours(0, 0, 0, 0);
            return targetDate.getTime() === yesterday.getTime() && target.completed_questions > 0;
        });

        // Prepare response
        const analytics = {
            user: {
                name: user.name,
                email: user.email,
                branch: user.branch,
                streak: user.streak,
                total_points: user.total_points,
                level: user.level,
            },
            overview: {
                total_questions_attempted: progress.overall_stats.total_questions_attempted,
                total_correct_answers: progress.overall_stats.total_correct_answers,
                average_accuracy: progress.overall_stats.average_accuracy,
                total_time_spent: progress.overall_stats.total_time_spent,
                current_streak: progress.overall_stats.current_streak,
                longest_streak: progress.overall_stats.longest_streak,
                total_points: progress.overall_stats.total_points,
            },
            weekly_progress: {
                completed: weeklyCompleted,
                target: weeklyTarget,
                percentage: weeklyTarget > 0 ? (weeklyCompleted / weeklyTarget) * 100 : 0,
                days: weeklyTargets.map(target => ({
                    date: target.date,
                    completed: target.completed_questions,
                    target: target.target_questions,
                    streak_maintained: target.streak_maintained,
                })),
            },
            weak_areas: weakAreas,
            recommendations: [
                ...weakAreas.slice(0, 3).map(area => ({
                    type: 'weak_area' as const,
                    message: `Focus on ${area.topic} (accuracy: ${area.accuracy.toFixed(1)}%)`,
                    priority: 'high' as const,
                })),
                {
                    type: 'streak' as const,
                    message: hasPracticedToday
                        ? 'Great job! Keep your streak going tomorrow.'
                        : hasPracticedYesterday
                            ? 'Practice today to maintain your streak!'
                            : 'Start a new streak by practicing today!',
                    priority: hasPracticedToday ? 'low' : 'high' as const,
                },
                {
                    type: 'daily_target' as const,
                    message: weeklyCompleted >= weeklyTarget
                        ? 'You\'re meeting your weekly goals! Keep it up.'
                        : 'Try to increase your daily practice to meet weekly targets.',
                    priority: weeklyCompleted >= weeklyTarget ? 'low' : 'medium' as const,
                },
            ],
            leaderboard_position: null, // Would be calculated separately
            next_level_points: (user.level + 1) * 1000 - user.total_points,
        };

        res.status(200).json({
            success: true,
            data: analytics,
        });
    } catch (error) {
        throw new AppError('Failed to fetch analytics', 500, error);
    }
};

/**
 * Get performance trends over time
 */
export const getPerformanceTrends = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { period = 'week' } = req.query; // week, month, year

        const progress = await UserProgress.findOne({ user_id: userId });

        if (!progress) {
            throw new AppError('User progress not found', 404);
        }

        // Calculate date range based on period
        const endDate = new Date();
        let startDate = new Date();
        const dataPoints = 7; // Default to 7 data points

        switch (period) {
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case 'year':
                startDate.setDate(startDate.getDate() - 365);
                break;
            default:
                startDate.setDate(startDate.getDate() - 7);
        }

        // Generate trend data (simplified - in real app, would query actual practice sessions)
        const trends = {
            accuracy: Array.from({ length: dataPoints }, (_, i) => ({
                date: new Date(startDate.getTime() + (i * (endDate.getTime() - startDate.getTime()) / dataPoints)),
                value: 60 + Math.random() * 30, // Simulated data
            })),
            questions_attempted: Array.from({ length: dataPoints }, (_, i) => ({
                date: new Date(startDate.getTime() + (i * (endDate.getTime() - startDate.getTime()) / dataPoints)),
                value: Math.floor(Math.random() * 20) + 5, // Simulated data
            })),
            time_spent: Array.from({ length: dataPoints }, (_, i) => ({
                date: new Date(startDate.getTime() + (i * (endDate.getTime() - startDate.getTime()) / dataPoints)),
                value: Math.floor(Math.random() * 120) + 30, // Simulated data in minutes
            })),
        };

        res.status(200).json({
            success: true,
            data: {
                period,
                start_date: startDate,
                end_date: endDate,
                trends,
            },
        });
    } catch (error) {
        throw new AppError('Failed to fetch performance trends', 500, error);
    }
};

/**
 * Get topic-wise performance breakdown
 */
export const getTopicBreakdown = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        const progress = await UserProgress.findOne({ user_id: userId });

        if (!progress) {
            throw new AppError('User progress not found', 404);
        }

        // Convert topic_wise_stats map to array
        const topicStats = Array.from(progress.topic_wise_stats.entries()).map(([topic, stats]) => ({
            topic,
            attempts: stats.attempts,
            correct: stats.correct,
            accuracy: stats.accuracy,
            last_practiced: stats.last_practiced,
        }));

        // Sort by accuracy (ascending for weak areas)
        topicStats.sort((a, b) => a.accuracy - b.accuracy);

        // Calculate overall statistics
        const totalAttempts = topicStats.reduce((sum, stat) => sum + stat.attempts, 0);
        const totalCorrect = topicStats.reduce((sum, stat) => sum + stat.correct, 0);
        const overallAccuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

        res.status(200).json({
            success: true,
            data: {
                overall_accuracy: overallAccuracy,
                total_topics: topicStats.length,
                topics: topicStats,
                strongest_topics: topicStats.slice(-3).reverse(), // Top 3 by accuracy
                weakest_topics: topicStats.slice(0, 3), // Bottom 3 by accuracy
            },
        });
    } catch (error) {
        throw new AppError('Failed to fetch topic breakdown', 500, error);
    }
};

/**
 * Get company-wise performance
 */
export const getCompanyPerformance = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        const progress = await UserProgress.findOne({ user_id: userId });

        if (!progress) {
            throw new AppError('User progress not found', 404);
        }

        // Convert company_wise_stats map to array
        const companyStats = Array.from(progress.company_wise_stats.entries()).map(([company, stats]) => ({
            company,
            attempts: stats.attempts,
            correct: stats.correct,
            accuracy: stats.accuracy,
            last_attempted: stats.last_attempted,
        }));

        // Sort by accuracy
        companyStats.sort((a, b) => b.accuracy - a.accuracy);

        res.status(200).json({
            success: true,
            data: {
                companies: companyStats,
                total_companies: companyStats.length,
                best_performing: companyStats.slice(0, 3),
                needs_improvement: companyStats.slice(-3).reverse(),
            },
        });
    } catch (error) {
        throw new AppError('Failed to fetch company performance', 500, error);
    }
};

/**
 * Get achievement progress
 */
export const getAchievementProgress = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?.id).select('achievements total_points streak');

        if (!user) {
            throw new AppError('User not found', 404);
        }

        const achievements = [
            {
                id: 'first_login',
                name: 'First Login',
                description: 'Welcome to AptiMaster AI!',
                unlocked: user.achievements.includes('first_login'),
                progress: 100,
                target: 1,
                current: 1,
            },
            {
                id: 'streak_7',
                name: '7-Day Streak',
                description: 'Practice for 7 consecutive days',
                unlocked: user.achievements.includes('streak_7'),
                progress: Math.min(100, (user.streak / 7) * 100),
                target: 7,
                current: Math.min(user.streak, 7),
            },
            {
                id: 'streak_30',
                name: '30-Day Streak',
                description: 'Practice for 30 consecutive days',
                unlocked: user.achievements.includes('streak_30'),
                progress: Math.min(100, (user.streak / 30) * 100),
                target: 30,
                current: Math.min(user.streak, 30),
            },
            {
                id: 'accuracy_80',
                name: 'Accuracy Master',
                description: 'Achieve 80% accuracy in practice',
                unlocked: user.achievements.includes('accuracy_80'),
                progress: 0, // Would need actual accuracy data
                target: 80,
                current: 0,
            },
            {
                id: 'questions_100',
                name: 'Centurion',
                description: 'Solve 100 questions',
                unlocked: user.achievements.includes('questions_100'),
                progress: 0, // Would need actual question count
                target: 100,
                current: 0,
            },
            {
                id: 'top_10',
                name: 'Top Performer',
                description: 'Rank in top 10 on leaderboard',
                unlocked: user.achievements.includes('top_10'),
                progress: 0, // Would need leaderboard position
                target: 10,
                current: 0,
            },
        ];

        res.status(200).json({
            success: true,
            data: {
                total_achievements: achievements.length,
                unlocked_achievements: achievements.filter(a => a.unlocked).length,
                achievements,
            },
        });
    } catch (error) {
        throw new AppError('Failed to fetch achievement progress', 500, error);
    }
};
