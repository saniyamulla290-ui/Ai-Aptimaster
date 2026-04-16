#!/bin/bash

# AptiMaster AI Quick Deployment Script
# This script guides you through deploying the full-stack application

echo "========================================="
echo "AptiMaster AI Deployment Assistant"
echo "========================================="

# Check for required tools
echo "Checking prerequisites..."
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "⚠️  Node.js is not installed. Some builds may fail."
fi

echo "✅ Prerequisites check complete"

echo ""
echo "📦 Project Information:"
echo "GitHub Repository: https://github.com/saniyamulla290-ui/Ai-Aptimaster"
echo ""

echo "🚀 Deployment Steps:"
echo "1. MongoDB Atlas Setup (Database)"
echo "2. Backend Deployment (Render/Railway)"
echo "3. Frontend Deployment (Vercel/Netlify)"
echo ""

# Step 1: MongoDB Setup
echo "📊 STEP 1: MongoDB Atlas Setup"
echo "--------------------------------"
echo "1. Go to https://mongodb.com/cloud/atlas"
echo "2. Sign up for a free account"
echo "3. Create a free cluster (M0 tier)"
echo "4. Create database user with read/write permissions"
echo "5. Add network access: 0.0.0.0/0 (allow all IPs)"
echo "6. Get your connection string"
echo ""
read -p "Have you completed MongoDB setup? (y/n): " mongo_done

if [[ $mongo_done != "y" && $mongo_done != "Y" ]]; then
    echo "Please complete MongoDB setup first, then run this script again."
    exit 0
fi

# Step 2: Backend Deployment
echo ""
echo "⚙️  STEP 2: Backend Deployment on Render"
echo "----------------------------------------"
echo "1. Go to https://render.com"
echo "2. Sign up with GitHub"
echo "3. Click 'New +' → 'Web Service'"
echo "4. Connect to GitHub repository: saniyamulla290-ui/Ai-Aptimaster"
echo "5. Configure:"
echo "   - Name: aptimaster-backend"
echo "   - Environment: Node"
echo "   - Build Command: cd backend && npm install && npm run build"
echo "   - Start Command: cd backend && npm start"
echo "   - Plan: Free"
echo "6. Add Environment Variables:"
echo "   - NODE_ENV=production"
echo "   - PORT=10000"
echo "   - MONGODB_URI=your_mongodb_connection_string"
echo "   - JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo 'generate_a_secure_random_string')"
echo "   - CORS_ORIGIN=https://aptimaster-ai.vercel.app"
echo "7. Click 'Create Web Service'"
echo ""
read -p "Have you deployed the backend? (y/n): " backend_done

if [[ $backend_done != "y" && $backend_done != "Y" ]]; then
    echo "Please deploy the backend on Render first."
    exit 0
fi

# Step 3: Frontend Deployment
echo ""
echo "🎨 STEP 3: Frontend Deployment on Vercel"
echo "----------------------------------------"
echo "1. Go to https://vercel.com"
echo "2. Sign up with GitHub"
echo "3. Click 'Add New Project'"
echo "4. Import GitHub repository: saniyamulla290-ui/Ai-Aptimaster"
echo "5. Configure:"
echo "   - Root Directory: frontend"
echo "   - Build Command: npm run build (auto-detected)"
echo "   - Output Directory: dist (auto-detected)"
echo "6. Add Environment Variable:"
echo "   - VITE_API_URL=https://your-backend-url.onrender.com/api/v1"
echo "7. Click 'Deploy'"
echo ""
read -p "Have you deployed the frontend? (y/n): " frontend_done

if [[ $frontend_done != "y" && $frontend_done != "Y" ]]; then
    echo "Please deploy the frontend on Vercel."
    exit 0
fi

echo ""
echo "✅ Deployment Complete!"
echo "======================"
echo ""
echo "Your live application links:"
echo "Frontend: https://aptimaster-ai.vercel.app (or your Vercel URL)"
echo "Backend: https://aptimaster-backend.onrender.com (or your Render URL)"
echo ""
echo "Test your deployment:"
echo "1. Backend health check: https://your-backend-url.onrender.com/api/v1/health"
echo "2. Frontend: Open your Vercel URL in browser"
echo ""
echo "For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo "For environment variables, see ENVIRONMENT_VARIABLES.md"