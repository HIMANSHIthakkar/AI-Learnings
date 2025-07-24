from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Literal
from datetime import datetime

class StudyRequest(BaseModel):
    subject: str = Field(..., min_length=2, max_length=200)
    hoursPerDay: float = Field(..., gt=0, le=12)
    totalDays: int = Field(default=7, ge=1, le=30)
    email: Optional[EmailStr] = None

    @validator('subject')
    def validate_subject(cls, v):
        if not v.strip():
            raise ValueError('Subject cannot be empty')
        return v.strip()

class Topic(BaseModel):
    title: str
    summary: str
    priority: Literal['high', 'medium', 'low']
    difficulty: Literal['easy', 'medium', 'hard']
    estimatedHours: float
    keyPoints: Optional[List[str]] = []
    resources: Optional[List[str]] = []

class StudySession(BaseModel):
    topic: str
    duration: float
    priority: Literal['high', 'medium', 'low']
    description: str
    suggestedTime: Optional[str] = None
    activities: Optional[List[str]] = []

class DayPlan(BaseModel):
    sessions: List[StudySession]
    notes: Optional[str] = None

class StudyResponse(BaseModel):
    subject: str
    hoursPerDay: float
    totalDays: int
    overview: Optional[str] = None
    topics: List[Topic]
    timetable: List[DayPlan]
    email: Optional[str] = None
    generatedAt: datetime = Field(default_factory=datetime.now)

class ReminderRequest(BaseModel):
    email: EmailStr
    subject: str
    timetable: List[DayPlan]
    totalDays: int