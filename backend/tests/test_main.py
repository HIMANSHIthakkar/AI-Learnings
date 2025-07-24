import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
import os
import sys

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

client = TestClient(app)

@pytest.fixture
def sample_study_request():
    return {
        "subject": "JavaScript Fundamentals",
        "hoursPerDay": 2,
        "totalDays": 7,
        "email": "test@example.com"
    }

@pytest.fixture
def sample_study_response():
    return {
        "subject": "JavaScript Fundamentals",
        "hoursPerDay": 2,
        "totalDays": 7,
        "overview": "This is a comprehensive JavaScript study plan.",
        "topics": [
            {
                "title": "Variables and Data Types",
                "summary": "Learn about JavaScript variables",
                "priority": "high",
                "difficulty": "easy",
                "estimatedHours": 2,
                "keyPoints": ["var, let, const", "data types"],
                "resources": ["MDN Documentation"]
            },
            {
                "title": "Functions",
                "summary": "Learn about JavaScript functions",
                "priority": "high",
                "difficulty": "medium",
                "estimatedHours": 3,
                "keyPoints": ["function declaration", "arrow functions"],
                "resources": ["JavaScript.info"]
            },
            {
                "title": "Objects",
                "summary": "Learn about JavaScript objects",
                "priority": "medium",
                "difficulty": "medium",
                "estimatedHours": 2,
                "keyPoints": ["object literal", "properties"],
                "resources": ["Eloquent JavaScript"]
            },
            {
                "title": "Arrays",
                "summary": "Learn about JavaScript arrays",
                "priority": "medium",
                "difficulty": "easy",
                "estimatedHours": 2,
                "keyPoints": ["array methods", "iteration"],
                "resources": ["Array methods guide"]
            },
            {
                "title": "DOM Manipulation",
                "summary": "Learn about DOM manipulation",
                "priority": "low",
                "difficulty": "medium",
                "estimatedHours": 3,
                "keyPoints": ["querySelector", "event listeners"],
                "resources": ["DOM tutorial"]
            }
        ],
        "timetable": [
            {
                "sessions": [
                    {
                        "topic": "Variables and Data Types",
                        "duration": 2,
                        "priority": "high",
                        "description": "Study Variables and Data Types",
                        "suggestedTime": "9:00 AM - 11:00 AM",
                        "activities": ["Read concepts", "Practice exercises"]
                    }
                ],
                "notes": "First day! Start strong."
            }
        ],
        "email": "test@example.com"
    }

def test_root():
    """Test the root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Study Guide Generator API", "status": "running"}

def test_health_check():
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "timestamp" in data
    assert "openai_configured" in data

@patch('services.study_guide_generator.StudyGuideGenerator.generate_complete_plan')
def test_generate_study_guide_success(mock_generate, sample_study_request, sample_study_response):
    """Test successful study guide generation."""
    
    # Mock the service response
    mock_generate.return_value = sample_study_response
    
    response = client.post("/api/study-guide/generate", json=sample_study_request)
    
    assert response.status_code == 200
    data = response.json()
    assert data["subject"] == "JavaScript Fundamentals"
    assert len(data["topics"]) >= 5
    assert data["hoursPerDay"] == 2
    assert data["totalDays"] == 7

def test_generate_study_guide_empty_subject():
    """Test error when subject is empty."""
    request_data = {
        "subject": "",
        "hoursPerDay": 2,
        "totalDays": 7
    }
    
    response = client.post("/api/study-guide/generate", json=request_data)
    assert response.status_code == 400
    assert "Subject name is required" in response.json()["detail"]

def test_generate_study_guide_zero_hours():
    """Test error when hours per day is 0."""
    request_data = {
        "subject": "Test Subject",
        "hoursPerDay": 0,
        "totalDays": 7
    }
    
    response = client.post("/api/study-guide/generate", json=request_data)
    assert response.status_code == 422  # Validation error

def test_generate_study_guide_too_many_hours():
    """Test error when hours per day exceeds limit."""
    request_data = {
        "subject": "Test Subject", 
        "hoursPerDay": 15,
        "totalDays": 7
    }
    
    response = client.post("/api/study-guide/generate", json=request_data)
    assert response.status_code == 422  # Validation error

@patch('services.study_guide_generator.StudyGuideGenerator.generate_complete_plan')
def test_generate_study_guide_insufficient_topics(mock_generate, sample_study_request):
    """Test error when generated guide has less than 5 topics."""
    
    # Mock response with only 2 topics
    mock_response = {
        "subject": "Test Subject",
        "hoursPerDay": 2,
        "totalDays": 7,
        "topics": [
            {"title": "Topic 1", "summary": "Summary 1", "priority": "high", "difficulty": "easy", "estimatedHours": 1},
            {"title": "Topic 2", "summary": "Summary 2", "priority": "medium", "difficulty": "medium", "estimatedHours": 1}
        ],
        "timetable": [{"sessions": []}]
    }
    
    mock_generate.return_value = mock_response
    
    response = client.post("/api/study-guide/generate", json=sample_study_request)
    
    assert response.status_code == 422
    assert "at least 5 topics" in response.json()["detail"]

@patch('services.study_guide_generator.StudyGuideGenerator.generate_complete_plan')
def test_generate_study_guide_exceeds_daily_hours(mock_generate, sample_study_request):
    """Test error when timetable exceeds daily study hours."""
    
    # Mock response with sessions exceeding daily hours
    mock_response = {
        "subject": "Test Subject",
        "hoursPerDay": 2,
        "totalDays": 7,
        "topics": [
            {"title": f"Topic {i}", "summary": f"Summary {i}", "priority": "high", "difficulty": "easy", "estimatedHours": 1}
            for i in range(5)
        ],
        "timetable": [
            {
                "sessions": [
                    {"topic": "Topic 1", "duration": 3, "priority": "high", "description": "Test"}
                ]
            }
        ]
    }
    
    mock_generate.return_value = mock_response
    
    response = client.post("/api/study-guide/generate", json=sample_study_request)
    
    assert response.status_code == 422
    assert "exceeds daily study hours" in response.json()["detail"]

def test_get_study_history():
    """Test getting study history."""
    response = client.get("/api/study-guide/history")
    assert response.status_code == 200
    assert "history" in response.json()

@patch('services.reminder_service.ReminderService.setup_reminders')
def test_setup_reminders(mock_setup):
    """Test setting up reminders."""
    mock_setup.return_value = "reminder_123"
    
    request_data = {
        "email": "test@example.com",
        "subject": "JavaScript",
        "timetable": [{"sessions": []}],
        "totalDays": 7
    }
    
    response = client.post("/api/reminders/setup", json=request_data)
    
    assert response.status_code == 200
    assert "Reminders setup successfully" in response.json()["message"]

if __name__ == "__main__":
    pytest.main([__file__])