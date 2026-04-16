import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Question } from '../models/Question.model';
import { Company } from '../models/Company.model';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aptimaster';

const sampleQuestions = [
    {
        question_text: 'A can complete a work in 12 days and B can complete the same work in 18 days. If they work together, in how many days will they complete the work?',
        question_type: 'multiple_choice',
        options: [
            { id: 'a', text: '6.2 days', is_correct: false },
            { id: 'b', text: '7.2 days', is_correct: true },
            { id: 'c', text: '8 days', is_correct: false },
            { id: 'd', text: '5.5 days', is_correct: false },
        ],
        correct_answer: 'b',
        explanation: '1/12 + 1/18 = (3+2)/36 = 5/36. Time = 36/5 = 7.2 days',
        difficulty: 'easy',
        topic: 'Time & Work',
        tags: ['aptitude', 'work', 'basic'],
        branch: ['Mechanical', 'Civil', 'Electrical', 'Electronics', 'IT'],
        company_tags: ['TCS', 'Infosys', 'Wipro'],
        time_limit: 60,
        points: 10,
    },
    {
        question_text: 'A shopkeeper bought an article for ₹500 and sold it for ₹600. What is the profit percentage?',
        question_type: 'multiple_choice',
        options: [
            { id: 'a', text: '15%', is_correct: false },
            { id: 'b', text: '20%', is_correct: true },
            { id: 'c', text: '25%', is_correct: false },
            { id: 'd', text: '10%', is_correct: false },
        ],
        correct_answer: 'b',
        explanation: 'Profit = 600-500 = 100. Profit% = (100/500)×100 = 20%',
        difficulty: 'easy',
        topic: 'Profit & Loss',
        tags: ['aptitude', 'profit'],
        branch: ['Mechanical', 'Civil', 'Electrical', 'Electronics', 'IT'],
        company_tags: ['TCS', 'L&T', 'Tata Motors'],
        time_limit: 60,
        points: 10,
    },
    {
        question_text: 'The ratio of boys to girls in a class is 3:5. If there are 24 boys, how many girls are there?',
        question_type: 'multiple_choice',
        options: [
            { id: 'a', text: '30', is_correct: false },
            { id: 'b', text: '35', is_correct: false },
            { id: 'c', text: '40', is_correct: true },
            { id: 'd', text: '45', is_correct: false },
        ],
        correct_answer: 'c',
        explanation: '3/5 = 24/x → x = (24×5)/3 = 40 girls',
        difficulty: 'easy',
        topic: 'Ratio & Proportion',
        tags: ['aptitude', 'ratio'],
        branch: ['Mechanical', 'Civil', 'Electrical', 'Electronics', 'IT'],
        company_tags: ['Infosys', 'Wipro'],
        time_limit: 60,
        points: 10,
    },
    {
        question_text: 'What is the probability of getting a sum of 7 when two dice are thrown?',
        question_type: 'multiple_choice',
        options: [
            { id: 'a', text: '1/6', is_correct: true },
            { id: 'b', text: '5/36', is_correct: false },
            { id: 'c', text: '1/9', is_correct: false },
            { id: 'd', text: '7/36', is_correct: false },
        ],
        correct_answer: 'a',
        explanation: 'Favorable outcomes: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6. Total = 36. P = 6/36 = 1/6',
        difficulty: 'medium',
        topic: 'Probability',
        tags: ['aptitude', 'probability'],
        branch: ['IT', 'Electronics', 'Electrical'],
        company_tags: ['TCS', 'Infosys', 'BHEL'],
        time_limit: 90,
        points: 15,
    },
    {
        question_text: 'A pipe can fill a tank in 6 hours. Due to a leak, the tank is filled in 8 hours. How long will the leak take to empty a full tank?',
        question_type: 'multiple_choice',
        options: [
            { id: 'a', text: '20 hours', is_correct: false },
            { id: 'b', text: '24 hours', is_correct: true },
            { id: 'c', text: '18 hours', is_correct: false },
            { id: 'd', text: '30 hours', is_correct: false },
        ],
        correct_answer: 'b',
        explanation: 'Leak rate = 1/6 - 1/8 = (4-3)/24 = 1/24. So leak empties in 24 hours.',
        difficulty: 'medium',
        topic: 'Time & Work',
        tags: ['aptitude', 'pipes'],
        branch: ['Mechanical', 'Civil'],
        company_tags: ['L&T', 'Tata Motors'],
        time_limit: 90,
        points: 15,
    },
    {
        question_text: 'A train 150m long is running at 60 km/h. How long will it take to cross a platform 250m long?',
        question_type: 'multiple_choice',
        options: [
            { id: 'a', text: '20 seconds', is_correct: false },
            { id: 'b', text: '24 seconds', is_correct: true },
            { id: 'c', text: '30 seconds', is_correct: false },
            { id: 'd', text: '15 seconds', is_correct: false },
        ],
        correct_answer: 'b',
        explanation: 'Total distance = 150+250 = 400m. Speed = 60×5/18 = 50/3 m/s. Time = 400/(50/3) = 24 seconds.',
        difficulty: 'medium',
        topic: 'Speed & Distance',
        tags: ['aptitude', 'trains'],
        branch: ['Mechanical', 'Civil', 'Electrical'],
        company_tags: ['BHEL', 'Siemens'],
        time_limit: 90,
        points: 15,
    },
    {
        question_text: 'In how many ways can 5 people be seated in a row?',
        question_type: 'multiple_choice',
        options: [
            { id: 'a', text: '60', is_correct: false },
            { id: 'b', text: '100', is_correct: false },
            { id: 'c', text: '120', is_correct: true },
            { id: 'd', text: '150', is_correct: false },
        ],
        correct_answer: 'c',
        explanation: '5! = 5×4×3×2×1 = 120',
        difficulty: 'easy',
        topic: 'Permutation & Combination',
        tags: ['aptitude', 'permutation'],
        branch: ['IT', 'Electronics'],
        company_tags: ['Infosys', 'Wipro', 'TCS'],
        time_limit: 60,
        points: 10,
    },
    {
        question_text: 'If x² - 5x + 6 = 0, what are the values of x?',
        question_type: 'multiple_choice',
        options: [
            { id: 'a', text: 'x = 1, x = 6', is_correct: false },
            { id: 'b', text: 'x = 2, x = 3', is_correct: true },
            { id: 'c', text: 'x = -2, x = -3', is_correct: false },
            { id: 'd', text: 'x = 1, x = 5', is_correct: false },
        ],
        correct_answer: 'b',
        explanation: 'x² - 5x + 6 = (x-2)(x-3) = 0, so x = 2 or x = 3',
        difficulty: 'easy',
        topic: 'Algebra',
        tags: ['aptitude', 'algebra', 'quadratic'],
        branch: ['IT', 'Electronics', 'Electrical'],
        company_tags: ['TCS', 'Wipro'],
        time_limit: 60,
        points: 10,
    },
    {
        question_text: 'A man invests ₹10,000 at 10% compound interest for 2 years. What is the amount he receives?',
        question_type: 'multiple_choice',
        options: [
            { id: 'a', text: '₹12,000', is_correct: false },
            { id: 'b', text: '₹12,100', is_correct: true },
            { id: 'c', text: '₹11,000', is_correct: false },
            { id: 'd', text: '₹12,500', is_correct: false },
        ],
        correct_answer: 'b',
        explanation: 'A = P(1+R/100)^n = 10000(1.1)² = 10000 × 1.21 = ₹12,100',
        difficulty: 'medium',
        topic: 'Compound Interest',
        tags: ['aptitude', 'interest', 'finance'],
        branch: ['Mechanical', 'Civil', 'Electrical', 'Electronics', 'IT'],
        company_tags: ['HDFC', 'ICICI', 'TCS'],
        time_limit: 90,
        points: 15,
    },
    {
        question_text: 'If the average of 5 numbers is 20, what is their sum?',
        question_type: 'multiple_choice',
        options: [
            { id: 'a', text: '80', is_correct: false },
            { id: 'b', text: '90', is_correct: false },
            { id: 'c', text: '100', is_correct: true },
            { id: 'd', text: '110', is_correct: false },
        ],
        correct_answer: 'c',
        explanation: 'Sum = Average × Count = 20 × 5 = 100',
        difficulty: 'easy',
        topic: 'Averages',
        tags: ['aptitude', 'averages', 'basic'],
        branch: ['Mechanical', 'Civil', 'Electrical', 'Electronics', 'IT'],
        company_tags: ['TCS', 'Infosys'],
        time_limit: 30,
        points: 5,
    },
];

const sampleCompanies = [
    {
        name: 'Tata Motors',
        description: 'Leading automobile manufacturer in India, part of the Tata Group.',
        website: 'https://www.tatamotors.com',
        industry: 'Automotive',
        average_package: '₹6-8 LPA',
        recruitment_process: ['Online Test', 'Technical Interview', 'HR Interview'],
        eligibility: { minimum_cgpa: 6.5, branches: ['Mechanical', 'Electrical', 'Electronics'], year_of_passing: [2026] },
        question_patterns: [
            { topic: 'Time & Work', weightage: 20, difficulty_distribution: { easy: 30, medium: 50, hard: 20 } },
            { topic: 'Profit & Loss', weightage: 15, difficulty_distribution: { easy: 40, medium: 40, hard: 20 } },
        ],
        hiring_updates: [
            {
                title: 'Campus Recruitment Drive 2026',
                description: 'Annual campus hiring for Graduate Engineer Trainees',
                registration_link: 'https://careers.tatamotors.com',
                registration_deadline: new Date('2026-05-15'),
                eligibility_criteria: ['B.Tech 2026 passout', 'CGPA >= 6.5', 'No active backlogs'],
                branches: ['Mechanical', 'Electrical'],
                positions: ['Graduate Engineer Trainee'],
                location: 'Pune',
                salary_range: '₹6-8 LPA',
                application_process: ['Register online', 'Online aptitude test', 'Technical interview', 'HR interview'],
                important_dates: [
                    { event: 'Registration Deadline', date: new Date('2026-05-15') },
                    { event: 'Online Test', date: new Date('2026-05-20') },
                ],
                is_active: true,
            },
        ],
        is_featured: true,
    },
    {
        name: 'Infosys',
        description: 'Global leader in next-generation digital services and consulting.',
        website: 'https://www.infosys.com',
        industry: 'IT Services',
        average_package: '₹3.6-8 LPA',
        recruitment_process: ['Online Test', 'Technical Interview', 'HR Interview'],
        eligibility: { minimum_cgpa: 6.0, branches: ['IT', 'Electronics', 'Electrical'], year_of_passing: [2026] },
        question_patterns: [
            { topic: 'Algebra', weightage: 25, difficulty_distribution: { easy: 20, medium: 50, hard: 30 } },
            { topic: 'Logical Reasoning', weightage: 30, difficulty_distribution: { easy: 20, medium: 40, hard: 40 } },
        ],
        hiring_updates: [
            {
                title: 'InfyTQ Hiring 2026',
                description: 'Hiring through InfyTQ certification program',
                registration_link: 'https://infytq.infosys.com',
                registration_deadline: new Date('2026-04-30'),
                eligibility_criteria: ['B.Tech 2026 passout', 'CGPA >= 6.0'],
                branches: ['IT', 'Electronics'],
                positions: ['Systems Engineer', 'Senior Systems Engineer'],
                location: 'Bangalore / Mysore',
                salary_range: '₹3.6-6.5 LPA',
                application_process: ['Register on InfyTQ', 'Complete certification', 'Online test', 'Interview'],
                important_dates: [
                    { event: 'Registration Deadline', date: new Date('2026-04-30') },
                ],
                is_active: true,
            },
        ],
        is_featured: true,
    },
    {
        name: 'Larsen & Toubro',
        description: 'Major technology, engineering, construction, manufacturing conglomerate.',
        website: 'https://www.larsentoubro.com',
        industry: 'Construction & Engineering',
        average_package: '₹7-10 LPA',
        recruitment_process: ['Pre-Placement Talk', 'Online Test', 'Technical + HR Interview'],
        eligibility: { minimum_cgpa: 7.0, branches: ['Civil', 'Mechanical', 'Electrical'], year_of_passing: [2026] },
        question_patterns: [
            { topic: 'Speed & Distance', weightage: 20, difficulty_distribution: { easy: 20, medium: 50, hard: 30 } },
            { topic: 'Time & Work', weightage: 25, difficulty_distribution: { easy: 30, medium: 40, hard: 30 } },
        ],
        hiring_updates: [],
        is_featured: true,
    },
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Question.deleteMany({});
        await Company.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Seed questions
        await Question.insertMany(sampleQuestions);
        console.log(`📝 Seeded ${sampleQuestions.length} questions`);

        // Seed companies
        await Company.insertMany(sampleCompanies);
        console.log(`🏢 Seeded ${sampleCompanies.length} companies`);

        console.log('\n✅ Database seeded successfully!');
    } catch (error) {
        console.error('❌ Seed failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seed();
