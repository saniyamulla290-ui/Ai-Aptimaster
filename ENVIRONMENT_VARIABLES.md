# Environment Variables Configuration

## Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Application
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://aptimaster-ai.vercel.app

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aptimaster?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_to_something_secure
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_change_this
JWT_REFRESH_EXPIRES_IN=30d

# Security
CORS_ORIGIN=https://aptimaster-ai.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FORMAT=combined

# API
API_PREFIX=/api/v1
API_VERSION=1.0.0
```

## Frontend Environment Variables

Create a `.env` file in the `frontend/` directory with:

```env
VITE_API_URL=https://aptimaster-backend.onrender.com/api/v1
VITE_APP_NAME=AptiMaster AI
VITE_APP_VERSION=1.0.0
```

## Deployment Platforms Configuration

### For Render.com
When deploying on Render, set these environment variables in the dashboard:

1. **NODE_ENV**: `production`
2. **PORT**: `10000` (Render automatically assigns a port, but keep this)
3. **MONGODB_URI**: Your MongoDB Atlas connection string
4. **JWT_SECRET**: A strong random string (generate with: `openssl rand -base64 32`)
5. **CORS_ORIGIN**: Your frontend URL (e.g., `https://aptimaster-ai.vercel.app`)

### For Vercel/Netlify (Frontend)
Set these environment variables:

1. **VITE_API_URL**: Your backend API URL (e.g., `https://aptimaster-backend.onrender.com/api/v1`)

## MongoDB Atlas Setup

### Step 1: Create a Free Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a free cluster (M0 tier)
4. Choose a cloud provider and region close to you

### Step 2: Create Database User
1. Go to "Database Access" → "Add New Database User"
2. Choose "Password" authentication
3. Create a username and strong password
4. Set privileges: "Read and write to any database"

### Step 3: Network Access
1. Go to "Network Access" → "Add IP Address"
2. Add `0.0.0.0/0` to allow access from anywhere (for development)
3. Or add your Render/Railway IP ranges for production

### Step 4: Get Connection String
1. Go to "Database" → "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `myFirstDatabase` with `aptimaster`

Example connection string:
```
mongodb+srv://username:password@cluster.mongodb.net/aptimaster?retryWrites=true&w=majority
```

## Generating Secure Secrets

### JWT Secret Generation
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### Quick Setup Script
Create a `setup-env.sh` file:
```bash
#!/bin/bash

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET=$JWT_SECRET"

# Generate refresh token secret
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"

echo "Copy these values to your .env file"
```

## Testing Environment Variables

### Backend Test
```bash
cd backend
npm run build
npm start
# Check if server starts without errors
```

### Frontend Test
```bash
cd frontend
npm run build
npm run preview
# Check if frontend can connect to backend
```

## Troubleshooting

### Common Issues
1. **MongoDB connection failed**: Check your connection string and network access
2. **CORS errors**: Ensure `CORS_ORIGIN` matches your frontend URL exactly
3. **JWT errors**: Verify `JWT_SECRET` is the same across all instances
4. **Port conflicts**: Render uses port 10000 by default for free tier

### Environment Variable Priority
1. Platform-specific environment variables (Render, Vercel, etc.)
2. `.env.production` file
3. `.env` file
4. Default values in code