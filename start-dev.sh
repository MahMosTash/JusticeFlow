#!/bin/bash
# Script to start both backend and frontend for development

echo "Starting Police Case Management System..."
echo ""

# Check if virtual environments exist
if [ ! -d "backend/venv" ]; then
    echo "Backend virtual environment not found. Please set it up first."
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start backend
echo "Starting backend server on http://localhost:8000..."
cd backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000 --settings=config.settings.development &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "Starting frontend server on http://localhost:3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Backend: http://localhost:8000"
echo "✅ Frontend: http://localhost:3000"
echo "✅ API Docs: http://localhost:8000/swagger/"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait

