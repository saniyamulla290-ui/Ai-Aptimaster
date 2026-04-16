import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    Button,
    LinearProgress,
    Chip,
    Stack,
    Skeleton,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Avatar,
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    LocalFireDepartment as FireIcon,
    EmojiEvents as TrophyIcon,
    Timer as TimerIcon,
    CheckCircle as CheckIcon,
    PlayArrow as PlayIcon,
    School as SchoolIcon,
    Star as StarIcon,
    ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI } from '../../services/api';

interface DashboardData {
    user: any;
    overall_stats: any;
    daily_target: any;
    recent_sessions: any[];
    weak_areas: any[];
}

export default function DashboardPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await analyticsAPI.getDashboardStats();
            setData(response.data.data);
        } catch (err) {
            console.error('Failed to fetch dashboard:', err);
            // Use mock data for demo
            setData({
                user: {
                    name: user?.name || 'Student',
                    branch: user?.branch || 'IT',
                    streak: user?.streak || 0,
                    total_points: user?.total_points || 0,
                    level: user?.level || 1,
                    achievements_count: 0,
                },
                overall_stats: {
                    total_questions_attempted: 0,
                    total_correct_answers: 0,
                    average_accuracy: 0,
                    total_time_spent: 0,
                    current_streak: 0,
                    longest_streak: 0,
                    total_points: 0,
                },
                daily_target: { target: 10, completed: 0, progress: 0, is_completed: false },
                recent_sessions: [],
                weak_areas: [],
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box>
                <Skeleton variant="text" width="60%" height={50} />
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    {[1, 2, 3, 4].map((i) => (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                            <Skeleton variant="rounded" height={130} />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }

    const stats = data?.overall_stats;
    const target = data?.daily_target;

    return (
        <Box>
            {/* Welcome header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Welcome back, {data?.user?.name || 'Student'}! 👋
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {data?.user?.branch} Engineering • Level {data?.user?.level}
                </Typography>
            </Box>

            {/* Stats cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <FireIcon sx={{ mr: 1 }} />
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>Streak</Typography>
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                                {stats?.current_streak || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                days in a row
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <TrophyIcon sx={{ mr: 1 }} />
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>Points</Typography>
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                                {stats?.total_points || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                total earned
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <TrendingUpIcon sx={{ mr: 1 }} />
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>Accuracy</Typography>
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                                {Math.round(stats?.average_accuracy || 0)}%
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                overall accuracy
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <CheckIcon sx={{ mr: 1 }} />
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>Questions</Typography>
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                                {stats?.total_questions_attempted || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                total solved
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Daily Target */}
                <Grid xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                            <TimerIcon sx={{ mr: 1, color: 'primary.main' }} />
                            Daily Target
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {target?.completed || 0} / {target?.target || 10} questions
                                </Typography>
                                <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                                    {Math.round(target?.progress || 0)}%
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={target?.progress || 0}
                                sx={{ height: 12, borderRadius: 6 }}
                            />
                        </Box>

                        {target?.is_completed ? (
                            <Chip
                                icon={<CheckIcon />}
                                label="Target Completed! 🎉"
                                color="success"
                                sx={{ mb: 2 }}
                            />
                        ) : (
                            <Button
                                variant="contained"
                                startIcon={<PlayIcon />}
                                onClick={() => navigate('/practice')}
                                fullWidth
                                sx={{ mt: 1 }}
                            >
                                Continue Practice
                            </Button>
                        )}
                    </Paper>
                </Grid>

                {/* Weak Areas */}
                <Grid xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                            <TrendingUpIcon sx={{ mr: 1, color: 'warning.main' }} />
                            Focus Areas
                        </Typography>

                        {data?.weak_areas && data.weak_areas.length > 0 ? (
                            <List dense>
                                {data.weak_areas.map((area: any, index: number) => (
                                    <ListItem key={index} sx={{ px: 0 }}>
                                        <ListItemIcon>
                                            <Avatar
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    bgcolor: area.accuracy < 50 ? 'error.main' : 'warning.main',
                                                    fontSize: 14,
                                                }}
                                            >
                                                {Math.round(area.accuracy)}%
                                            </Avatar>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={area.topic}
                                            secondary={`${area.total_attempts} attempts`}
                                        />
                                        <Button
                                            size="small"
                                            onClick={() => navigate('/practice', { state: { topic: area.topic } })}
                                        >
                                            Practice
                                        </Button>
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 3 }}>
                                <SchoolIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 1 }} />
                                <Typography color="text.secondary">
                                    Start practicing to identify weak areas
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    sx={{ mt: 2 }}
                                    onClick={() => navigate('/practice')}
                                >
                                    Start Practicing
                                </Button>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Recent Sessions */}
                <Grid xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                <StarIcon sx={{ mr: 1, color: 'secondary.main' }} />
                                Recent Practice Sessions
                            </Typography>
                            <Button endIcon={<ArrowIcon />} onClick={() => navigate('/analytics')}>
                                View All
                            </Button>
                        </Box>

                        {data?.recent_sessions && data.recent_sessions.length > 0 ? (
                            <Grid container spacing={2}>
                                {data.recent_sessions.map((session: any, index: number) => (
                                    <Grid xs={12} sm={6} md={4} key={index}>
                                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                            <CardContent>
                                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                    {session.topic || 'Mixed Topics'}
                                                </Typography>
                                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                    {session.score}%
                                                </Typography>
                                                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                                    <Chip size="small" label={`${session.correct_answers}/${session.total_questions}`} color="success" variant="outlined" />
                                                    <Chip size="small" label={`${Math.round(session.total_time / 60)}m`} variant="outlined" />
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography color="text.secondary">
                                    No practice sessions yet. Start your first one!
                                </Typography>
                                <Button
                                    variant="contained"
                                    sx={{ mt: 2 }}
                                    onClick={() => navigate('/practice')}
                                    startIcon={<PlayIcon />}
                                >
                                    Start Practicing
                                </Button>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
