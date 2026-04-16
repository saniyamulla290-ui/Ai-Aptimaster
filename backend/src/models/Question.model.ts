import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionOption {
    id: string;
    text: string;
    is_correct: boolean;
    explanation?: string;
}

export interface IQuestion extends Document {
    question_text: string;
    question_type: 'multiple_choice' | 'true_false' | 'fill_in_blank' | 'coding';
    options: IQuestionOption[];
    correct_answer: string | string[]; // For multiple choice: option id, for coding: expected output
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
    topic: string;
    sub_topic?: string;
    tags: string[];
    branch: string[]; // Which engineering branches this question is relevant for
    company_tags: string[]; // Companies that ask this type of question
    time_limit: number; // in seconds
    points: number;
    ai_generated: boolean;
    metadata: {
        source?: string;
        created_by?: string;
        last_used?: Date;
        usage_count: number;
        average_time_taken: number;
        success_rate: number;
    };
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

const QuestionOptionSchema = new Schema<IQuestionOption>({
    id: { type: String, required: true },
    text: { type: String, required: true },
    is_correct: { type: Boolean, required: true },
    explanation: { type: String },
});

const QuestionSchema = new Schema<IQuestion>(
    {
        question_text: { type: String, required: true },
        question_type: {
            type: String,
            enum: ['multiple_choice', 'true_false', 'fill_in_blank', 'coding'],
            default: 'multiple_choice',
        },
        options: [QuestionOptionSchema],
        correct_answer: { type: Schema.Types.Mixed, required: true },
        explanation: { type: String, required: true },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium',
        },
        topic: { type: String, required: true },
        sub_topic: { type: String },
        tags: [{ type: String }],
        branch: [{ type: String }],
        company_tags: [{ type: String }],
        time_limit: { type: Number, default: 60 }, // 60 seconds default
        points: { type: Number, default: 10 },
        ai_generated: { type: Boolean, default: false },
        metadata: {
            source: { type: String },
            created_by: { type: String },
            last_used: { type: Date },
            usage_count: { type: Number, default: 0 },
            average_time_taken: { type: Number, default: 0 },
            success_rate: { type: Number, default: 0, min: 0, max: 100 },
        },
        is_active: { type: Boolean, default: true },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

// Indexes for efficient querying
QuestionSchema.index({ topic: 1, difficulty: 1 });
QuestionSchema.index({ branch: 1 });
QuestionSchema.index({ company_tags: 1 });
QuestionSchema.index({ tags: 1 });
QuestionSchema.index({ difficulty: 1, points: 1 });
QuestionSchema.index({ 'metadata.usage_count': -1 });
QuestionSchema.index({ is_active: 1 });

// Pre-save middleware to validate options for multiple choice questions
QuestionSchema.pre('save', function (next) {
    const question = this as IQuestion;

    if (question.question_type === 'multiple_choice') {
        // Ensure at least 2 options
        if (question.options.length < 2) {
            return next(new Error('Multiple choice questions must have at least 2 options'));
        }

        // Ensure exactly one correct option
        const correctOptions = question.options.filter(opt => opt.is_correct);
        if (correctOptions.length !== 1) {
            return next(new Error('Multiple choice questions must have exactly one correct option'));
        }

        // Set correct_answer to the id of the correct option
        question.correct_answer = correctOptions[0].id;
    }

    // For true/false questions
    if (question.question_type === 'true_false') {
        if (!['true', 'false'].includes(question.correct_answer as string)) {
            return next(new Error('True/false questions must have correct_answer as "true" or "false"'));
        }
    }

    next();
});

// Static method to get random questions by criteria
QuestionSchema.statics.getRandomQuestions = async function (
    criteria: {
        topic?: string;
        difficulty?: string;
        branch?: string;
        company?: string;
        limit?: number;
    }
): Promise<IQuestion[]> {
    const { topic, difficulty, branch, company, limit = 10 } = criteria;

    const query: any = { is_active: true };

    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;
    if (branch) query.branch = branch;
    if (company) query.company_tags = company;

    // Use aggregation for random sampling
    return this.aggregate([
        { $match: query },
        { $sample: { size: limit } },
    ]);
};

export const Question = mongoose.model<IQuestion>('Question', QuestionSchema);