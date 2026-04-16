import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aptimaster';

const mongooseOptions = {
    autoIndex: process.env.NODE_ENV === 'development',
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

class Database {
    private static instance: Database;
    private isConnected = false;

    private constructor() { }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public async connect(): Promise<void> {
        if (this.isConnected) {
            console.log('Database already connected');
            return;
        }

        try {
            await mongoose.connect(MONGODB_URI, mongooseOptions);
            this.isConnected = true;
            console.log('✅ MongoDB connected successfully');

            // Set up connection event handlers
            mongoose.connection.on('error', (error) => {
                console.error('MongoDB connection error:', error);
                this.isConnected = false;
            });

            mongoose.connection.on('disconnected', () => {
                console.log('MongoDB disconnected');
                this.isConnected = false;
            });

            mongoose.connection.on('reconnected', () => {
                console.log('MongoDB reconnected');
                this.isConnected = true;
            });

            // Graceful shutdown
            process.on('SIGINT', async () => {
                await mongoose.connection.close();
                console.log('MongoDB connection closed through app termination');
                process.exit(0);
            });

        } catch (error) {
            console.error('MongoDB connection failed:', error);
            process.exit(1);
        }
    }

    public async disconnect(): Promise<void> {
        if (!this.isConnected) {
            return;
        }

        try {
            await mongoose.connection.close();
            this.isConnected = false;
            console.log('MongoDB disconnected successfully');
        } catch (error) {
            console.error('Error disconnecting from MongoDB:', error);
        }
    }

    public getConnectionStatus(): boolean {
        return this.isConnected;
    }

    public getConnection(): mongoose.Connection {
        return mongoose.connection;
    }
}

export const connectToDatabase = async (): Promise<void> => {
    const db = Database.getInstance();
    await db.connect();
};

export const disconnectFromDatabase = async (): Promise<void> => {
    const db = Database.getInstance();
    await db.disconnect();
};

export const getDatabaseConnection = (): mongoose.Connection => {
    const db = Database.getInstance();
    return db.getConnection();
};

export const isDatabaseConnected = (): boolean => {
    const db = Database.getInstance();
    return db.getConnectionStatus();
};

export default Database;