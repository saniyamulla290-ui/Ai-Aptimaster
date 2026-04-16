@echo off
echo === AptiMaster AI Deployment Test ===
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)
echo ✅ Docker is running
echo.

echo Testing backend health endpoint...
curl -s -o nul -w "%%{http_code}" http://localhost:5000/health > backend_health.txt
set /p BACKEND_HEALTH=<backend_health.txt
del backend_health.txt

if "%BACKEND_HEALTH%"=="200" (
    echo ✅ Backend is healthy (HTTP %BACKEND_HEALTH%)
) else (
    echo ⚠️  Backend health check failed (HTTP %BACKEND_HEALTH%)
    echo    If you haven't started the backend, run: docker-compose up -d
)
echo.

echo Testing frontend accessibility...
curl -s -o nul -w "%%{http_code}" http://localhost:3000 > frontend_response.txt
set /p FRONTEND_RESPONSE=<frontend_response.txt
del frontend_response.txt

if "%FRONTEND_RESPONSE%"=="200" (
    echo ✅ Frontend is accessible (HTTP %FRONTEND_RESPONSE%)
) else if "%FRONTEND_RESPONSE%"=="304" (
    echo ✅ Frontend is accessible (HTTP %FRONTEND_RESPONSE%)
) else (
    echo ⚠️  Frontend accessibility check failed (HTTP %FRONTEND_RESPONSE%)
    echo    If you haven't started the frontend, run: docker-compose up -d
)
echo.

echo Testing MongoDB connection...
docker exec aptimaster-mongodb mongosh --quiet --eval "db.adminCommand('ping')" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB is running and accessible
) else (
    echo ⚠️  MongoDB connection test failed
    echo    Make sure MongoDB container is running: docker ps | findstr mongodb
)
echo.

echo === Deployment Test Complete ===
echo.
echo Access URLs:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:5000
echo   API Documentation: http://localhost:5000/api-docs
echo.
echo To start the full stack:
echo   docker-compose up -d
echo.
echo To view logs:
echo   docker-compose logs -f
echo.
echo To stop the stack:
echo   docker-compose down