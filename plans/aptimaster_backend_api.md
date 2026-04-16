# AptiMaster AI - Backend API Endpoints & Services

## Overview
This document details the complete REST API specification for the AptiMaster AI backend. The API follows RESTful principles with JSON request/response formats and uses JWT for authentication.

## Base URL
```
https://api.aptimaster.ai/v1
```
or for development:
```
http://localhost:5000/api/v1
```

## Authentication
All endpoints (except public ones) require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format
### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": { ... }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## API Endpoints

### 1. Authentication Endpoints

#### POST `/api/v1/auth/register`
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "branch": "Mechanical",
  "profile_picture": "https://example.com/photo.jpg" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "branch": "Mechanical"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    }
  }
}
```

#### POST `/api/v1/auth/login`
Authenticate user and return tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:** Same as register response.

#### POST `/api/v1/auth/refresh`
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token",
    "expiresIn": 3600
  }
}
```

#### POST `/api/v1/auth/logout`
Invalidate user tokens.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 2. User Management Endpoints

#### GET `/api/v1/users/profile`
Get current user's profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "branch": "Mechanical",
      "profile_picture": "https://example.com/photo.jpg",
      "streak": 7,
      "total_points": 1250,
      "level": 12,
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

#### PUT `/api/v1/users/profile`
Update user profile.

**Request Body:**
```json
{
  "name": "John Updated",
  "branch": "Electrical",
  "profile_picture": "https://new-photo.jpg"
}
```

**Response:** Updated user profile.

#### GET `/api/v1/users/progress`
Get user progress statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "progress": {
      "total_questions_attempted": 1250,
      "total_correct_answers": 975,
      "average_accuracy": 78.0,
      "average_time_per_question": 45.2,
      "streak": 7,
      "weak_topics": [
        {
          "topic": "Time & Work",
          "accuracy": 65.0,
          "last_practiced": "2024-01-14T10:30:00Z"
        }
      ]
    }
  }
}
```

#### GET `/api/v1/users/leaderboard`
Get user's position on leaderboard.

**Query Parameters:**
1. `period`: `daily`, `weekly`, `monthly`, `all_time` (default: `weekly`)
2. `branch`: Branch filter (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "leaderboard": {
      "period": "weekly",
      "branch": "Mechanical",
      "user_rank": 5,
      "user_points": 850,
      "top_users": [
        {
          "rank": 1,
          "user_id": "user_456",
          "name": "Alice Smith",
          "points": 1200,
          "accuracy": 85.5
        }
      ]
    }
  }
}
```

### 3. Questions Endpoints

#### GET `/api/v1/questions`
Get questions with filtering.

**Query Parameters:**
1. `branch`: Filter by branch
2. `company`: Filter by company
3. `topic`: Filter by topic
4. `difficulty`: `easy`, `medium`, `hard`
5. `limit`: Number of questions (default: 20)
6. `page`: Page number (default: 1)
7. `exclude_attempted`: `true`/`false` (default: `false`)

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "q_123",
        "question_text": "A can do a piece of work in 10 days...",
        "options": ["5 days", "6 days", "8 days", "10 days"],
        "topic": "Time & Work",
        "difficulty": "medium",
        "company": "Tata Motors",
        "time_estimate": 60
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "pages": 8
    }
  }
}
```

#### GET `/api/v1/questions/:id`
Get specific question with details.

**Response:**
```json
{
  "success": true,
  "data": {
    "question": {
      "id": "q_123",
      "question_text": "A can do a piece of work in 10 days...",
      "options": ["5 days", "6 days", "8 days", "10 days"],
      "explanation": "1/10 + 1/15 = 1/6, so 6 days...",
      "trick": "Use formula 1/(1/a + 1/b)",
      "topic": "Time & Work",
      "difficulty": "medium",
      "company": "Tata Motors",
      "tags": ["work", "time", "collaboration"],
      "correct_rate": 65.2
    }
  }
}
```

#### GET `/api/v1/questions/topics`
Get all available topics.

**Response:**
```json
{
  "success": true,
  "data": {
    "topics": [
      {
        "name": "Time & Work",
        "question_count": 150,
        "average_difficulty": "medium"
      },
      {
        "name": "Profit & Loss",
        "question_count": 120,
        "average_difficulty": "easy"
      }
    ]
  }
}
```

#### POST `/api/v1/questions/generate`
Generate AI question.

**Request Body:**
```json
{
  "topic": "Time & Work",
  "difficulty": "medium",
  "branch": "Mechanical",
  "company": "Tata Motors"
}
```

**Response:** Generated question with explanation.

### 4. Practice Session Endpoints

#### POST `/api/v1/practice/sessions`
Start a new practice session.

**Request Body:**
```json
{
  "branch": "Mechanical",
  "company": "Tata Motors",
  "topic": "Time & Work",
  "difficulty": "medium",
  "question_count": 20,
  "time_limit": 1800 // seconds, optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session_123",
      "questions": [
        {
          "id": "q_123",
          "question_text": "...",
          "options": ["...", "...", "...", "..."],
          "topic": "Time & Work",
          "difficulty": "medium"
        }
      ],
      "metadata": {
        "branch": "Mechanical",
        "company": "Tata Motors",
        "question_count": 20,
        "time_limit": 1800,
        "started_at": "2024-01-15T10:30:00Z"
      }
    }
  }
}
```

#### POST `/api/v1/practice/sessions/:sessionId/submit`
Submit answers for a practice session.

**Request Body:**
```json
{
  "answers": [
    {
      "question_id": "q_123",
      "selected_option": 2,
      "time_taken": 45
    },
    {
      "question_id": "q_124",
      "selected_option": 0,
      "time_taken": 30
    }
  ],
  "completed_at": "2024-01-15T10:45:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": {
      "session_id": "session_123",
      "score": 85,
      "total_correct": 17,
      "total_incorrect": 3,
      "total_skipped": 0,
      "average_time": 37.5,
      "weak_topics": ["Time & Work"],
      "detailed_results": [
        {
          "question_id": "q_123",
          "correct": true,
          "correct_answer": 2,
          "selected_answer": 2,
          "time_taken": 45,
          "explanation": "..."
        }
      ]
    }
  }
}
```

#### GET `/api/v1/practice/sessions/:sessionId/results`
Get results of a completed session.

**Response:** Same as submit response.

#### GET `/api/v1/practice/history`
Get user's practice history.

**Query Parameters:**
1. `limit`: Number of records (default: 10)
2. `page`: Page number (default: 1)
3. `branch`: Filter by branch
4. `company`: Filter by company

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session_123",
        "branch": "Mechanical",
        "company": "Tata Motors",
        "question_count": 20,
        "score": 85,
        "completed_at": "2024-01-15T10:45:00Z",
        "time_taken": 750
      }
    ],
    "pagination": { ... }
  }
}
```

### 5. Companies & Branches Endpoints

#### GET `/api/v1/branches`
Get all available branches.

**Response:**
```json
{
  "success": true,
  "data": {
    "branches": [
      {
        "name": "Mechanical",
        "description": "Mechanical Engineering",
        "company_count": 5,
        "question_count": 250
      },
      {
        "name": "Civil",
        "description": "Civil Engineering",
        "company_count": 5,
        "question_count": 180
      }
    ]
  }
}
```

#### GET `/api/v1/branches/:branch/companies`
Get companies for a specific branch.

**Response:**
```json
{
  "success": true,
  "data": {
    "companies": [
      {
        "id": "company_123",
        "name": "Tata Motors",
        "description": "Automobile manufacturer",
        "logo_url": "https://logo.jpg",
        "question_count": 120,
        "hiring_status": "upcoming",
        "next_hiring_date": "2024-12-15T00:00:00Z"
      }
    ]
  }
}
```

#### GET `/api/v1/companies/:companyId`
Get detailed company information.

**Response:**
```json
{
  "success": true,
  "data": {
    "company": {
      "id": "company_123",
      "name": "Tata Motors",
      "description": "...",
      "website": "https://tatamotors.com",
      "hiring_dates": [
        {
          "role": "Graduate Engineer",
          "date": "2024-12-15T00:00:00Z",
          "apply_link": "https://careers.tatamotors.com",
          "status": "upcoming",
          "location": "Pune"
        }
      ],
      "question_stats": {
        "total": 120,
        "by_difficulty": {
          "easy": 40,
          "medium": 60,
          "hard": 20
        },
        "by_topic": {
          "Time & Work": 25,
          "Profit & Loss": 20
        }
      }
    }
  }
}
```

### 6. Hiring Tracker Endpoints

#### GET `/api/v1/hiring/upcoming`
Get upcoming hiring events.

**Query Parameters:**
1. `branch`: Filter by branch
2. `limit`: Number of events (default: 10)
3. `days_ahead`: Events within next N days (default: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "company_id": "company_123",
        "company_name": "Tata Motors",
        "role": "Graduate Engineer",
        "date": "2024-12-15T00:00:00Z",
        "apply_link": "https://careers.tatamotors.com",
        "status": "upcoming",
        "location": "Pune",
        "days_remaining": 3,
        "branch": "Mechanical"
      }
    ]
  }
}
```

#### POST `/api/v1/hiring/notifications`
Set hiring notification preferences.

**Request Body:**
```json
{
  "enabled": true,
  "notification_types": ["email", "push"],
  "reminder_days": [7, 3, 1],
  "branches": ["Mechanical", "Electrical"]
}
```

**Response:** Updated preferences.

#### POST `/api/v1/hiring/calendar`
Add hiring event to user's calendar.

**Request Body:**
```json
{
  "company_id": "company_123",
  "event_id": "event_456",
  "calendar_type": "google" // google, outlook, ical
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "calendar_link": "https://calendar.google.com/...",
    "message": "Event added to calendar"
  }
}
```

### 7. Daily Targets Endpoints

#### GET `/api/v1/targets/current`
Get current daily target.

**Response:**
```json
{
  "success": true,
  "data": {
    "target": {
      "day_number": 8,
      "target_questions": 30,
      "completed_questions": 15,
      "status": "in_progress",
      "streak_affected": true,
      "target_date": "2024-01-15T00:00:00Z",
      "suggested_topics": ["Time & Work", "Profit & Loss"]
    }
  }
}
```

#### POST `/api/v1/targets/update`
Update daily target progress.

**Request Body:**
```json
{
  "completed_questions": 20,
  "topics_covered": ["Time & Work", "Ratio & Proportion"]
}
```

**Response:** Updated target with streak status.

#### GET `/api/v1/targets/history`
Get target completion history.

**Query Parameters:**
1. `limit`: Number of days (default: 30)
2. `page`: Page number (default: 1)

**Response:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "date": "2024-01-14",
        "target_questions": 30,
        "completed_questions": 30,
        "status": "completed",
        "streak_maintained": true,
        "points_earned": 300
      }
    ],
    "stats": {
      "total_days": 45,
      "completed_days": 38,
      "completion_rate": 84.4,
      "current_streak": 7,
      "longest_streak": 12
    }
  }
}
```

### 8. Analytics Endpoints

#### GET `/api/v1/analytics/performance`
Get user performance analytics.

**Query Parameters:**
1. `time_range`: `7d`, `30d`, `90d`, `all` (default: `30d`)
2. `branch`: Filter by branch
3. `company`: Filter by company

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_sessions": 45,
      "total_questions": 1250,
      "average_accuracy": 78.0,
      "average_time": 42.3
    },
    "trends": {
      "accuracy": [
        { "