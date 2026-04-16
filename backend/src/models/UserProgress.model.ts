import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User.model';

export interface IDailyTarget {
    date: Date;
    target_questions: number;
    completed_questions: number;
    streak_maintained: boolean;
    points_earned: number;
}

export interface IWeakArea {
    topic: string;
    accuracy: number;
    total_attempts: number;
    correct_attempts: number;
    last_practiced: Date;
    improvement_score: number;
}

export interface IUserProgress extends Document {
    user_id: IUser['_id'];
    daily_targets: IDailyTarget[];
    weak_areas: IWeakArea[];
    overall_stats: {
        total_questions_attempted: number;
        total_correct_answers: number;
        average_accuracy: number;
        total_time_spent: number; // in minutes
        current_streak: number;
        longest_streak: number;
        total_points: number;
    };
    topic_wise_stats: Map<string, {
        attempts: number;
        correct: number;
        accuracy: number;
        last_practiced: Date;
    }>;
    company_wise_stats: Map<string, {
        attempts: number;
        correct: number;
        accuracy: number;
        last_attempted: Date;
    }>;
    created_at: Date;
    updated_at: Date;
}

const DailyTargetSchema = new Schema<IDailyTarget>({
    date: { type: Date, required: true },
    target_questions: { type: Number, default: 10 },
    completed_questions: { type: Number, default: 0 },
    streak_maintained: { type: Boolean, default: false },
    points_earned: { type: Number, default: 0 },
});

const WeakAreaSchema = new Schema<IWeakArea>({
    topic: { type: String, required: true },
    accuracy: { type: Number, required: true, min: 0, max: 100 },
    total_attempts: { type: Number, default: 0 },
    correct_attempts: { type: Number, default: 0 },
    last_practiced: { type: Date, default: Date.now },
    improvement_score: { type: Number, default: 0 },
});

const UserProgressSchema = new Schema<IUserProgress>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        daily_targets: [DailyTargetSchema],
        weak_areas: [WeakAreaSchema],
        overall_stats: {
            total_questions_attempted: { type: Number, default: 0 },
            total_correct_answers: { type: Number, default: 0 },
            average_accuracy: { type: Number, default: 0, min: 0, max: 100 },
            total_time_spent: { type: Number, default: 0 }, // minutes
            current_streak: { type: Number, default: 0 },
            longest_streak: { type: Number, default: 0 },
            total_points: { type: Number, default: 0 },
        },
        topic_wise_stats: {
            type: Map,
            of: new Schema({
                attempts: { type: Number, default: 0 },
                correct: { type: Number, default: 0 },
                accuracy: { type: Number, default: 0, min: 0, max: 100 },
                last_practiced: { type: Date, default: Date.now },
            }),
            default: {},
        },
        company_wise_stats: {
            type: Map,
            of: new Schema({
                attempts: { type: Number, default: 0 },
                correct: { type: Number, default: 0 },
                accuracy: { type: Number, default: 0, min: 0, max: 100 },
                last_attempted: { type: Date, default: Date.now },
            }),
            default: {},
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

// Indexes
UserProgressSchema.index({ user_id: 1 }, { unique: true });
UserProgressSchema.index({ 'overall_stats.current_streak': -1 });
UserProgressSchema.index({ 'overall_stats.total_points': -1 });
UserProgressSchema.index({ 'weak_areas.improvement_score': -1 });

// Pre-save middleware to calculate average accuracy
UserProgressSchema.pre('save', function (next) {
    const progress = this as IUserProgress;

    if (progress.overall_stats.total_questions_attempted > 0) {
        progress.overall_stats.average_accuracy =
            (progress.overall_stats.total_correct_answers / progress.overall_stats.total_questions_attempted) * 100;
    }

    // Update weak areas
    progress.weak_areas.forEach(area => {
        if (area.total_attempts > 0) {
            area.accuracy = (area.correct_attempts / area.total_attempts) * 100;
        }
    });

    next();
});

export const UserProgress = mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);