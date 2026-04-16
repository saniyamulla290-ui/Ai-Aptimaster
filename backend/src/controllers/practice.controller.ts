import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { PracticeSession } from '../models/PracticeSession.model';
import { Question } from '../models/Question.model';
import { UserProgress } from '../models/UserProgress.model';
import User from '../models/User.model';
import { AppError } from '../middlewares/errorHandler';

/**
 * Start a new practice session
 */
export const startSession = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const {
            session_type = 'practice',
            topic,
            sub_topic,
            company_id,
            branch,
            difficulty = 'mixed',
            question_count = 10,
            time_limit = 1800,
        } = req.body;

        // Build query to fetch questions
        const matchQuery: any = { is_active: true };
        if (topic) matchQuery.topic = topic;
        if (difficulty !== 'mixed') matchQuery.difficulty = difficulty;
        if (branch) matchQuery.branch = branch;
        if (company_id) matchQuery.company_tags = company_id;

        // Get random questions
        const questions = await Question.aggregate([
            { $match: matchQuery },
            { $sample: { size: Number(question_count) } },
        ]);

        if (questions.length === 0) {
            throw new AppError('No questions found matching the criteria', 404);
        }

        // Create practice session
        const session = new PracticeSession({
            user_id: userId,
            session_type,
            topic,
            sub_topic,
            company_id,
            branch,
            difficulty,
            questions: questions.map((q) => q._id),
            total_questions: questions.length,
            time_limit,
            status: 'in_progress',
            started_at: new Date(),
        });

        await session.save();

        // Return session with questions (without answers)
        const sanitizedQuestions = questions.map((q) => ({
            _id: q._id,
            question_text: q.question_text,
            question_type: q.question_type,
            options: q.options.map((opt: any) => ({
                id: opt.id,
                text: opt.text,
            })),
            difficulty: q.difficulty,
            topic: q.topic,
            time_limit: q.time_limit,
            points: q.points,
        }));

        res.status(201).json({
            success: true,
            message: 'Practice session started',
            data: {
                session_id: session._id,
                session_type: session.session_type,
                total_questions: session.total_questions,
                time_limit: session.time_limit,
                questions: sanitizedQuestions,
                started_at: session.started_at,
            },
        });
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to start practice session', 500);
    }
};

/**
 * Submit an answer for a question within a session
 */
export const submitAnswer = async (req: AuthRequest, res: Response) => {
    try {
        const { session_id } = req.params;
        const { question_id, selected_option, time_taken = 0 } = req.body;
        const userId = req.user?.id;

        const session = await PracticeSession.findOne({
            _id: session_id,
            user_id: userId,
            status: 'in_progress',
        });

        if (!session) {
            throw new AppError('Active session not found', 404);
        }

        // Check if question belongs to this session
        if (!session.questions.some((q) => q.toString() === question_id)) {
            throw new AppError('Question not in this session', 400);
        }

        // Check if already answered
        const existingAnswer = session.answers.find(
            (a) => a.question_id.toString() === question_id
        );
        if (existingAnswer) {
            throw new AppError('Question already answered', 400);
        }

        // Get question and check answer
        const question = await Question.findById(question_id);
        if (!question) {
            throw new AppError('Question not found', 404);
        }

        const isCorrect = question.correct_answer === selected_option;

        // Add answer to session
        session.answers.push({
            question_id,
            selected_option,
            is_correct: isCorrect,
            time_taken,
            marked_for_review: false,
        });

        session.attempted_questions = session.answers.length;
        session.correct_answers = session.answers.filter((a) => a.is_correct).length;
        session.wrong_answers = session.answers.filter((a) => !a.is_correct).length;
        session.total_time += time_taken;

        await session.save();

        res.status(200).json({
            success: true,
            data: {
                is_correct: isCorrect,
                correct_answer: question.correct_answer,
                explanation: question.explanation,
                points: isCorrect ? question.points : 0,
                session_progress: {
                    attempted: session.attempted_questions,
                    total: session.total_questions,
                    correct: session.correct_answers,
                    wrong: session.wrong_answers,
                },
            },
        });
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to submit answer', 500);
    }
};

/**
 * Complete/end a practice session
 */
export const endSession = async (req: AuthRequest, res: Response) => {
    try {
        const { session_id } = req.params;
        const userId = req.user?.id;

        const session = await PracticeSession.findOne({
            _id: session_id,
            user_id: userId,
            status: 'in_progress',
        });

        if (!session) {
            throw new AppError('Active session not found', 404);
        }

        // Mark session as completed
        session.status = 'completed';
        session.completed_at = new Date();
        session.score = session.total_questions > 0
            ? Math.round((session.correct_answers / session.total_questions) * 100)
            : 0;

        await session.save();

        // Update user progress
        await updateUserProgress(userId!, session);

        // Update user points
        await User.findByIdAndUpdate(userId, {
            $inc: {
                total_points: session.points_earned,
            },
        });

        res.status(200).json({
            success: true,
            message: 'Session completed',
            data: {
                session_id: session._id,
                score: session.score,
                accuracy: session.accuracy,
                total_questions: session.total_questions,
                attempted: session.attempted_questions,
                correct: session.correct_answers,
                wrong: session.wrong_answers,
                skipped: session.skipped_questions,
                time_taken: session.total_time,
                points_earned: session.points_earned,
                completed_at: session.completed_at,
            },
        });
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to end session', 500);
    }
};

/**
 * Get session results (detailed)
 */
export const getSessionResults = async (req: AuthRequest, res: Response) => {
    try {
        const { session_id } = req.params;
        const userId = req.user?.id;

        const session = await PracticeSession.findOne({
            _id: session_id,
            user_id: userId,
        }).populate('questions', 'question_text options correct_answer explanation topic difficulty points');

        if (!session) {
            throw new AppError('Session not found', 404);
        }

        res.status(200).json({
            success: true,
            data: session,
        });
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to fetch session results', 500);
    }
};

/**
 * Get user's session history
 */
export const getSessionHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { page = 1, limit = 10, status } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const query: any = { user_id: userId };
        if (status) query.status = status;

        const [sessions, total] = await Promise.all([
            PracticeSession.find(query)
                .select('session_type topic difficulty score accuracy total_questions attempted_questions correct_answers total_time points_earned status started_at completed_at')
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(Number(limit)),
            PracticeSession.countDocuments(query),
        ]);

        res.status(200).json({
            success: true,
            data: sessions,
            meta: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        throw new AppError('Failed to fetch session history', 500);
    }
};

/**
 * Helper: Update user progress after completing a session
 */
async function updateUserProgress(userId: string, session: any) {
    let progress = await UserProgress.findOne({ user_id: userId });

    if (!progress) {
        progress = new UserProgress({
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
    }

    // Update overall stats
    progress.overall_stats.total_questions_attempted += session.attempted_questions;
    progress.overall_stats.total_correct_answers += session.correct_answers;
    progress.overall_stats.total_time_spent += Math.round(session.total_time / 60); // convert to minutes
    progress.overall_stats.total_points += session.points_earned;

    // Update topic-wise stats
    if (session.topic) {
        const topicStats = progress.topic_wise_stats.get(session.topic) || {
            attempts: 0,
            correct: 0,
            accuracy: 0,
            last_practiced: new Date(),
        };

        topicStats.attempts += session.attempted_questions;
        topicStats.correct += session.correct_answers;
        topicStats.accuracy = topicStats.attempts > 0
            ? (topicStats.correct / topicStats.attempts) * 100
            : 0;
        topicStats.last_practiced = new Date();

        progress.topic_wise_stats.set(session.topic, topicStats);
    }

    // Update daily target
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayIndex = progress.daily_targets.findIndex((target) => {
        const targetDate = new Date(target.date);
        targetDate.setHours(0, 0, 0, 0);
        return targetDate.getTime() === today.getTime();
    });

    if (todayIndex >= 0) {
        progress.daily_targets[todayIndex].completed_questions += session.attempted_questions;
        progress.daily_targets[todayIndex].points_earned += session.points_earned;

        if (progress.daily_targets[todayIndex].completed_questions >= progress.daily_targets[todayIndex].target_questions) {
            progress.daily_targets[todayIndex].streak_maintained = true;
        }
    } else {
        progress.daily_targets.push({
            date: today,
            target_questions: 10,
            completed_questions: session.attempted_questions,
            streak_maintained: session.attempted_questions >= 10,
            points_earned: session.points_earned,
        });
    }

    await progress.save();
}
