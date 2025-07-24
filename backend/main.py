from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import os
from dotenv import load_dotenv
import openai
import json
from datetime import datetime, timedelta
from services.openai_service import OpenAIService
from services.reminder_service import ReminderService
from services.study_guide_generator import StudyGuideGenerator
from models.study_models import StudyRequest, StudyResponse, ReminderRequest

load_dotenv()

app = FastAPI(
    title="Study Guide Generator API",
    description="AI-powered study guide and timetable generator",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
openai_service = OpenAIService()
reminder_service = ReminderService()
study_guide_generator = StudyGuideGenerator(openai_service)

# Serve static files (frontend) - check multiple possible paths
static_paths = ["../dist", "dist", "/app/static", "static"]
static_dir = None
index_file = None

for path in static_paths:
    if os.path.exists(path):
        static_dir = path
        potential_index = os.path.join(path, "index.html")
        if os.path.exists(potential_index):
            index_file = potential_index
            break

if static_dir:
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
async def root():
    # In production, serve the frontend
    if index_file and os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "Study Guide Generator API", "status": "running"}

@app.post("/api/study-guide/generate", response_model=StudyResponse)
async def generate_study_guide(request: StudyRequest):
    """Generate a comprehensive study guide and timetable."""
    try:
        # Validate input
        if not request.subject.strip():
            raise HTTPException(status_code=400, detail="Subject name is required")
        
        if request.hoursPerDay <= 0:
            raise HTTPException(status_code=400, detail="Hours per day must be greater than 0")
        
        if request.hoursPerDay > 12:
            raise HTTPException(status_code=400, detail="Hours per day cannot exceed 12")
        
        # Generate study guide
        result = await study_guide_generator.generate_complete_plan(request)
        
        # Validate output has at least 5 topics
        if len(result.topics) < 5:
            raise HTTPException(
                status_code=422, 
                detail="Generated study guide should have at least 5 topics"
            )
        
        # Validate timetable doesn't exceed daily hours
        for day in result.timetable:
            daily_hours = sum(session.duration for session in day.sessions)
            if daily_hours > request.hoursPerDay:
                raise HTTPException(
                    status_code=422,
                    detail="Generated timetable exceeds daily study hours limit"
                )
        
        # Setup reminders if email provided
        if request.email:
            try:
                await reminder_service.setup_reminders(request.email, result)
            except Exception as e:
                # Don't fail the whole request if reminders fail
                print(f"Failed to setup reminders: {e}")
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating study guide: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate study guide")

@app.post("/api/reminders/setup")
async def setup_reminders(request: ReminderRequest):
    """Setup daily study reminders."""
    try:
        result = await reminder_service.setup_reminders(request.email, request)
        return {"message": "Reminders setup successfully", "reminder_id": result}
    except Exception as e:
        print(f"Error setting up reminders: {e}")
        raise HTTPException(status_code=500, detail="Failed to setup reminders")

@app.get("/api/study-guide/history")
async def get_study_history():
    """Get study guide generation history."""
    # In a real app, this would fetch from a database
    return {"history": []}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "openai_configured": bool(os.getenv("OPENAI_API_KEY")),
        "static_dir": static_dir,
        "index_file": index_file
    }

# Catch-all route to serve frontend for SPA routing
@app.get("/{path:path}")
async def serve_frontend(path: str):
    if index_file and os.path.exists(index_file):
        return FileResponse(index_file)
    raise HTTPException(status_code=404, detail="Not found")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)