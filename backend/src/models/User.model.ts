import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    branch: 'Mechanical' | 'Civil' | 'Electrical' | 'Electronics' | 'IT';
    profile_picture?: string;
    streak: number;
    total_points: number;
    level: number;
    achievements: string[];
    settings: {
        notifications: boolean;
        daily_target: number;
        theme: 'light' | 'dark' | 'system';
    };
    last_login?: Date;
    created_at: Date;
    updated_at: Date;

    // Methods
    comparePassword(candidatePassword: string): Promise<boolean>;
    toJSON(): any;
}

const UserSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                'Please provide a valid email address',
            ],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // Don't include password in queries by default
        },
        branch: {
            type: String,
            required: [true, 'Branch is required'],
            enum: {
                values: ['Mechanical', 'Civil', 'Electrical', 'Electronics', 'IT'],
                message: '{VALUE} is not a valid branch',
            },
        },
        profile_picture: {
            type: String,
            default: '',
        },
        streak: {
            type: Number,
            default: 0,
            min: [0, 'Streak cannot be negative'],
        },
        total_points: {
            type: Number,
            default: 0,
            min: [0, 'Points cannot be negative'],
        },
        level: {
            type: Number,
            default: 1,
            min: [1, 'Level must be at least 1'],
        },
        achievements: {
            type: [String],
            default: [],
        },
        settings: {
            notifications: {
                type: Boolean,
                default: true,
            },
            daily_target: {
                type: Number,
                default: 20,
                min: [5, 'Daily target must be at least 5 questions'],
                max: [100, 'Daily target cannot exceed 100 questions'],
            },
            theme: {
                type: String,
                enum: ['light', 'dark', 'system'],
                default: 'light',
            },
        },
        last_login: {
            type: Date,
        },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
        toJSON: {
            virtuals: true,
            transform: function (doc, ret) {
                delete ret.password;
                delete ret.__v;
                return ret;
            },
        },
        toObject: {
            virtuals: true,
            transform: function (doc, ret) {
                delete ret.password;
                delete ret.__v;
                return ret;
            },
        },
    }
);

// Virtual for formatted user info
UserSchema.virtual('formatted_info').get(function (this: IUser) {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        branch: this.branch,
        streak: this.streak,
        level: this.level,
        total_points: this.total_points,
    };
});

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ branch: 1 });
UserSchema.index({ streak: -1 });
UserSchema.index({ total_points: -1 });
UserSchema.index({ created_at: -1 });

// Pre-save middleware to hash password
UserSchema.pre<IUser>('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        // Generate salt
        const salt = await bcrypt.genSalt(10);

        // Hash password
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        return false;
    }
};

// Method to sanitize user object
UserSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.__v;
    return user;
};

// Static method to find user by email
UserSchema.statics.findByEmail = function (email: string) {
    return this.findOne({ email }).select('+password');
};

// Static method to update streak
UserSchema.statics.updateStreak = async function (userId: string, maintained: boolean) {
    const user = await this.findById(userId);
    if (!user) return null;

    if (maintained) {
        user.streak += 1;
    } else {
        user.streak = 0;
    }

    await user.save();
    return user.streak;
};

// Static method to add points
UserSchema.statics.addPoints = async function (userId: string, points: number) {
    const user = await this.findById(userId);
    if (!user) return null;

    user.total_points += points;

    // Update level based on points (every 1000 points = 1 level)
    user.level = Math.floor(user.total_points / 1000) + 1;

    await user.save();
    return { total_points: user.total_points, level: user.level };
};

const User = mongoose.model<IUser>('User', UserSchema);

export default User;