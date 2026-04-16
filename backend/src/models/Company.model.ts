import mongoose, { Schema, Document } from 'mongoose';

export interface IHiringUpdate {
    title: string;
    description: string;
    registration_link: string;
    registration_deadline: Date;
    eligibility_criteria: string[];
    branches: string[]; // Which engineering branches are eligible
    positions: string[];
    location: string;
    salary_range?: string;
    application_process: string[];
    important_dates: Array<{
        event: string;
        date: Date;
    }>;
    is_active: boolean;
    posted_at: Date;
    updated_at: Date;
}

export interface ICompany extends Document {
    name: string;
    logo_url: string;
    description: string;
    website: string;
    industry: string;
    hiring_updates: IHiringUpdate[];
    question_patterns: Array<{
        topic: string;
        weightage: number; // Percentage of questions from this topic
        difficulty_distribution: {
            easy: number;
            medium: number;
            hard: number;
        };
    }>;
    recruitment_process: string[];
    average_package?: string;
    eligibility: {
        minimum_cgpa?: number;
        backlogs_allowed?: number;
        year_of_passing?: number[];
        branches: string[];
    };
    popularity_score: number;
    is_featured: boolean;
    metadata: {
        total_questions: number;
        total_applications: number;
        last_updated: Date;
    };
    created_at: Date;
    updated_at: Date;
}

const HiringUpdateSchema = new Schema<IHiringUpdate>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    registration_link: { type: String, required: true },
    registration_deadline: { type: Date, required: true },
    eligibility_criteria: [{ type: String }],
    branches: [{ type: String }],
    positions: [{ type: String }],
    location: { type: String, required: true },
    salary_range: { type: String },
    application_process: [{ type: String }],
    important_dates: [{
        event: { type: String, required: true },
        date: { type: Date, required: true },
    }],
    is_active: { type: Boolean, default: true },
    posted_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

const QuestionPatternSchema = new Schema({
    topic: { type: String, required: true },
    weightage: { type: Number, required: true, min: 0, max: 100 },
    difficulty_distribution: {
        easy: { type: Number, default: 30, min: 0, max: 100 },
        medium: { type: Number, default: 50, min: 0, max: 100 },
        hard: { type: Number, default: 20, min: 0, max: 100 },
    },
});

const CompanySchema = new Schema<ICompany>(
    {
        name: { type: String, required: true, unique: true },
        logo_url: { type: String },
        description: { type: String, required: true },
        website: { type: String },
        industry: { type: String, required: true },
        hiring_updates: [HiringUpdateSchema],
        question_patterns: [QuestionPatternSchema],
        recruitment_process: [{ type: String }],
        average_package: { type: String },
        eligibility: {
            minimum_cgpa: { type: Number, min: 0, max: 10 },
            backlogs_allowed: { type: Number, min: 0 },
            year_of_passing: [{ type: Number }],
            branches: [{ type: String }],
        },
        popularity_score: { type: Number, default: 0 },
        is_featured: { type: Boolean, default: false },
        metadata: {
            total_questions: { type: Number, default: 0 },
            total_applications: { type: Number, default: 0 },
            last_updated: { type: Date, default: Date.now },
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

// Indexes
CompanySchema.index({ name: 1 });
CompanySchema.index({ industry: 1 });
CompanySchema.index({ popularity_score: -1 });
CompanySchema.index({ is_featured: 1 });
CompanySchema.index({ 'eligibility.branches': 1 });
CompanySchema.index({ 'hiring_updates.is_active': 1, 'hiring_updates.registration_deadline': 1 });

// Pre-save middleware to update metadata
CompanySchema.pre('save', function (next) {
    const company = this as ICompany;

    // Update total questions count from question patterns
    company.metadata.total_questions = company.question_patterns.reduce(
        (total, pattern) => total + Math.round(pattern.weightage * 10), // Example calculation
        0
    );

    // Update last_updated timestamp
    company.metadata.last_updated = new Date();

    // Calculate popularity score based on hiring updates and applications
    const activeUpdates = company.hiring_updates.filter(update => update.is_active).length;
    company.popularity_score = activeUpdates * 10 + company.metadata.total_applications;

    next();
});

// Method to get active hiring updates
CompanySchema.methods.getActiveHiringUpdates = function (): IHiringUpdate[] {
    const now = new Date();
    return this.hiring_updates.filter(
        (update: IHiringUpdate) =>
            update.is_active &&
            update.registration_deadline > now
    );
};

// Method to add a new hiring update
CompanySchema.methods.addHiringUpdate = function (updateData: Partial<IHiringUpdate>): IHiringUpdate {
    const newUpdate = {
        ...updateData,
        posted_at: new Date(),
        updated_at: new Date(),
        is_active: true,
    } as IHiringUpdate;

    this.hiring_updates.push(newUpdate);
    return newUpdate;
};

// Static method to get companies by branch eligibility
CompanySchema.statics.findByBranch = function (branch: string): Promise<ICompany[]> {
    return this.find({
        $or: [
            { 'eligibility.branches': branch },
            { 'eligibility.branches': 'All' },
            { 'eligibility.branches': { $size: 0 } }, // No restriction
        ],
    });
};

export const Company = mongoose.model<ICompany>('Company', CompanySchema);