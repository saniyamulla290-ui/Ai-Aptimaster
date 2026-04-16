import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Button,
    Card,
    CardContent,
    CardActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Radio,
    RadioGroup,
    FormControlLabel,
    LinearProgress,
    IconButton,
    Alert,
    Skeleton,
} from '@mui/material';
import {
    PlayArrow as PlayIcon,
    Timer as TimerIcon,
    CheckCircle as CheckIcon,
    Cancel as WrongIcon,
    NavigateNext as NextIcon,
    NavigateBefore as PrevIcon,
    Flag as FlagIcon,
    School as SchoolIcon,
    Send as SubmitIcon,
} from '@mui/icons-material';
import { questionsAPI, practiceAPI } from '../../services/api';

const topics = [
    'Time & Work', 'Profit & Loss', 'Ratio & Proportion', 'Probability',
    'Permutation & Combination', 'Algebra', 'Geometry', 'Number System',
    'Data Interpretation', 'Logical Reasoning', 'Verbal Ability',
];

const difficulties = ['easy', 'medium', 'hard', 'mixed'];

export default function PracticePage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Setup state
    const [selectedTopic, setSelectedTopic] = useState(
        (location.state as any)?.topic || ''
    );
    const [selectedDifficulty, setSelectedDifficulty] = useState('mixed');
    const [questionCount, setQuestionCount] = useState(10);

    // Session state
    const [sessionActive, setSessionActive] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
    const [results, setResults] = useState<{ [key: string]: any }>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [sessionResults, setSessionResults] = useState<any>(null);

    // Timer
    useEffect(() => {
        if (!sessionActive || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleEndSession();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [sessionActive, timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleStartSession = async () => {
        setLoading(true);
        try {
            const response = await practiceAPI.startSession({
                topic: selectedTopic || undefined,
                difficulty: selectedDifficulty,
                question_count: questionCount,
                time_limit: questionCount * 90, // 90 seconds per question
            });

            const data = response.data.data;
            setSessionId(data.session_id);
            setQuestions(data.questions);
            setTimeLeft(data.time_limit);
            setSessionActive(true);
            setCurrentIndex(0);
            setAnswers({});
            setResults({});
        } catch (err: any) {
            // Use mock questions for demo
            const mockQuestions = generateMockQuestions(questionCount);
            setSessionId('mock-session');
            setQuestions(mockQuestions);
            setTimeLeft(questionCount * 90);
            setSessionActive(true);
            setCurrentIndex(0);
            setAnswers({});
            setResults({});
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAnswer = (questionId: string, optionId: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    };

    const handleSubmitAnswer = async () => {
        const question = questions[currentIndex];
        const selectedOption = answers[question._id];

        if (!selectedOption) return;

        try {
            if (sessionId !== 'mock-session') {
                const response = await practiceAPI.submitAnswer(sessionId, {
                    question_id: question._id,
                    selected_option: selectedOption,
                    time_taken: 30,
                });
                setResults((prev) => ({ ...prev, [question._id]: response.data.data }));
            } else {
                // Mock answer checking
                const isCorrect = selectedOption === question.correct_answer;
                setResults((prev) => ({
                    ...prev,
                    [question._id]: {
                        is_correct: isCorrect,
                        correct_answer: question.correct_answer,
                        explanation: question.explanation || 'This is the correct answer based on the formula.',
                    },
                }));
            }
        } catch {
            // Handle error
        }

        // Auto-advance to next question
        if (currentIndex < questions.length - 1) {
            setTimeout(() => setCurrentIndex(currentIndex + 1), 1500);
        }
    };

    const handleEndSession = async () => {
        try {
            if (sessionId !== 'mock-session') {
                const response = await practiceAPI.endSession(sessionId);
                setSessionResults(response.data.data);
            } else {
                // Mock results
                const correct = Object.values(results).filter((r: any) => r.is_correct).length;
                setSessionResults({
                    score: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
                    total_questions: questions.length,
                    attempted: Object.keys(results).length,
                    correct,
                    wrong: Object.values(results).filter((r: any) => !r.is_correct).length,
                    skipped: questions.length - Object.keys(results).length,
                    points_earned: correct * 10,
                });
            }
        } catch {
            const correct = Object.values(results).filter((r: any) => r.is_correct).length;
            setSessionResults({
                score: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
                total_questions: questions.length,
                attempted: Object.keys(results).length,
                correct,
                wrong: Object.values(results).filter((r: any) => !r.is_correct).length,
                skipped: questions.length - Object.keys(results).length,
                points_earned: correct * 10,
            });
        }

        setSessionActive(false);
        setShowResults(true);
    };

    // ─── Practice Setup Screen ──────────────────────────
    if (!sessionActive && !showResults) {
        return (
            <Box>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    <SchoolIcon sx={{ mr: 1, verticalAlign: 'bottom', color: 'primary.main' }} />
                    Start Practice Session
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 4 }}>
                    Configure your practice session below
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 4, borderRadius: 3 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Topic</InputLabel>
                                        <Select
                                            value={selectedTopic}
                                            label="Topic"
                                            onChange={(e) => setSelectedTopic(e.target.value)}
                                        >
                                            <MenuItem value="">All Topics</MenuItem>
                                            {topics.map((t) => (
                                                <MenuItem key={t} value={t}>{t}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Difficulty</InputLabel>
                                        <Select
                                            value={selectedDifficulty}
                                            label="Difficulty"
                                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                                        >
                                            {difficulties.map((d) => (
                                                <MenuItem key={d} value={d}>
                                                    {d.charAt(0).toUpperCase() + d.slice(1)}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Number of Questions</InputLabel>
                                        <Select
                                            value={questionCount}
                                            label="Number of Questions"
                                            onChange={(e) => setQuestionCount(Number(e.target.value))}
                                        >
                                            {[5, 10, 15, 20, 25, 30].map((n) => (
                                                <MenuItem key={n} value={n}>{n} Questions</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                                        <Typography variant="body2" color="text.secondary">Time Limit</Typography>
                                        <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                                            {formatTime(questionCount * 90)}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>

                            <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                startIcon={<PlayIcon />}
                                onClick={handleStartSession}
                                disabled={loading}
                                sx={{ mt: 4, py: 1.5, fontSize: '1.1rem' }}
                            >
                                {loading ? 'Preparing Questions...' : 'Start Practice'}
                            </Button>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Quick Practice
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
                                Jump right in with pre-configured sessions
                            </Typography>

                            <Stack spacing={1.5}>
                                {[
                                    { label: 'Quick 5', topic: '', count: 5, diff: 'mixed' },
                                    { label: 'Easy Warmup', topic: '', count: 10, diff: 'easy' },
                                    { label: 'Hard Challenge', topic: '', count: 10, diff: 'hard' },
                                ].map((preset) => (
                                    <Button
                                        key={preset.label}
                                        variant="outlined"
                                        fullWidth
                                        onClick={() => {
                                            setSelectedTopic(preset.topic);
                                            setSelectedDifficulty(preset.diff);
                                            setQuestionCount(preset.count);
                                        }}
                                        sx={{
                                            borderColor: 'rgba(255,255,255,0.5)',
                                            color: 'white',
                                            '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                                        }}
                                    >
                                        {preset.label} ({preset.count} Q)
                                    </Button>
                                ))}
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    // ─── Active Session Screen ──────────────────────────
    if (sessionActive && questions.length > 0) {
        const currentQuestion = questions[currentIndex];
        const currentAnswer = answers[currentQuestion._id];
        const currentResult = results[currentQuestion._id];

        return (
            <Box>
                {/* Session header */}
                <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Chip
                                icon={<TimerIcon />}
                                label={formatTime(timeLeft)}
                                color={timeLeft < 60 ? 'error' : 'primary'}
                                variant="outlined"
                                sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                            />
                            <Typography variant="body1">
                                Question <strong>{currentIndex + 1}</strong> / {questions.length}
                            </Typography>
                        </Stack>

                        <LinearProgress
                            variant="determinate"
                            value={((currentIndex + 1) / questions.length) * 100}
                            sx={{ flexGrow: 1, mx: 2, height: 8, borderRadius: 4, minWidth: 100 }}
                        />

                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={handleEndSession}
                        >
                            End Session
                        </Button>
                    </Box>
                </Paper>

                {/* Question */}
                <Paper sx={{ p: 4, mb: 3, borderRadius: 3 }}>
                    <Box sx={{ mb: 1 }}>
                        <Stack direction="row" spacing={1}>
                            {currentQuestion.difficulty && (
                                <Chip
                                    size="small"
                                    label={currentQuestion.difficulty}
                                    color={
                                        currentQuestion.difficulty === 'easy' ? 'success' :
                                        currentQuestion.difficulty === 'hard' ? 'error' : 'warning'
                                    }
                                />
                            )}
                            {currentQuestion.topic && (
                                <Chip size="small" label={currentQuestion.topic} variant="outlined" />
                            )}
                        </Stack>
                    </Box>

                    <Typography variant="h6" sx={{ mt: 2, mb: 3, lineHeight: 1.6 }}>
                        {currentQuestion.question_text}
                    </Typography>

                    <RadioGroup
                        value={currentAnswer || ''}
                        onChange={(e) => handleSelectAnswer(currentQuestion._id, e.target.value)}
                    >
                        {currentQuestion.options?.map((option: any) => (
                            <Paper
                                key={option.id}
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    mb: 1.5,
                                    borderRadius: 2,
                                    cursor: currentResult ? 'default' : 'pointer',
                                    transition: 'all 0.2s',
                                    borderColor: currentResult
                                        ? option.id === currentResult.correct_answer
                                            ? 'success.main'
                                            : option.id === currentAnswer && !currentResult.is_correct
                                                ? 'error.main'
                                                : 'divider'
                                        : currentAnswer === option.id
                                            ? 'primary.main'
                                            : 'divider',
                                    bgcolor: currentResult
                                        ? option.id === currentResult.correct_answer
                                            ? 'success.50'
                                            : option.id === currentAnswer && !currentResult.is_correct
                                                ? 'error.50'
                                                : 'transparent'
                                        : currentAnswer === option.id
                                            ? 'primary.50'
                                            : 'transparent',
                                    '&:hover': currentResult ? {} : {
                                        borderColor: 'primary.main',
                                        bgcolor: 'action.hover',
                                    },
                                }}
                            >
                                <FormControlLabel
                                    value={option.id}
                                    control={<Radio disabled={!!currentResult} />}
                                    label={option.text}
                                    sx={{ width: '100%', m: 0 }}
                                />
                            </Paper>
                        ))}
                    </RadioGroup>

                    {/* Result feedback */}
                    {currentResult && (
                        <Alert
                            severity={currentResult.is_correct ? 'success' : 'error'}
                            icon={currentResult.is_correct ? <CheckIcon /> : <WrongIcon />}
                            sx={{ mt: 2, borderRadius: 2 }}
                        >
                            <Typography variant="subtitle2">
                                {currentResult.is_correct ? 'Correct! 🎉' : 'Incorrect'}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {currentResult.explanation}
                            </Typography>
                        </Alert>
                    )}
                </Paper>

                {/* Navigation */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                        variant="outlined"
                        startIcon={<PrevIcon />}
                        onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                        disabled={currentIndex === 0}
                    >
                        Previous
                    </Button>

                    {!currentResult && currentAnswer ? (
                        <Button
                            variant="contained"
                            endIcon={<SubmitIcon />}
                            onClick={handleSubmitAnswer}
                            color="primary"
                        >
                            Submit Answer
                        </Button>
                    ) : currentIndex < questions.length - 1 ? (
                        <Button
                            variant="contained"
                            endIcon={<NextIcon />}
                            onClick={() => setCurrentIndex(currentIndex + 1)}
                        >
                            Next Question
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleEndSession}
                            endIcon={<FlagIcon />}
                        >
                            Finish Session
                        </Button>
                    )}
                </Box>

                {/* Question nav dots */}
                <Paper sx={{ p: 2, mt: 3, borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Question Navigator
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                        {questions.map((q: any, i: number) => (
                            <IconButton
                                key={i}
                                size="small"
                                onClick={() => setCurrentIndex(i)}
                                sx={{
                                    width: 36,
                                    height: 36,
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    border: '2px solid',
                                    borderColor: i === currentIndex
                                        ? 'primary.main'
                                        : results[q._id]
                                            ? results[q._id].is_correct ? 'success.main' : 'error.main'
                                            : answers[q._id] ? 'info.main' : 'divider',
                                    bgcolor: results[q._id]
                                        ? results[q._id].is_correct ? 'success.light' : 'error.light'
                                        : 'transparent',
                                    color: results[q._id] ? 'white' : 'text.primary',
                                }}
                            >
                                {i + 1}
                            </IconButton>
                        ))}
                    </Stack>
                </Paper>
            </Box>
        );
    }

    // ─── Results Screen ─────────────────────────────────
    if (showResults && sessionResults) {
        return (
            <Box>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Practice Results 🎯
                </Typography>

                <Paper sx={{ p: 4, mb: 4, borderRadius: 3, textAlign: 'center' }}>
                    <Typography variant="h1" color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
                        {sessionResults.score}%
                    </Typography>

                    <Grid container spacing={2} sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
                        {[
                            { label: 'Correct', value: sessionResults.correct, color: 'success.main' },
                            { label: 'Wrong', value: sessionResults.wrong, color: 'error.main' },
                            { label: 'Skipped', value: sessionResults.skipped, color: 'warning.main' },
                            { label: 'Points', value: `+${sessionResults.points_earned}`, color: 'primary.main' },
                        ].map((stat) => (
                            <Grid item xs={3} key={stat.label}>
                                <Typography variant="h4" sx={{ color: stat.color, fontWeight: 'bold' }}>
                                    {stat.value}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {stat.label}
                                </Typography>
                            </Grid>
                        ))}
                    </Grid>

                    <Stack direction="row" spacing={2} justifyContent="center">
                        <Button
                            variant="contained"
                            startIcon={<PlayIcon />}
                            onClick={() => {
                                setShowResults(false);
                                setSessionResults(null);
                            }}
                        >
                            Practice Again
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/dashboard')}
                        >
                            Back to Dashboard
                        </Button>
                    </Stack>
                </Paper>
            </Box>
        );
    }

    return null;
}

// ─── Mock Question Generator (for offline/demo use) ──
function generateMockQuestions(count: number) {
    const mockBank = [
        {
            _id: 'mock-1',
            question_text: 'A can complete a work in 12 days and B can complete the same work in 18 days. If they work together, in how many days will they complete the work?',
            question_type: 'multiple_choice',
            topic: 'Time & Work',
            difficulty: 'easy',
            options: [
                { id: 'a', text: '6.2 days' },
                { id: 'b', text: '7.2 days' },
                { id: 'c', text: '8 days' },
                { id: 'd', text: '5.5 days' },
            ],
            correct_answer: 'b',
            explanation: '1/12 + 1/18 = (3+2)/36 = 5/36. Time = 36/5 = 7.2 days',
            points: 10,
        },
        {
            _id: 'mock-2',
            question_text: 'A shopkeeper bought an article for ₹500 and sold it for ₹600. What is the profit percentage?',
            question_type: 'multiple_choice',
            topic: 'Profit & Loss',
            difficulty: 'easy',
            options: [
                { id: 'a', text: '15%' },
                { id: 'b', text: '20%' },
                { id: 'c', text: '25%' },
                { id: 'd', text: '10%' },
            ],
            correct_answer: 'b',
            explanation: 'Profit = 600-500 = 100. Profit% = (100/500)×100 = 20%',
            points: 10,
        },
        {
            _id: 'mock-3',
            question_text: 'The ratio of boys to girls in a class is 3:5. If there are 24 boys, how many girls are there?',
            question_type: 'multiple_choice',
            topic: 'Ratio & Proportion',
            difficulty: 'easy',
            options: [
                { id: 'a', text: '30' },
                { id: 'b', text: '35' },
                { id: 'c', text: '40' },
                { id: 'd', text: '45' },
            ],
            correct_answer: 'c',
            explanation: '3/5 = 24/x → x = (24×5)/3 = 40 girls',
            points: 10,
        },
        {
            _id: 'mock-4',
            question_text: 'What is the probability of getting a sum of 7 when two dice are thrown?',
            question_type: 'multiple_choice',
            topic: 'Probability',
            difficulty: 'medium',
            options: [
                { id: 'a', text: '1/6' },
                { id: 'b', text: '5/36' },
                { id: 'c', text: '1/9' },
                { id: 'd', text: '7/36' },
            ],
            correct_answer: 'a',
            explanation: 'Favorable outcomes: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6. Total = 36. P = 6/36 = 1/6',
            points: 10,
        },
        {
            _id: 'mock-5',
            question_text: 'If the simple interest on a sum of money for 3 years at 8% per annum is ₹2400, what is the principal?',
            question_type: 'multiple_choice',
            topic: 'Simple Interest',
            difficulty: 'medium',
            options: [
                { id: 'a', text: '₹8000' },
                { id: 'b', text: '₹10000' },
                { id: 'c', text: '₹12000' },
                { id: 'd', text: '₹9000' },
            ],
            correct_answer: 'b',
            explanation: 'SI = PRT/100 → 2400 = P×8×3/100 → P = 2400×100/24 = ₹10000',
            points: 10,
        },
    ];

    // Repeat and shuffle to fill count
    const result: any[] = [];
    for (let i = 0; i < count; i++) {
        const q = { ...mockBank[i % mockBank.length], _id: `mock-${i + 1}` };
        result.push(q);
    }
    return result;
}
