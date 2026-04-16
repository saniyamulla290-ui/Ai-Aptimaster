import { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Skeleton,
    Card,
    CardContent,
    Chip,
    LinearProgress,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    Analytics as AnalyticsIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    CheckCircle as CheckIcon,
    Cancel as WrongIcon,
    Timer as TimerIcon,
} from '@mui/icons-material';
import { analyticsAPI } from '../../services/api';

export default function AnalyticsPage() {
    const [trends, setTrends] = useState<any[]>([]);
    const [topicAnalysis, setTopicAnalysis] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    useEffect(() => {
        fetchAnalytics();
    }, [days]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const [trendsRes, topicsRes] = await Promise.all([
                analyticsAPI.getPerformanceTrends(days),
                analyticsAPI.getTopicAnalysis(),
            ]);
            setTrends(trendsRes.data.data || []);
            setTopicAnalysis(topicsRes.data.data || []);
        } catch {
            // Use mock data
            setTrends(generateMockTrends(days));
            setTopicAnalysis([
                { topic: 'Time & Work', attempts: 45, correct: 36, accuracy: 80, strength: 'strong' },
                { topic: 'Profit & Loss', attempts: 38, correct: 22, accuracy: 57.9, strength: 'moderate' },
                { topic: 'Probability', attempts: 30, correct: 12, accuracy: 40, strength: 'weak' },
                { topic: 'Ratio & Proportion', attempts: 25, correct: 21, accuracy: 84, strength: 'strong' },
                { topic: 'Algebra', attempts: 20, correct: 11, accuracy: 55, strength: 'moderate' },
                { topic: 'Number System', attempts: 15, correct: 5, accuracy: 33.3, strength: 'weak' },
                { topic: 'Geometry', attempts: 18, correct: 14, accuracy: 77.8, strength: 'strong' },
                { topic: 'Logical Reasoning', attempts: 22, correct: 15, accuracy: 68.2, strength: 'moderate' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getStrengthColor = (strength: string) => {
        switch (strength) {
            case 'strong': return 'success';
            case 'moderate': return 'warning';
            case 'weak': return 'error';
            default: return 'default';
        }
    };

    // Calculate summary from trends
    const totalQuestions = trends.reduce((sum, d) => sum + (d.total_questions || 0), 0);
    const totalCorrect = trends.reduce((sum, d) => sum + (d.correct_answers || 0), 0);
    const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const totalSessions = trends.reduce((sum, d) => sum + (d.sessions || 0), 0);

    if (loading) {
        return (
            <Box>
                <Skeleton variant="text" width="40%" height={50} />
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    {[1, 2, 3, 4].map((i) => (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                            <Skeleton variant="rounded" height={120} />
                        </Grid>
                    ))}
                </Grid>
                <Skeleton variant="rounded" height={300} sx={{ mt: 3 }} />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'bottom', color: 'primary.main' }} />
                    Analytics & Insights
                </Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Period</InputLabel>
                    <Select value={days} label="Period" onChange={(e) => setDays(Number(e.target.value))}>
                        <MenuItem value={7}>Last 7 days</MenuItem>
                        <MenuItem value={14}>Last 14 days</MenuItem>
                        <MenuItem value={30}>Last 30 days</MenuItem>
                        <MenuItem value={90}>Last 90 days</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {[
                    { label: 'Total Sessions', value: totalSessions, icon: <AnalyticsIcon />, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                    { label: 'Questions Solved', value: totalQuestions, icon: <CheckIcon />, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
                    { label: 'Avg Accuracy', value: `${avgAccuracy}%`, icon: <TrendingUpIcon />, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
                    { label: 'Total Correct', value: totalCorrect, icon: <CheckIcon />, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
                ].map((stat, i) => (
                    <Grid item xs={6} md={3} key={i}>
                        <Card sx={{ background: stat.gradient, color: 'white', borderRadius: 3 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, opacity: 0.9 }}>
                                    {stat.icon}
                                    <Typography variant="body2" sx={{ ml: 1 }}>{stat.label}</Typography>
                                </Box>
                                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{stat.value}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Performance Chart (text-based visualization) */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Daily Performance (Last {days} days)
                </Typography>
                {trends.length > 0 ? (
                    <Box sx={{ overflowX: 'auto' }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, minWidth: trends.length * 30, height: 200, pt: 2 }}>
                            {trends.map((day, i) => (
                                <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 24 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                                        {day.accuracy}%
                                    </Typography>
                                    <Box
                                        sx={{
                                            width: '100%',
                                            maxWidth: 28,
                                            height: `${Math.max(8, day.accuracy * 1.5)}px`,
                                            bgcolor: day.accuracy >= 80 ? 'success.main' : day.accuracy >= 50 ? 'warning.main' : 'error.main',
                                            borderRadius: '4px 4px 0 0',
                                            transition: 'height 0.5s ease',
                                        }}
                                    />
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontSize: 9 }}>
                                        {day.date?.slice(-5)}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                ) : (
                    <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                        No data available for this period. Start practicing!
                    </Typography>
                )}
            </Paper>

            {/* Topic Analysis */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Topic-wise Analysis
                </Typography>

                <Grid container spacing={2}>
                    {topicAnalysis.map((topic, i) => (
                        <Grid item xs={12} sm={6} key={i}>
                            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                            {topic.topic}
                                        </Typography>
                                        <Chip
                                            size="small"
                                            label={topic.strength}
                                            color={getStrengthColor(topic.strength) as any}
                                            icon={topic.strength === 'weak' ? <TrendingDownIcon /> : <TrendingUpIcon />}
                                        />
                                    </Box>

                                    <Box sx={{ mb: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Accuracy
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                {Math.round(topic.accuracy)}%
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={topic.accuracy}
                                            color={getStrengthColor(topic.strength) as any}
                                            sx={{ height: 8, borderRadius: 4 }}
                                        />
                                    </Box>

                                    <Stack direction="row" spacing={2}>
                                        <Typography variant="caption" color="text.secondary">
                                            <CheckIcon sx={{ fontSize: 14, verticalAlign: 'middle', color: 'success.main' }} /> {topic.correct} correct
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            <WrongIcon sx={{ fontSize: 14, verticalAlign: 'middle', color: 'error.main' }} /> {topic.attempts - topic.correct} wrong
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            <TimerIcon sx={{ fontSize: 14, verticalAlign: 'middle' }} /> {topic.attempts} total
                                        </Typography>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Paper>
        </Box>
    );
}

function generateMockTrends(days: number) {
    const result = [];
    for (let i = days; i >= 1; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const questions = Math.floor(Math.random() * 15) + 5;
        const correct = Math.floor(Math.random() * questions);
        result.push({
            date: date.toISOString().split('T')[0],
            sessions: Math.floor(Math.random() * 3) + 1,
            total_questions: questions,
            correct_answers: correct,
            accuracy: Math.round((correct / questions) * 100),
        });
    }
    return result;
}
