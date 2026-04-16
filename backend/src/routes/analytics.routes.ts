import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import * as analyticsController from '../controllers/analytics.controller';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

/**
 * @route GET /api/v1/analytics/dashboard
 * @desc Get dashboard overview stats
 * @access Private
 */
router.get('/dashboard', analyticsController.getDashboardAnalytics);

/**
 * @route GET /api/v1/analytics/trends
 * @desc Get performance trends over time
 * @access Private
 */
router.get('/trends', analyticsController.getPerformanceTrends);

/**
 * @route GET /api/v1/analytics/topics
 * @desc Get topic-wise analysis
 * @access Private
 */
router.get('/topics', analyticsController.getTopicBreakdown);

/**
 * @route GET /api/v1/analytics/companies
 * @desc Get company-wise performance
 * @access Private
 */
router.get('/companies', analyticsController.getCompanyPerformance);

export default router;
