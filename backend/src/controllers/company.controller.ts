import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Company } from '../models/Company.model';
import { AppError } from '../middlewares/errorHandler';

/**
 * Get all companies (with filtering)
 */
export const getCompanies = async (req: AuthRequest, res: Response) => {
    try {
        const { branch, industry, search, featured, page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const query: any = {};
        if (branch) query['eligibility.branches'] = { $in: [branch, 'All'] };
        if (industry) query.industry = industry;
        if (featured === 'true') query.is_featured = true;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { industry: { $regex: search, $options: 'i' } },
            ];
        }

        const [companies, total] = await Promise.all([
            Company.find(query)
                .select('name logo_url description industry average_package eligibility popularity_score is_featured metadata')
                .sort({ popularity_score: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Company.countDocuments(query),
        ]);

        res.status(200).json({
            success: true,
            data: companies,
            meta: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        throw new AppError('Failed to fetch companies', 500);
    }
};

/**
 * Get a single company by ID
 */
export const getCompanyById = async (req: AuthRequest, res: Response) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            throw new AppError('Company not found', 404);
        }

        res.status(200).json({
            success: true,
            data: company,
        });
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to fetch company', 500);
    }
};

/**
 * Get company hiring updates (active only)
 */
export const getHiringUpdates = async (req: AuthRequest, res: Response) => {
    try {
        const { branch, page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const matchQuery: any = {
            'hiring_updates.is_active': true,
            'hiring_updates.registration_deadline': { $gte: new Date() },
        };

        if (branch) {
            matchQuery['hiring_updates.branches'] = { $in: [branch, 'All'] };
        }

        const companies = await Company.find(matchQuery)
            .select('name logo_url industry hiring_updates eligibility')
            .sort({ 'hiring_updates.registration_deadline': 1 })
            .skip(skip)
            .limit(Number(limit));

        // Flatten hiring updates with company info
        const updates = companies.flatMap((company) =>
            company.hiring_updates
                .filter((update) => update.is_active && update.registration_deadline > new Date())
                .map((update) => ({
                    company_id: company._id,
                    company_name: company.name,
                    company_logo: company.logo_url,
                    industry: company.industry,
                    ...update,
                }))
        );

        // Sort by deadline
        updates.sort((a, b) =>
            new Date(a.registration_deadline).getTime() - new Date(b.registration_deadline).getTime()
        );

        res.status(200).json({
            success: true,
            data: updates.slice(skip, skip + Number(limit)),
            meta: {
                page: Number(page),
                limit: Number(limit),
                total: updates.length,
            },
        });
    } catch (error) {
        throw new AppError('Failed to fetch hiring updates', 500);
    }
};

/**
 * Get company question patterns
 */
export const getQuestionPatterns = async (req: AuthRequest, res: Response) => {
    try {
        const company = await Company.findById(req.params.id)
            .select('name question_patterns recruitment_process');

        if (!company) {
            throw new AppError('Company not found', 404);
        }

        res.status(200).json({
            success: true,
            data: {
                company_name: company.name,
                question_patterns: company.question_patterns,
                recruitment_process: company.recruitment_process,
            },
        });
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to fetch question patterns', 500);
    }
};

/**
 * Create a company (Admin)
 */
export const createCompany = async (req: AuthRequest, res: Response) => {
    try {
        const company = new Company(req.body);
        await company.save();

        res.status(201).json({
            success: true,
            message: 'Company created successfully',
            data: company,
        });
    } catch (error) {
        throw new AppError('Failed to create company', 500);
    }
};

/**
 * Update a company (Admin)
 */
export const updateCompany = async (req: AuthRequest, res: Response) => {
    try {
        const company = await Company.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!company) {
            throw new AppError('Company not found', 404);
        }

        res.status(200).json({
            success: true,
            message: 'Company updated successfully',
            data: company,
        });
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to update company', 500);
    }
};
