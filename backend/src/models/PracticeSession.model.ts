import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer {
    question_id: mongoose.Types.ObjectId;
    selected_option: string;
    is_correct: boolean;
    time_taken: number; // seconds
    marked_for_review: boolean;
}

export interface IPracticeSession extends Document {
    user_id: mongoose.Types.ObjectId;
    session_type: 'practice' | 'mock_test' | 'daily_target' | 'company_specific';
    topic?: string;
    sub_topic?: string;
    company_id?: mongoose.Types.ObjectId;
    branch?: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
    questions: mongoose.Types.ObjectId[];
    answers: IAnswer[];
    total_questions: number;
    attempted_questions: number;
    correct_answers: number;
    wrong_answers: number;
    skipped_questions: number;
    score: number;
    accuracy: number;
    total_time: number; // seconds
    time_limit: number; // seconds
    points_earned: number;
    status: 'in_progress' | 'completed' | 'abandoned';
    started_at: Date;
    completed_at?: Date;
    created_at: Date;
    updated_at: Date;
}

const AnswerSchema = new Schema<IAnswer>({
    question_id: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    selected_option: { type: String, default: '' },
    is_correct: { type: Boolean, default: false },
    time_taken: { type: Number, default: 0 },
    marked_for_review: { type: Boolean, default: false },
});

const PracticeSessionSchema = new Schema<IPracticeSession>(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        session_type: {
            type: String,
            enum: ['practice', 'mock_test', 'daily_target', 'company_specific'],
            default: 'practice',
        },
        topic: { type: String },
        sub_topic: { type: String },
        company_id: { type: Schema.Types.ObjectId, ref: 'Company' },
        branch: { type: String },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard', 'mixed'],
            default: 'mixed',
        },
        questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
        answers: [AnswerSchema],
        total_questions: { type: Number, required: true },
        attempted_questions: { type: Number, default: 0 },
        correct_answers: { type: Number, default: 0 },
        wrong_answers: { type: Number, default: 0 },
        skipped_questions: { type: Number, default: 0 },
        score: { type: Number, default: 0 },
        accuracy: { type: Number, default: 0, min: 0, max: 100 },
        total_time: { type: Number, default: 0 },
        time_limit: { type: Number, default: 1800 }, // 30 minutes default
        points_earned: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ['in_progress', 'completed', 'abandoned'],
            default: 'in_progress',
        },
        started_at: { type: Date, default: Date.now },
        completed_at: { type: Date },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

// Indexes
PracticeSessionSchema.index({ user_id: 1, status: 1 });
PracticeSessionSchema.index({ user_id: 1, created_at: -1 });
PracticeSessionSchema.index({ user_id: 1, topic: 1 });
PracticeSessionSchema.index({ user_id: 1, company_id: 1 });
PracticeSessionSchema.index({ status: 1 });

// Pre-save: calculate accuracy and scores
PracticeSessionSchema.pre('save', function (next) {
    const session = this as IPracticeSession;

    if (session.attempted_questions > 0) {
        session.accuracy = (session.correct_answers / session.attempted_questions) * 100;
    }

    session.skipped_questions = session.total_questions - session.attempted_questions;

    // Points: 10 per correct, -2 per wrong, 0 for skipped
    session.points_earned = (session.correct_answers * 10) - (session.wrong_answers * 2);
    if (session.points_earned < 0) session.points_earned = 0;

    next();
});

export const PracticeSession = mongoose.model<IPracticeSession>('PracticeSession', PracticeSessionSchema);
