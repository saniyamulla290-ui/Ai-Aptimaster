import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
    id: string;
    name: string;
    email: string;
    branch: string;
    profile_picture: string;
    streak: number;
    total_points: number;
    level: number;
    settings: {
        notifications: boolean;
        daily_target: number;
        theme: string;
    };
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: { name: string; email: string; password: string; branch: string }) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const { data } = await authAPI.getCurrentUser();
            const userData = data.data.user;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const { data } = await authAPI.login({ email, password });
        const { user: userData, tokens } = data.data;

        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const register = async (registerData: { name: string; email: string; password: string; branch: string }) => {
        const { data } = await authAPI.register(registerData);
        const { user: userData, tokens } = data.data;

        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch {
            // Ignore logout API errors
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            setUser(null);
        }
    };

    const updateUser = (data: Partial<User>) => {
        if (user) {
            const updated = { ...user, ...data };
            setUser(updated);
            localStorage.setItem('user', JSON.stringify(updated));
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
