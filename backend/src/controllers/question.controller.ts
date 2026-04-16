import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Question } from '../models/Question.model';
import { AppError } from '../middlewares/errorHandler';

/**
 * Get questions with filtering and pagination
 */
export const getQuestions = async (req: AuthRequest, res: Response) => {
    try {
        const {
            topic,
            difficulty,
            branch,
            company,
            question_type,
            page = 1,
            limit = 20,
            search,
        } = req.query;

        const query: any = { is_active: true };

        if (topic) query.topic = topic;
        if (difficulty) query.difficulty = difficulty;
        if (branch) query.branch = branch;
        if (company) query.company_tags = company;
        if (question_type) query.question_type = question_type;
        if (search) {
            query.question_text = { $regex: search, $options: 'i' };
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [questions, total] = await Promise.all([
            Question.find(query)
                .select('-correct_answer -explanation')
                .skip(skip)
                .limit(Number(limit))
                .sort({ created_at: -1 }),
            Question.countDocuments(query),
        ]);

        res.status(200).json({
            success: true,
            data: questions,
            meta: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        throw new AppError('Failed to fetch questions', 500);
    }
};

/**
 * Get a single question by ID
 */
export const getQuestionById = async (req: AuthRequest, res: Response) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            throw new AppError('Question not found', 404);
        }

        res.status(200).json({
            success: true,
            data: question,
        });
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to fetch question', 500);
    }
};

/**
 * Get random questions for practice
 */
export const getRandomQuestions = async (req: AuthRequest, res: Response) => {
    try {
        const { topic, difficulty, branch, company, count = 10 } = req.query;

        const matchQuery: any = { is_active: true };

        if (topic) matchQuery.topic = topic;
        if (difficulty) matchQuery.difficulty = difficulty;
        if (branch) matchQuery.branch = branch;
        if (company) matchQuery.company_tags = company;

        const questions = await Question.aggregate([
            { $match: matchQuery },
            { $sample: { size: Number(count) } },
            {
                $project: {
                    correct_answer: 0,
                    explanation: 0,
                    'options.is_correct': 0,
                    'options.explanation': 0,
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: questions,
            meta: { count: questions.length },
        });
    } catch (error) {
        throw new AppError('Failed to fetch random questions', 500);
    }
};

/**
 * Get available topics
 */
export const getTopics = async (req: AuthRequest, res: Response) => {
    try {
        const { branch } = req.query;

        const matchQuery: any = { is_active: true };
        if (branch) matchQuery.branch = branch;

        const topics = await Question.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$topic',
                    count: { $sum: 1 },
                    difficulties: { $addToSet: '$difficulty' },
                },
            },
            { $sort: { count: -1 } },
        ]);

        res.status(200).json({
            success: true,
            data: topics.map((t) => ({
                topic: t._id,
                question_count: t.count,
                difficulties: t.difficulties,
            })),
        });
    } catch (error) {
        throw new AppError('Failed to fetch topics', 500);
    }
};

/**
 * Create a new question (Admin)
 */
export const createQuestion = async (req: AuthRequest, res: Response) => {
    try {
        const questionData = req.body;
        const question = new Question(questionData);
        await question.save();

        res.status(201).json({
            success: true,
            message: 'Question created successfully',
            data: question,
        });
    } catch (error) {
        throw new AppError('Failed to create question', 500);
    }
};

/**
 * Update a question (Admin)
 */
export const updateQuestion = async (req: AuthRequest, res: Response) => {
    try {
        const question = await Question.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!question) {
            throw new AppError('Question not found', 404);
        }

        res.status(200).json({
            success: true,
            message: 'Question updated successfully',
            data: question,
        });
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to update question', 500);
    }
};

/**
 * Delete a question (Admin)
 */
export const deleteQuestion = async (req: AuthRequest, res: Response) => {
    try {
        const question = await Question.findByIdAndUpdate(
            req.params.id,
            { is_active: false },
            { new: true }
        );

        if (!question) {
            throw new AppError('Question not found', 404);
        }

        res.status(200).json({
            success: true,
            message: 'Question deleted successfully',
        });
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to delete question', 500);
    }
};

/**
 * Check answer for a question
 */
export const checkAnswer = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { selected_option } = req.body;

        const question = await Question.findById(id);

        if (!question) {
            throw new AppError('Question not found', 404);
        }

        const isCorrect = question.correct_answer === selected_option;

        // Update question metadata
        question.metadata.usage_count += 1;
        if (isCorrect) {
            question.metadata.success_rate =
                ((question.metadata.success_rate * (question.metadata.usage_count - 1)) + 100) /
                question.metadata.usage_count;
        } else {
            question.metadata.success_rate =
                (question.metadata.success_rate * (question.metadata.usage_count - 1)) /
                question.metadata.usage_count;
        }
        question.metadata.last_used = new Date();
        await question.save();

        res.status(200).json({
            success: true,
            data: {
                is_correct: isCorrect,
                correct_answer: question.correct_answer,
                explanation: question.explanation,
                points: isCorrect ? question.points : 0,
            },
        });
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to check answer', 500);
    }
};
