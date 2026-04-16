# AptiMaster AI - Frontend UI Structure & Wireframes

## Overview
This document details the frontend architecture, component structure, and wireframe designs for the AptiMaster AI platform. The frontend is built with React.js and TypeScript, using a component-based architecture.

## Technology Stack
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **Charts**: Recharts
- **Form Handling**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Testing**: Jest + React Testing Library
- **Build Tool**: Vite

## Project Structure
```
src/
├── assets/                 # Static assets (images, fonts, icons)
├── components/            # Reusable UI components
│   ├── common/           # Button, Input, Card, Modal, etc.
│   ├── layout/           # Header, Footer, Sidebar, etc.
│   ├── practice/         # Practice-specific components
│   ├── dashboard/        # Dashboard-specific components
│   └── hiring/           # Hiring tracker components
├── pages/                # Page components
│   ├── LandingPage/
│   ├── Dashboard/
│   ├── Practice/
│   ├── Results/
│   ├── HiringTracker/
│   └── Profile/
├── store/                # Redux store configuration
│   ├── slices/          # Redux slices (auth, questions, progress)
│   └── store.ts
├── services/             # API service layer
│   ├── api.ts           # Axios instance
│   ├── auth.service.ts
│   ├── questions.service.ts
│   └── progress.service.ts
├── hooks/                # Custom React hooks
├── utils/                # Utility functions
├── types/                # TypeScript type definitions
├── styles/               # Global styles and themes
├── constants/            # App constants
└── App.tsx               # Main App component
```

## Component Library

### Common Components
1. **Button**: Primary, secondary, outlined variants with loading states
2. **Input**: Text, number, select, with validation states
3. **Card**: Content containers with header, body, footer
4. **Modal**: Dialog modals with backdrop
5. **ProgressBar**: Linear and circular progress indicators
6. **Badge**: Status badges for achievements
7. **Tooltip**: Information tooltips
8. **Toast**: Notification toasts

### Layout Components
1. **Header**: App header with logo, navigation, user menu
2. **Sidebar**: Collapsible sidebar for navigation
3. **Footer**: App footer with links and copyright
4. **PageContainer**: Wrapper for page content with padding

## Screen Wireframes

### 1. Landing Page (`/`)
**Purpose**: Introduction to the app, branch selection, and user onboarding

**Layout**:
```
┌─────────────────────────────────────────────────┐
│  Logo                  Login | Sign Up           │
├─────────────────────────────────────────────────┤
│                                                   │
│          🎯 AptiMaster AI                         │
│          AI-Powered Placement Preparation        │
│                                                   │
│     [Start Your Journey]                         │
│                                                   │
│  Select Your Branch:                             │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐        │
│  │ Mech│ │Civil│ │ Elec│ │Elect│ │ IT  │        │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘        │
│                                                   │
│  Features:                                       │
│  • Company-Specific Questions                    │
│  • Adaptive Daily Targets                        │
│  • Hiring Tracker                                │
│  • AI-Powered Analytics                          │
│                                                   │
└─────────────────────────────────────────────────┘
```

### 2. Dashboard (`/dashboard`)
**Purpose**: User's home screen with progress overview

**Layout**:
```
┌─────────────────────────────────────────────────┐
│  Logo  Dashboard  Practice  Hiring  Profile     │
├─────────────────────────────────────────────────┤
│                                                   │
│  Welcome back, [User]!                           │
│  Streak: 🔥 7 days                               │
│                                                   │
│  ┌─────────────┐ ┌─────────────┐                │
│  │ Daily Target│ │ Weak Topics │                │
│  │  15/20 Q    │ │ • Time & Work               │
│  │ [Continue]  │ │ • Profit & Loss             │
│  └─────────────┘ └─────────────┘                │
│                                                   │
│  Upcoming Hiring:                                │
│  ┌─────────────────────────────────────────────┐ │
│  │ Tata Motors - 3 days left                   │ │
│  │ L&T - 5 days left                           │ │
│  │ Mahindra - 1 week left                      │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  Performance Graph:                              │
│  ┌─────────────────────────────────────────────┐ │
│  │ 📈 Accuracy trend over last 7 days         │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
└─────────────────────────────────────────────────┘
```

### 3. Branch Selection (`/practice/branch`)
**Purpose**: Select engineering branch for practice

**Layout**:
```
┌─────────────────────────────────────────────────┐
│  Logo  Dashboard  Practice  Hiring  Profile     │
├─────────────────────────────────────────────────┤
│                                                   │
│  Select Your Branch                              │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │ 🛠️  Mechanical Engineering                 │ │
│  │ Top companies: Tata, L&T, Mahindra          │ │
│  │ 250+ questions available                    │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │ 🏗️  Civil Engineering                      │ │
│  │ Top companies: L&T, DLF, NCC                │ │
│  │ 180+ questions available                    │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │ ⚡ Electrical Engineering                    │ │
│  │ Top companies: BHEL, Siemens, ABB           │ │
│  │ 200+ questions available                    │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  [Continue]                                       │
│                                                   │
└─────────────────────────────────────────────────┘
```

### 4. Company Selection (`/practice/company`)
**Purpose**: Select specific company within chosen branch

**Layout**:
```
┌─────────────────────────────────────────────────┐
│  Logo  Dashboard  Practice  Hiring  Profile     │
├─────────────────────────────────────────────────┤
│                                                   │
│  Mechanical Engineering → Select Company         │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │ Tata Motors                                │ │
│  │ 🏆 120 questions | Hiring: 3 days left     │ │
│  │ Your accuracy: 78%                         │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │ Larsen & Toubro (L&T)                       │ │
│  │ 🏆 95 questions | Hiring: 5 days left       │ │
│  │ Your accuracy: 82%                          │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │ Mahindra & Mahindra                         │ │
│  │ 🏆 85 questions | Hiring: 1 week left       │ │
│  │ Your accuracy: 65%                          │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  [Start Practice]                                 │
│                                                   │
└─────────────────────────────────────────────────┘
```

### 5. Practice Screen (`/practice/session`)
**Purpose**: Question answering interface with timer

**Layout**:
```
┌─────────────────────────────────────────────────┐
│  Logo  Timer: 14:25  Q: 5/20  [End Practice]    │
├─────────────────────────────────────────────────┤
│                                                   │
│  Question 5:                                     │
│  A can do a piece of work in 10 days and B can   │
│  do it in 15 days. In how many days will they    │
│  complete the work together?                     │
│                                                   │
│  Options:                                        │
│  ○ 5 days                                        │
│  ○ 6 days                                        │
│  ● 8 days                                        │
│  ○ 10 days                                       │
│                                                   │
│  [Mark for Review]  [Next Question]             │
│                                                   │
│  Question Navigation:                            │
│  ┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐                          │
│  │1│2│3│4│5│6│7│8│9│10│                         │
│  └─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘                          │
│  ● Answered  ○ Unanswered  ⚫ Marked             │
│                                                   │
│  [Submit Answers]                                │
│                                                   │
└─────────────────────────────────────────────────┘
```

### 6. Results Screen (`/practice/results`)
**Purpose**: Display practice session results and analysis

**Layout**:
```
┌─────────────────────────────────────────────────┐
│  Logo  Dashboard  Practice  Hiring  Profile     │
├─────────────────────────────────────────────────┤
│                                                   │
│  Practice Results - Tata Motors                  │
│  Score: 85% | Time: 24m 30s                     │
│                                                   │
│  Summary:                                        │
│  ┌─────────┬─────────┬─────────┬─────────┐      │
│  │ Correct │ Wrong   │ Skipped │ Total   │      │
│  │   17    │   3     │   0     │   20    │      │
│  └─────────┴─────────┴─────────┴─────────┘      │
│                                                   │
│  Topic-wise Performance:                         │
│  ┌─────────────────────────────────────────────┐ │
│  │ Time & Work        ████████░░ 80%          │ │
│  │ Profit & Loss      █████░░░░░ 60%          │ │
│  │ Ratio & Proportion ████████░░ 85%          │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  Solutions:                                       │
│  ┌─────────────────────────────────────────────┐ │
│  │ Q1: Correct answer is 6 days                │ │
│  │ Explanation: 1/10 + 1/15 = 1/6 → 6 days     │ │
│  │ Trick: Use formula 1/(1/a + 1/b)            │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  [Practice Again]  [View Weak Areas]  [Continue] │
│                                                   │
└─────────────────────────────────────────────────┘
```

### 7. Hiring Tracker (`/hiring`)
**Purpose**: Track upcoming campus hiring events

**Layout**:
```
┌─────────────────────────────────────────────────┐
│  Logo  Dashboard  Practice  Hiring  Profile     │
├─────────────────────────────────────────────────┤
│                                                   │
│  Campus Hiring Tracker                           │
│  Filter: [All] [Mechanical] [Civil] [Upcoming]   │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │ Tata Motors                                │ │
│  │ 🛠️ Mechanical | 📅 Dec 15, 2024           │ │
│  │ Location: Pune | Status: ⏳ Upcoming        │ │
│  │ [Apply Now] [Add to Calendar]              │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │ Larsen & Toubro                             │ │
│  │ 🏗️ Civil | 📅 Dec 20, 2024                 │ │
│  │ Location: Mumbai | Status: ⏳ Upcoming       │ │
│  │ [Apply Now] [Add to Calendar]               │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  ┌─────────────────────────────────────────────┐ │
│  │ Mahindra & Mahindra                         │ │
│  │ 🛠️ Mechanical | 📅 Jan 5, 2025             │ │
│  │ Location: Chennai | Status: ⏳ Upcoming      │ │
│  │ [Apply Now] [Add to Calendar]               │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
└─────────────────────────────────────────────────┘
```

### 8. Profile Screen (`/profile`)
**Purpose**: User profile, settings, and detailed statistics

**Layout**:
```
┌─────────────────────────────────────────────────┐
│  Logo  Dashboard  Practice  Hiring  Profile     │
├─────────────────────────────────────────────────┤
│                                                   │
│  👤 User Profile                                 │
│  Name: [Edit]                                    │
│  Email: user@example.com                         │
│  Branch: Mechanical Engineering                  │
│  Member since: Jan 2024                          │
│                                                   │
│  Statistics:                                     │
│  ┌─────────┬─────────┬─────────┬─────────┐      │
│  │ Total Q │ Accuracy│ Streak  │ Level   │      │
│  │  1,250  │   78%   │   7     │   12    │      │
│  └─────────┴─────────┴─────────┴─────────┘      │
│                                                   │
│  Achievements:                                   │
│  🏆 10-Day Streak  🥇 Top Performer  ⚡ Speedster│
│                                                   │
│  Settings:                                       │
│  [ ] Email Notifications                         │
│  [ ] Daily Reminders                             │
│  Daily Target: [20] questions                    │
│  Theme: [Light] [Dark] [System]                  │
│                                                   │
│  [Save Changes]  [Logout]                        │
│                                                   │
└─────────────────────────────────────────────────┘
```

## Responsive Design Breakpoints
- **Mobile**: < 768px (single column layout)
- **Tablet**: 768px - 1024px (two column layout)
- **Desktop**: > 1024px (full layout with sidebar)

## UI/UX Principles

### 1. Consistency
- Uniform spacing (8px grid system)
- Consistent typography scale
- Standardized color palette
- Reusable component patterns

### 2. Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast

### 3. Performance
- Lazy loading for routes
- Image optimization
- Code splitting
- Memoization for expensive computations

### 4. User Experience
- Clear visual hierarchy
- Progressive disclosure
- Immediate feedback for actions
- Error prevention and recovery

## Color Palette
- **Primary**: #3B82F6 (Blue-600)
- **Secondary**: #10B981 (Emerald-500)
- **Accent**: #F59E0B (Amber-500)
- **Background**: #F9FAFB (Gray-50)
- **Surface**: #FFFFFF (White)
- **Text Primary**: #111827 (Gray-900)
- **Text Secondary**: #6B7280 (Gray-500)
- **Error**: #EF4444 (Red-500)
- **Success**: #10B981 (Emerald-500)
- **Warning**: #F59E0B (Amber-500)

## Typography Scale
- **H1**: 2.5rem (40px) - Page titles
- **H2**: 2rem (32px) - Section headers
- **H3**: 1.5rem (24px) - Subsection headers
- **H4**: 1.25rem (20px) - Card titles
- **Body Large**: 1.125rem (18px) - Lead text
- **Body**: 1rem (16px) - Regular text
- **Body Small**: 0.875rem (14px) - Captions, labels
- **Caption**: 0.75rem (12px) - Metadata

## Animation Guidelines
- **Duration**: Short (100-300ms) for micro-interactions
- **Easing**: Cubic bezier for natural motion
- **Transitions**: Fade, slide, scale for state changes
- **Loading**: Skeleton screens for content loading

## State Management

### Redux Store Structure
```typescript
interface RootState {
  auth: AuthState;          // User authentication
  questions: QuestionsState; // Questions and practice
  progress: ProgressState;   // User progress and stats
  ui: UIState;              // UI state (loading, errors)
  hiring: HiringState;      // Hiring tracker data
}
```

### Key Actions
- `auth/login`: User login
- `questions/startSession`: Start practice session
- `questions/submitAnswer`: Submit answer to question
- `progress/updateStats`: Update user statistics
- `hiring/loadCompanies`: Load hiring companies

## API Integration

### Service Layer Pattern
```typescript
