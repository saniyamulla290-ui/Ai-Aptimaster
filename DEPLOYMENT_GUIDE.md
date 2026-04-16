# AptiMaster AI Deployment Guide

## GitHub Repository
- **URL**: https://github.com/saniyamulla290-ui/Ai-Aptimaster
- **Status**: Code successfully pushed

## Frontend Deployment (React/Vite)

### Option 1: Vercel (Recommended - Easiest & Free)
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "Add New Project"
3. Import your GitHub repository: `saniyamulla290-ui/Ai-Aptimaster`
4. Configure project:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
5. Environment Variables:
   - Add `VITE_API_URL` = `https://aptimaster-backend.onrender.com/api/v1`
6. Click "Deploy"
7. Your site will be live at: `https://aptimaster-ai.vercel.app`

### Option 2: Netlify (Alternative Free Option)
1. Go to [netlify.com](https://netlify.com) and sign up with GitHub
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repository
4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Environment Variables:
   - Add `VITE_API_URL` = `https://aptimaster-backend.onrender.com/api/v1`
6. Click "Deploy site"
7. Your site will be live at: `https://your-site-name.netlify.app`

## Backend Deployment (Node.js/Express)

### Option 1: Render (Recommended - Free Tier)
1. Go to [render.com](https://render.com) and sign up
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure service:
   - **Name**: `aptimaster-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free
5. Environment Variables (add these):
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```
6. Click "Create Web Service"
7. Your backend will be live at: `https://aptimaster-backend.onrender.com`

### Option 2: Railway (Alternative Free Option)
1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables (same as above)
5. Railway will automatically detect it's a Node.js app
6. Your backend will be live at a generated URL

## Database (MongoDB)

### Option 1: MongoDB Atlas (Free Tier)
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Create a database user with read/write permissions
4. Get your connection string
5. Whitelist IP addresses (0.0.0.0/0 for all)
6. Use the connection string in your backend environment variables

## Environment Variables

### Backend (.env file)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aptimaster
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

### Frontend (Vite)
```
VITE_API_URL=https://aptimaster-backend.onrender.com/api/v1
```

## Testing Deployment
1. After deploying both frontend and backend, test the API:
   - Backend health check: `https://aptimaster-backend.onrender.com/api/v1/health`
2. Test frontend:
   - Open your frontend URL
   - Check if it can connect to the backend API

## Troubleshooting
- **CORS errors**: Ensure `CORS_ORIGIN` includes your frontend URL
- **Database connection**: Check MongoDB Atlas connection string
- **Build failures**: Check Node.js version (use 18.x or 20.x)
- **Environment variables**: Verify all required variables are set

## Quick Start Commands
```bash
# Local development
cd backend && npm run dev
cd frontend && npm run dev

# Build for production
cd backend && npm run build
cd frontend && npm run build