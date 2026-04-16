import { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Typography,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    Stack,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Skeleton,
    Avatar,
    Divider,
} from '@mui/material';
import {
    Search as SearchIcon,
    Business as BusinessIcon,
    CalendarMonth as CalendarIcon,
    LocationOn as LocationIcon,
    OpenInNew as LinkIcon,
    WorkOutline as WorkIcon,
} from '@mui/icons-material';
import { companiesAPI } from '../../services/api';

const branches = ['All', 'Mechanical', 'Civil', 'Electrical', 'Electronics', 'IT'];

// Mock data for demo
const mockCompanies = [
    { _id: '1', name: 'Tata Motors', industry: 'Automotive', average_package: '₹6-8 LPA', logo_url: '', description: 'Leading automobile manufacturer', eligibility: { branches: ['Mechanical', 'Electrical'], minimum_cgpa: 6.5 }, is_featured: true, popularity_score: 95, metadata: { total_questions: 120 } },
    { _id: '2', name: 'Larsen & Toubro', industry: 'Construction & Engineering', average_package: '₹7-10 LPA', logo_url: '', description: 'Major technology and engineering conglomerate', eligibility: { branches: ['Civil', 'Mechanical', 'Electrical'], minimum_cgpa: 7.0 }, is_featured: true, popularity_score: 90, metadata: { total_questions: 95 } },
    { _id: '3', name: 'Infosys', industry: 'IT Services', average_package: '₹3.6-8 LPA', logo_url: '', description: 'Global leader in IT services and consulting', eligibility: { branches: ['IT', 'Electronics', 'Electrical'], minimum_cgpa: 6.0 }, is_featured: true, popularity_score: 88, metadata: { total_questions: 200 } },
    { _id: '4', name: 'BHEL', industry: 'Power & Energy', average_package: '₹8-12 LPA', logo_url: '', description: 'Largest power generation equipment manufacturer', eligibility: { branches: ['Mechanical', 'Electrical', 'Electronics'], minimum_cgpa: 6.5 }, is_featured: false, popularity_score: 82, metadata: { total_questions: 80 } },
    { _id: '5', name: 'Wipro', industry: 'IT Services', average_package: '₹3.5-6 LPA', logo_url: '', description: 'Leading global IT, consulting and business services', eligibility: { branches: ['IT', 'Electronics'], minimum_cgpa: 6.0 }, is_featured: false, popularity_score: 78, metadata: { total_questions: 150 } },
    { _id: '6', name: 'Siemens', industry: 'Industrial Manufacturing', average_package: '₹8-14 LPA', logo_url: '', description: 'Global technology and industrial manufacturing company', eligibility: { branches: ['Electrical', 'Electronics', 'Mechanical'], minimum_cgpa: 7.0 }, is_featured: true, popularity_score: 85, metadata: { total_questions: 110 } },
];

const mockHiringUpdates = [
    { company_name: 'Tata Motors', title: 'Campus Recruitment Drive 2026', registration_deadline: new Date('2026-05-01'), location: 'Pune', branches: ['Mechanical', 'Electrical'], positions: ['Graduate Engineer Trainee'], registration_link: '#' },
    { company_name: 'Infosys', title: 'InfyTQ Hiring 2026', registration_deadline: new Date('2026-04-28'), location: 'Bangalore', branches: ['IT', 'Electronics'], positions: ['Systems Engineer'], registration_link: '#' },
    { company_name: 'L&T', title: 'Pre-Placement Talk + Drive', registration_deadline: new Date('2026-05-10'), location: 'Mumbai', branches: ['Civil', 'Mechanical'], positions: ['Engineer Trainee'], registration_link: '#' },
];

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<any[]>(mockCompanies);
    const [hiringUpdates, setHiringUpdates] = useState<any[]>(mockHiringUpdates);
    const [search, setSearch] = useState('');
    const [branchFilter, setBranchFilter] = useState('All');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'companies' | 'hiring'>('companies');

    useEffect(() => {
        fetchData();
    }, [branchFilter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [companiesRes, hiringRes] = await Promise.all([
                companiesAPI.getCompanies({ branch: branchFilter === 'All' ? undefined : branchFilter }),
                companiesAPI.getHiringUpdates(branchFilter === 'All' ? undefined : branchFilter),
            ]);
            if (companiesRes.data.data?.length) setCompanies(companiesRes.data.data);
            if (hiringRes.data.data?.length) setHiringUpdates(hiringRes.data.data);
        } catch {
            // Keep mock data
        } finally {
            setLoading(false);
        }
    };

    const filteredCompanies = companies.filter((c) => {
        const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
        const matchesBranch = branchFilter === 'All' || c.eligibility?.branches?.includes(branchFilter);
        return matchesSearch && matchesBranch;
    });

    const daysUntil = (date: Date) => {
        const diff = new Date(date).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                <BusinessIcon sx={{ mr: 1, verticalAlign: 'bottom', color: 'primary.main' }} />
                Companies & Hiring
            </Typography>

            {/* Filters */}
            <Stack direction="row" spacing={2} sx={{ mb: 4, flexWrap: 'wrap' }} useFlexGap>
                <TextField
                    size="small"
                    placeholder="Search companies..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ minWidth: 250 }}
                    slotProps={{
                        input: {
                            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                        },
                    }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Branch</InputLabel>
                    <Select value={branchFilter} label="Branch" onChange={(e) => setBranchFilter(e.target.value)}>
                        {branches.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                    </Select>
                </FormControl>
                <Stack direction="row" spacing={1}>
                    <Chip label="Companies" color={activeTab === 'companies' ? 'primary' : 'default'} onClick={() => setActiveTab('companies')} clickable />
                    <Chip label="Hiring Updates" color={activeTab === 'hiring' ? 'primary' : 'default'} onClick={() => setActiveTab('hiring')} clickable />
                </Stack>
            </Stack>

            {/* Companies Tab */}
            {activeTab === 'companies' && (
                <Grid container spacing={3}>
                    {loading ? (
                        [1, 2, 3, 4, 5, 6].map((i) => (
                            <Grid xs={12} sm={6} md={4} key={i}><Skeleton variant="rounded" height={220} /></Grid>
                        ))
                    ) : (
                        filteredCompanies.map((company) => (
                            <Grid xs={12} sm={6} md={4} key={company._id}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 48, height: 48 }}>
                                                {company.name.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                                                    {company.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {company.industry}
                                                </Typography>
                                            </Box>
                                            {company.is_featured && <Chip size="small" label="Featured" color="warning" sx={{ ml: 'auto' }} />}
                                        </Box>

                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {company.description}
                                        </Typography>

                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                                            <Chip size="small" icon={<WorkIcon />} label={company.average_package || 'N/A'} variant="outlined" />
                                            <Chip size="small" label={`${company.metadata?.total_questions || 0} Q`} variant="outlined" color="primary" />
                                        </Stack>

                                        {company.eligibility?.branches && (
                                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                                {company.eligibility.branches.slice(0, 3).map((b: string) => (
                                                    <Chip key={b} size="small" label={b} sx={{ fontSize: 11 }} />
                                                ))}
                                                {company.eligibility.branches.length > 3 && (
                                                    <Chip size="small" label={`+${company.eligibility.branches.length - 3}`} sx={{ fontSize: 11 }} />
                                                )}
                                            </Stack>
                                        )}
                                    </CardContent>
                                    <CardActions sx={{ px: 2, pb: 2 }}>
                                        <Button size="small" variant="contained">Practice Questions</Button>
                                        <Button size="small" variant="outlined">View Details</Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            )}

            {/* Hiring Updates Tab */}
            {activeTab === 'hiring' && (
                <Grid container spacing={3}>
                    {hiringUpdates.map((update, index) => (
                        <Grid xs={12} md={6} key={index}>
                            <Card sx={{ borderRadius: 3, borderLeft: '4px solid', borderColor: daysUntil(update.registration_deadline) <= 3 ? 'error.main' : daysUntil(update.registration_deadline) <= 7 ? 'warning.main' : 'success.main' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                {update.company_name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {update.title}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            size="small"
                                            icon={<CalendarIcon />}
                                            label={`${daysUntil(update.registration_deadline)} days left`}
                                            color={daysUntil(update.registration_deadline) <= 3 ? 'error' : 'primary'}
                                        />
                                    </Box>

                                    <Stack spacing={1}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LocationIcon fontSize="small" color="action" />
                                            <Typography variant="body2">{update.location}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <WorkIcon fontSize="small" color="action" />
                                            <Typography variant="body2">{update.positions?.join(', ')}</Typography>
                                        </Box>
                                    </Stack>

                                    <Stack direction="row" spacing={0.5} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
                                        {update.branches?.map((b: string) => (
                                            <Chip key={b} size="small" label={b} variant="outlined" />
                                        ))}
                                    </Stack>
                                </CardContent>
                                <Divider />
                                <CardActions sx={{ px: 2 }}>
                                    <Button size="small" variant="contained" endIcon={<LinkIcon />} href={update.registration_link} target="_blank">
                                        Apply Now
                                    </Button>
                                    <Button size="small" variant="outlined" startIcon={<CalendarIcon />}>
                                        Add to Calendar
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}
