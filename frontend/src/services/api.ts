import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor — attach token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401 token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, {
                    withCredentials: true,
                });

                const newToken = data.data.accessToken;
                localStorage.setItem('accessToken', newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;

// ─── Auth API ────────────────────────────────────────
export const authAPI = {
    register: (data: { name: string; email: string; password: string; branch: string }) =>
        api.post('/auth/register', data),

    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),

    logout: () => api.post('/auth/logout'),

    getCurrentUser: () => api.get('/auth/me'),

    refreshToken: () => api.post('/auth/refresh-token'),

    updateProfile: (data: any) => api.put('/auth/profile', data),

    changePassword: (data: { currentPassword: string; newPassword: string }) =>
        api.post('/auth/change-password', data),
};

// ─── Questions API ───────────────────────────────────
export const questionsAPI = {
    getQuestions: (params?: any) => api.get('/questions', { params }),

    getTopics: (branch?: string) => api.get('/questions/topics', { params: { branch } }),

    getRandomQuestions: (params?: any) => api.get('/questions/random', { params }),

    getQuestionById: (id: string) => api.get(`/questions/${id}`),

    checkAnswer: (id: string, selectedOption: string) =>
        api.post(`/questions/${id}/check`, { selected_option: selectedOption }),
};

// ─── Practice API ────────────────────────────────────
export const practiceAPI = {
    startSession: (data: {
        session_type?: string;
        topic?: string;
        difficulty?: string;
        branch?: string;
        company_id?: string;
        question_count?: number;
        time_limit?: number;
    }) => api.post('/practice/start', data),

    submitAnswer: (sessionId: string, data: {
        question_id: string;
        selected_option: string;
        time_taken: number;
    }) => api.post(`/practice/${sessionId}/answer`, data),

    endSession: (sessionId: string) => api.post(`/practice/${sessionId}/end`),

    getSessionResults: (sessionId: string) => api.get(`/practice/${sessionId}/results`),

    getHistory: (params?: any) => api.get('/practice/history', { params }),
};

// ─── Companies API ───────────────────────────────────
export const companiesAPI = {
    getCompanies: (params?: any) => api.get('/companies', { params }),

    getCompanyById: (id: string) => api.get(`/companies/${id}`),

    getHiringUpdates: (branch?: string) =>
        api.get('/companies/hiring', { params: { branch } }),

    getQuestionPatterns: (id: string) => api.get(`/companies/${id}/patterns`),
};

// ─── Analytics API ───────────────────────────────────
export const analyticsAPI = {
    getDashboardStats: () => api.get('/analytics/dashboard'),

    getPerformanceTrends: (days?: number) =>
        api.get('/analytics/trends', { params: { days } }),

    getTopicAnalysis: () => api.get('/analytics/topics'),

    getCompanyPerformance: () => api.get('/analytics/companies'),
};

// ─── User API ────────────────────────────────────────
export const userAPI = {
    getProfile: () => api.get('/users/profile'),

    updateProfile: (data: any) => api.put('/users/profile', data),

    getProgress: () => api.get('/users/progress'),

    getLeaderboard: (params?: any) => api.get('/users/leaderboard', { params }),

    getAchievements: () => api.get('/users/achievements'),

    getDailyTarget: () => api.get('/users/daily-target'),

    setDailyTarget: (target: number) =>
        api.post('/users/daily-target', { target_questions: target }),

    deleteAccount: () => api.delete('/users/account'),
};
