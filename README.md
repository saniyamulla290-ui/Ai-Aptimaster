# AptiMaster AI – Multi-Branch Placement Prep System

A comprehensive AI-powered platform for engineering students to prepare for company-specific aptitude tests with personalized learning paths, adaptive daily targets, and performance analytics.

## Features

- **Company-Specific Questions**: Filter questions by engineering branch (Mechanical, Civil, Electrical, Electronics, IT)
- **Adaptive Daily Targets**: AI-powered daily practice goals based on performance
- **Hiring Updates**: Real-time company hiring notifications with auto-registration links
- **Performance Analytics**: Detailed progress tracking with weak area identification
- **Gamification**: Points, levels, streaks, and leaderboards
- **Personalized Recommendations**: AI-generated study plans and question sets

## Tech Stack

### Backend
- Node.js with Express.js
- TypeScript
- MongoDB with Mongoose ODM
- JWT authentication
- Winston logging

### Frontend
- React with TypeScript
- Material-UI (MUI)
- React Router
- TanStack Query
- Vite build tool

### AI/ML
- Python FastAPI (placeholder for future integration)
- OpenAI API for question generation
- Scikit-learn for performance analysis

## Project Structure

```
StudentGuide/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── config/         # Database and environment config
│   │   ├── controllers/    # Route controllers
│   │   ├── middlewares/    # Custom middleware
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── validators/     # Request validation
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── context/        # React context
│   ├── package.json
│   └── vite.config.ts
├── ai-service/             # Python AI service (placeholder)
├── docker/                 # Docker configuration
├── plans/                  # Architecture documentation
└── docker-compose.yml      # Full stack deployment
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Docker and Docker Compose (optional)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd StudentGuide
   ```

2. **Set up backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Set up frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api-docs

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Access services**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

3. **Stop services**
   ```bash
   docker-compose down
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user

### User Management
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update profile
- `GET /api/v1/users/progress` - Get user progress
- `GET /api/v1/users/leaderboard` - Get leaderboard

### Questions & Practice
- `GET /api/v1/questions` - Get questions with filters
- `POST /api/v1/questions/generate` - Generate AI-powered questions
- `POST /api/v1/questions/:id/submit` - Submit answer

### Analytics
- `GET /api/v1/analytics/dashboard` - Get dashboard stats
- `GET /api/v1/analytics/trends` - Get performance trends
- `GET /api/v1/analytics/topics` - Get topic analysis

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/aptimaster
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=30d
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## Development

### Running Tests
```bash
cd backend
npm test

cd ../frontend
npm test
```

### Building for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd ../frontend
npm run build
```

## Architecture Documentation

Detailed architecture plans are available in the `plans/` directory:
- `aptimaster_ai_architecture.md` - Complete system architecture
- `aptimaster_database_schema.md` - MongoDB schema design
- `aptimaster_frontend_ui.md` - UI wireframes and components
- `aptimaster_backend_api.md` - REST API specification
- `aptimaster_ai_features.md` - AI/ML implementation strategy
- `aptimaster_development_roadmap.md` - 10-week development plan

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Designed for engineering students preparing for campus placements
- Inspired by adaptive learning platforms and gamified education
- Built with modern full-stack technologies and best practices