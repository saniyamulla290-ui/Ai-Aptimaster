import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import * as practiceController from '../controllers/practice.controller';

const router = Router();

// All practice routes require authentication
router.use(authenticate);

/**
 * @route POST /api/v1/practice/start
 * @desc Start a new practice session
 * @access Private
 */
router.post('/start', practiceController.startSession);

/**
 * @route POST /api/v1/practice/:session_id/answer
 * @desc Submit an answer for a question within a session
 * @access Private
 */
router.post('/:session_id/answer', practiceController.submitAnswer);

/**
 * @route POST /api/v1/practice/:session_id/end
 * @desc Complete/end a practice session
 * @access Private
 */
router.post('/:session_id/end', practiceController.endSession);

/**
 * @route GET /api/v1/practice/:session_id/results
 * @desc Get detailed session results
 * @access Private
 */
router.get('/:session_id/results', practiceController.getSessionResults);

/**
 * @route GET /api/v1/practice/history
 * @desc Get user's session history
 * @access Private
 */
router.get('/history', practiceController.getSessionHistory);

export default router;
