import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import * as companyController from '../controllers/company.controller';

const router = Router();

/**
 * @route GET /api/v1/companies
 * @desc Get all companies with filtering
 * @access Private
 */
router.get('/', authenticate, companyController.getCompanies);

/**
 * @route GET /api/v1/companies/hiring
 * @desc Get active hiring updates
 * @access Private
 */
router.get('/hiring', authenticate, companyController.getHiringUpdates);

/**
 * @route GET /api/v1/companies/:id
 * @desc Get a single company by ID
 * @access Private
 */
router.get('/:id', authenticate, companyController.getCompanyById);

/**
 * @route GET /api/v1/companies/:id/patterns
 * @desc Get company question patterns
 * @access Private
 */
router.get('/:id/patterns', authenticate, companyController.getQuestionPatterns);

/**
 * @route POST /api/v1/companies
 * @desc Create a company (Admin)
 * @access Private (Admin)
 */
router.post('/', authenticate, companyController.createCompany);

/**
 * @route PUT /api/v1/companies/:id
 * @desc Update a company (Admin)
 * @access Private (Admin)
 */
router.put('/:id', authenticate, companyController.updateCompany);

export default router;
