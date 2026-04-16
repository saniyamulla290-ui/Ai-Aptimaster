import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Paper,
    Typography,
    TextField,
    Button,
    Avatar,
    Divider,
    Switch,
    FormControlLabel,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Chip,
    Stack,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    InputAdornment,
} from '@mui/material';
import {
    Person as PersonIcon,
    Save as SaveIcon,
    Logout as LogoutIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Lock as LockIcon,
    EmojiEvents as TrophyIcon,
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { authAPI, userAPI } from '../../services/api';

const branches = ['Mechanical', 'Civil', 'Electrical', 'Electronics', 'IT'];

export default function ProfilePage() {
    const navigate = useNavigate();
    const { user, logout, updateUser } = useAuth();

    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        branch: user?.branch || '',
        daily_target: user?.settings?.daily_target || 20,
        notifications: user?.settings?.notifications ?? true,
        theme: user?.settings?.theme || 'light',
    });
    const [passwordDialog, setPasswordDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [saving, setSaving] = useState(false);

    const handleSaveProfile = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await authAPI.updateProfile({
                name: formData.name,
                branch: formData.branch,
                settings: {
                    daily_target: formData.daily_target,
                    notifications: formData.notifications,
                    theme: formData.theme,
                },
            });

            updateUser({
                name: formData.name,
                branch: formData.branch,
                settings: {
                    daily_target: formData.daily_target,
                    notifications: formData.notifications,
                    theme: formData.theme,
                },
            });

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setEditing(false);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        try {
            await authAPI.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });

            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordDialog(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await userAPI.deleteAccount();
            await logout();
            navigate('/');
        } catch (err: any) {
            setMessage({ type: 'error', text: 'Failed to delete account' });
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                <PersonIcon sx={{ mr: 1, verticalAlign: 'bottom', color: 'primary.main' }} />
                Profile & Settings
            </Typography>

            {message.text && (
                <Alert severity={message.type as any} sx={{ mb: 3 }} onClose={() => setMessage({ type: '', text: '' })}>
                    {message.text}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Profile Card */}
                <Grid xs={12} md={4}>
                    <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                        <Avatar
                            sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: 40 }}
                        >
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </Avatar>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            {user?.name || 'Student'}
                        </Typography>
                        <Typography color="text.secondary" gutterBottom>
                            {user?.email}
                        </Typography>
                        <Chip label={`${user?.branch || 'N/A'} Engineering`} color="primary" variant="outlined" sx={{ mb: 2 }} />

                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={2}>
                            <Grid xs={4}>
                                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                                    {user?.streak || 0}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">Streak</Typography>
                            </Grid>
                            <Grid xs={4}>
                                <Typography variant="h5" color="secondary" sx={{ fontWeight: 'bold' }}>
                                    {user?.total_points || 0}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">Points</Typography>
                            </Grid>
                            <Grid xs={4}>
                                <Typography variant="h5" color="success.main" sx={{ fontWeight: 'bold' }}>
                                    {user?.level || 1}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">Level</Typography>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 2 }} />

                        <Stack spacing={1}>
                            <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout} fullWidth>
                                Logout
                            </Button>
                        </Stack>
                    </Paper>
                </Grid>

                {/* Settings */}
                <Grid xs={12} md={8}>
                    <Paper sx={{ p: 4, borderRadius: 3, mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                Account Settings
                            </Typography>
                            {!editing ? (
                                <Button startIcon={<EditIcon />} onClick={() => setEditing(true)}>Edit</Button>
                            ) : (
                                <Stack direction="row" spacing={1}>
                                    <Button onClick={() => setEditing(false)}>Cancel</Button>
                                    <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveProfile} disabled={saving}>
                                        {saving ? 'Saving...' : 'Save'}
                                    </Button>
                                </Stack>
                            )}
                        </Box>

                        <Grid container spacing={3}>
                            <Grid xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    disabled={!editing}
                                />
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <TextField fullWidth label="Email" value={user?.email || ''} disabled />
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <FormControl fullWidth disabled={!editing}>
                                    <InputLabel>Branch</InputLabel>
                                    <Select value={formData.branch} label="Branch" onChange={(e) => setFormData({ ...formData, branch: e.target.value })}>
                                        {branches.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <FormControl fullWidth disabled={!editing}>
                                    <InputLabel>Daily Target</InputLabel>
                                    <Select value={formData.daily_target} label="Daily Target" onChange={(e) => setFormData({ ...formData, daily_target: Number(e.target.value) })}>
                                        {[5, 10, 15, 20, 25, 30, 50].map((n) => (
                                            <MenuItem key={n} value={n}>{n} questions/day</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <FormControlLabel
                                    control={<Switch checked={formData.notifications} onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })} disabled={!editing} />}
                                    label="Email Notifications"
                                />
                            </Grid>
                            <Grid xs={12} sm={6}>
                                <FormControl fullWidth disabled={!editing}>
                                    <InputLabel>Theme</InputLabel>
                                    <Select value={formData.theme} label="Theme" onChange={(e) => setFormData({ ...formData, theme: e.target.value })}>
                                        <MenuItem value="light">Light</MenuItem>
                                        <MenuItem value="dark">Dark</MenuItem>
                                        <MenuItem value="system">System</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Security */}
                    <Paper sx={{ p: 4, borderRadius: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                            Security
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <Button variant="outlined" startIcon={<LockIcon />} onClick={() => setPasswordDialog(true)}>
                                Change Password
                            </Button>
                            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteDialog(true)}>
                                Delete Account
                            </Button>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            {/* Change Password Dialog */}
            <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="Current Password"
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <TextField
                            fullWidth
                            label="New Password"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Confirm New Password"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleChangePassword}>Change Password</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Account Dialog */}
            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete your account? This action cannot be undone.
                        All your progress, achievements, and data will be permanently lost.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDeleteAccount}>
                        Delete Permanently
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
