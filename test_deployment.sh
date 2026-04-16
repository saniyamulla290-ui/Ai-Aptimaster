#!/bin/bash

# Test script for AptiMaster AI deployment
echo "=== AptiMaster AI Deployment Test ==="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"

# Check if backend is accessible
echo ""
echo "Testing backend health endpoint..."
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health || echo "000")

if [ "$BACKEND_HEALTH" = "200" ]; then
    echo "✅ Backend is healthy (HTTP $BACKEND_HEALTH)"
else
    echo "⚠️  Backend health check failed (HTTP $BACKEND_HEALTH)"
    echo "   If you haven't started the backend, run: docker-compose up -d"
fi

# Check if frontend is accessible
echo ""
echo "Testing frontend accessibility..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")

if [ "$FRONTEND_RESPONSE" = "200" ] || [ "$FRONTEND_RESPONSE" = "304" ]; then
    echo "✅ Frontend is accessible (HTTP $FRONTEND_RESPONSE)"
else
    echo "⚠️  Frontend accessibility check failed (HTTP $FRONTEND_RESPONSE)"
    echo "   If you haven't started the frontend, run: docker-compose up -d"
fi

# Check MongoDB connection
echo ""
echo "Testing MongoDB connection..."
if docker exec aptimaster-mongodb mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB is running and accessible"
else
    echo "⚠️  MongoDB connection test failed"
    echo "   Make sure MongoDB container is running: docker ps | grep mongodb"
fi

echo ""
echo "=== Deployment Test Complete ==="
echo ""
echo "Access URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:5000"
echo "  API Documentation: http://localhost:5000/api-docs"
echo ""
echo "To start the full stack:"
echo "  docker-compose up -d"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop the stack:"
echo "  docker-compose down"