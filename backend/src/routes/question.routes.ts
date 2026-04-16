import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest';
import * as questionController from '../controllers/question.controller';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route GET /api/v1/questions
 * @desc Get questions with filters
 * @access Private
 */
router.get(
    '/',
    [
        query('topic').optional().isString(),
        query('difficulty').optional().isIn(['easy', 'medium', 'hard']),
        query('branch').optional().isString(),
        query('company').optional().isString(),
        query('limit').optional().isInt({ min: 1, max: 50 }).default(10),
        query('page').optional().isInt({ min: 1 }).default(1),
        query('random').optional().isBoolean(),
    ],
    validateRequest,
    questionController.getQuestions
);

/**
 * @route GET /api/v1/questions/:id
 * @desc Get single question by ID
 * @access Private
 */
router.get('/:id', questionController.getQuestionById);

/**
 * @route POST /api/v1/questions
 * @desc Create a new question (admin only)
 * @access Private (Admin)
 */
router.post(
    '/',
    [
        body('question_text').isString().notEmpty(),
        body('question_type').isIn(['multiple_choice', 'true_false', 'fill_in_blank', 'coding']),
        body('options').isArray().optional(),
        body('correct_answer').notEmpty(),
        body('explanation').isString().notEmpty(),
        body('difficulty').isIn(['easy', 'medium', 'hard']),
        body('topic').isString().notEmpty(),
        body('branch').isArray(),
        body('company_tags').isArray().optional(),
        body('time_limit').isInt({ min: 30, max: 300 }).optional(),
        body('points').isInt({ min: 1, max: 100 }).optional(),
    ],
    validateRequest,
    questionController.createQuestion
);

/**
 * @route POST /api/v1/questions/generate
 * @desc Generate AI-powered questions
 * @access Private
 */
router.post(
    '/generate',
    [
        body('topic').isString().notEmpty(),
        body('difficulty').isIn(['easy', 'medium', 'hard']),
        body('count').isInt({ min: 1, max: 20 }).default(5),
        body('branch').isString().optional(),
        body('company').isString().optional(),
    ],
    validateRequest,
    questionController.getRandomQuestions
);

/**
 * @route POST /api/v1/questions/:id/submit
 * @desc Submit answer for a question
 * @access Private
 */
router.post(
    '/:id/submit',
    [
        body('answer').notEmpty(),
        body('time_taken').isInt({ min: 0 }).optional(),
    ],
    validateRequest,
    questionController.checkAnswer
);

/**
 * @route GET /api/v1/questions/topics
 * @desc Get all available topics
 * @access Private
 */
router.get('/topics/all', questionController.getTopics);

/**
 * @route GET /api/v1/questions/topics/stats
 * @desc Get user's topic-wise statistics
 * @access Private
 */
router.get('/topics/stats', questionController.getTopics); // Using getTopics as placeholder

/**
 * @route GET /api/v1/questions/weak-areas
 * @desc Get user's weak areas based on performance
 * @access Private
 */
router.get('/weak-areas', questionController.getTopics); // Using getTopics as placeholder

/**
 * @route POST /api/v1/questions/practice-set
 * @desc Get personalized practice set
 * @access Private
 */
router.post(
    '/practice-set',
    [
        body('topics').isArray().optional(),
        body('difficulty').isIn(['easy', 'medium', 'hard', 'mixed']).optional(),
        body('count').isInt({ min: 1, max: 30 }).default(10),
        body('focus_weak_areas').isBoolean().optional(),
    ],
    validateRequest,
    questionController.getRandomQuestions
);

export default router;
