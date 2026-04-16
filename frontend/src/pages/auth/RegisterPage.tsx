import { useState } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper,
    Alert,
    InputAdornment,
    IconButton,
    CircularProgress,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email as EmailIcon,
    Lock as LockIcon,
    Person as PersonIcon,
    School as SchoolIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const branches = ['Mechanical', 'Civil', 'Electrical', 'Electronics', 'IT'];

export default function RegisterPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        branch: (location.state as any)?.branch || '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (field: string) => (e: any) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (!formData.branch) {
            setError('Please select your engineering branch');
            return;
        }

        setLoading(true);

        try {
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                branch: formData.branch,
            });
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 2, mb: 8 }}>
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
                    }}
                >
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <SchoolIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Create Account
                        </Typography>
                        <Typography color="text.secondary">
                            Start your placement preparation journey
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Full Name"
                            value={formData.name}
                            onChange={handleChange('name')}
                            required
                            sx={{ mb: 2.5 }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon color="action" />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={formData.email}
                            onChange={handleChange('email')}
                            required
                            sx={{ mb: 2.5 }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon color="action" />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <FormControl fullWidth sx={{ mb: 2.5 }}>
                            <InputLabel>Engineering Branch</InputLabel>
                            <Select
                                value={formData.branch}
                                label="Engineering Branch"
                                onChange={handleChange('branch')}
                                required
                            >
                                {branches.map((branch) => (
                                    <MenuItem key={branch} value={branch}>
                                        {branch} Engineering
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange('password')}
                            required
                            helperText="Min 8 chars with uppercase, lowercase, and number"
                            sx={{ mb: 2.5 }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Confirm Password"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange('confirmPassword')}
                            required
                            sx={{ mb: 3 }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon color="action" />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ py: 1.5, mb: 2, fontSize: '1rem' }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                        </Button>
                    </form>

                    <Divider sx={{ my: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                            or
                        </Typography>
                    </Divider>

                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Already have an account?{' '}
                            <Typography
                                component={RouterLink}
                                to="/login"
                                variant="body2"
                                color="primary"
                                sx={{ textDecoration: 'none', fontWeight: 'bold' }}
                            >
                                Sign In
                            </Typography>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}
