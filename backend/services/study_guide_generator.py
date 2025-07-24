from typing import List, Dict, Any
from models.study_models import StudyRequest, StudyResponse, Topic, StudySession, DayPlan
from services.openai_service import OpenAIService
import math

class StudyGuideGenerator:
    def __init__(self, openai_service: OpenAIService):
        self.openai_service = openai_service

    async def generate_complete_plan(self, request: StudyRequest) -> StudyResponse:
        """Generate a complete study plan with topics and timetable."""
        
        total_hours = request.hoursPerDay * request.totalDays
        
        # Generate topics using OpenAI
        topics_data = await self.openai_service.generate_study_topics(
            request.subject, 
            total_hours
        )
        
        # Convert to Topic objects
        topics = [Topic(**topic_data) for topic_data in topics_data]
        
        # Sort topics by priority (high first) and difficulty
        topics.sort(key=lambda t: (
            {'high': 0, 'medium': 1, 'low': 2}[t.priority],
            {'easy': 0, 'medium': 1, 'hard': 2}[t.difficulty]
        ))
        
        # Generate timetable
        timetable = self._generate_timetable(topics, request.hoursPerDay, request.totalDays)
        
        # Generate overview
        overview = await self.openai_service.generate_overview(request.subject, topics_data)
        
        return StudyResponse(
            subject=request.subject,
            hoursPerDay=request.hoursPerDay,
            totalDays=request.totalDays,
            overview=overview,
            topics=topics,
            timetable=timetable,
            email=request.email
        )

    def _generate_timetable(self, topics: List[Topic], hours_per_day: float, total_days: int) -> List[DayPlan]:
        """Generate a day-wise timetable distributing topics across available time."""
        
        timetable = []
        topic_queue = []
        
        # Create a queue of topic sessions to be scheduled
        for topic in topics:
            remaining_hours = topic.estimatedHours
            while remaining_hours > 0:
                # Split large topics into smaller sessions (max 2 hours per session)
                session_duration = min(remaining_hours, 2.0, hours_per_day)
                
                # Create activities based on topic and session type
                activities = self._generate_activities(topic, session_duration)
                
                # Determine suggested time based on priority
                suggested_time = self._get_suggested_time(topic.priority)
                
                session = StudySession(
                    topic=topic.title,
                    duration=session_duration,
                    priority=topic.priority,
                    description=f"Study {topic.title}: {topic.summary[:100]}...",
                    suggestedTime=suggested_time,
                    activities=activities
                )
                
                topic_queue.append(session)
                remaining_hours -= session_duration
        
        # Distribute sessions across days
        for day_index in range(total_days):
            daily_sessions = []
            daily_hours = 0
            
            # Fill the day with sessions until we reach the daily hour limit
            while daily_hours < hours_per_day and topic_queue:
                session = topic_queue.pop(0)
                
                # Check if this session fits in the remaining time
                if daily_hours + session.duration <= hours_per_day:
                    daily_sessions.append(session)
                    daily_hours += session.duration
                else:
                    # Split the session if it doesn't fit
                    remaining_time = hours_per_day - daily_hours
                    if remaining_time >= 0.5:  # Minimum 30 minutes
                        # Create a partial session for today
                        partial_session = StudySession(
                            topic=session.topic,
                            duration=remaining_time,
                            priority=session.priority,
                            description=session.description,
                            suggestedTime=session.suggestedTime,
                            activities=session.activities[:2]  # Fewer activities for shorter session
                        )
                        daily_sessions.append(partial_session)
                        
                        # Create remaining session for later
                        remaining_session = StudySession(
                            topic=session.topic,
                            duration=session.duration - remaining_time,
                            priority=session.priority,
                            description=session.description,
                            suggestedTime=session.suggestedTime,
                            activities=session.activities[2:]
                        )
                        topic_queue.insert(0, remaining_session)
                        
                        daily_hours += remaining_time
                    else:
                        # Put the session back and end the day
                        topic_queue.insert(0, session)
                        break
            
            # Generate daily notes
            day_notes = self._generate_daily_notes(daily_sessions, day_index, total_days)
            
            day_plan = DayPlan(
                sessions=daily_sessions,
                notes=day_notes
            )
            timetable.append(day_plan)
        
        return timetable

    def _generate_activities(self, topic: Topic, duration: float) -> List[str]:
        """Generate specific activities for a study session."""
        activities = []
        
        if duration >= 2.0:
            activities.extend([
                f"Read and understand key concepts of {topic.title}",
                f"Take detailed notes on {topic.title}",
                f"Practice exercises related to {topic.title}",
                f"Review and summarize learned material"
            ])
        elif duration >= 1.0:
            activities.extend([
                f"Study core concepts of {topic.title}",
                f"Take notes and highlight important points",
                f"Quick practice or review exercises"
            ])
        else:
            activities.extend([
                f"Quick review of {topic.title}",
                f"Go through key points and examples"
            ])
        
        return activities

    def _get_suggested_time(self, priority: str) -> str:
        """Get suggested study time based on priority."""
        time_suggestions = {
            'high': '9:00 AM - 11:00 AM (Peak focus hours)',
            'medium': '2:00 PM - 4:00 PM (Good focus hours)', 
            'low': '7:00 PM - 9:00 PM (Review time)'
        }
        return time_suggestions.get(priority, '9:00 AM - 11:00 AM')

    def _generate_daily_notes(self, sessions: List[StudySession], day_index: int, total_days: int) -> str:
        """Generate motivational and helpful notes for each day."""
        
        high_priority_count = sum(1 for s in sessions if s.priority == 'high')
        total_hours = sum(s.duration for s in sessions)
        
        notes = []
        
        if day_index == 0:
            notes.append("🚀 First day! Start strong and build momentum.")
        elif day_index == total_days - 1:
            notes.append("🎯 Final day! Focus on review and consolidation.")
        elif day_index < total_days // 2:
            notes.append("💪 Early days - focus on building strong foundations.")
        else:
            notes.append("🔥 Second half of your study plan - you're making great progress!")
        
        if high_priority_count > 0:
            notes.append(f"⭐ {high_priority_count} high-priority topic(s) today - tackle these when your mind is freshest.")
        
        if total_hours >= 3:
            notes.append("⏰ Long study day - remember to take regular breaks and stay hydrated.")
        
        notes.append("📝 End the day by reviewing what you've learned and planning tomorrow.")
        
        return " ".join(notes)