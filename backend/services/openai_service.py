import os
import json
from typing import List, Dict, Any
import openai
from openai import AsyncOpenAI

class OpenAIService:
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        
        if not os.getenv("OPENAI_API_KEY"):
            raise ValueError("OPENAI_API_KEY environment variable is required")

    async def generate_study_topics(self, subject: str, total_hours: float) -> List[Dict[str, Any]]:
        """Generate study topics for a given subject."""
        
        prompt = f"""
        Create a comprehensive study guide for "{subject}" with the following requirements:
        - Total study time available: {total_hours} hours
        - Generate 6-10 topics that cover the subject thoroughly
        - Each topic should have: title, summary, priority (high/medium/low), difficulty (easy/medium/hard), estimated hours
        - High-priority topics should be fundamental concepts
        - Include key points and recommended resources for each topic
        - Ensure total estimated hours is close to {total_hours} hours
        
        Return a JSON array with this exact structure:
        [
          {{
            "title": "Topic Title",
            "summary": "Detailed summary of what this topic covers",
            "priority": "high|medium|low",
            "difficulty": "easy|medium|hard", 
            "estimatedHours": 2.5,
            "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
            "resources": ["Resource 1", "Resource 2"]
          }}
        ]
        """

        try:
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert educator and curriculum designer. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content
            # Clean up the response to ensure it's valid JSON
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            
            topics = json.loads(content)
            
            # Ensure we have at least 5 topics
            if len(topics) < 5:
                # Generate additional topics if needed
                additional_topics = await self._generate_additional_topics(subject, 5 - len(topics))
                topics.extend(additional_topics)
            
            return topics
            
        except Exception as e:
            print(f"Error generating topics: {e}")
            # Fallback topics
            return self._get_fallback_topics(subject, total_hours)

    async def _generate_additional_topics(self, subject: str, count: int) -> List[Dict[str, Any]]:
        """Generate additional topics if the initial response didn't have enough."""
        prompt = f"""
        Generate {count} additional study topics for "{subject}".
        Return a JSON array with the same structure as before.
        """
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert educator. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            content = response.choices[0].message.content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
                
            return json.loads(content)
        except:
            return []

    def _get_fallback_topics(self, subject: str, total_hours: float) -> List[Dict[str, Any]]:
        """Fallback topics if OpenAI fails."""
        hours_per_topic = total_hours / 6
        
        return [
            {
                "title": f"Introduction to {subject}",
                "summary": f"Basic concepts and overview of {subject}",
                "priority": "high",
                "difficulty": "easy",
                "estimatedHours": hours_per_topic,
                "keyPoints": ["Basic concepts", "Key terminology", "Overview"],
                "resources": ["Textbook chapters", "Online tutorials"]
            },
            {
                "title": f"Fundamentals of {subject}",
                "summary": f"Core principles and fundamentals of {subject}",
                "priority": "high",
                "difficulty": "medium",
                "estimatedHours": hours_per_topic,
                "keyPoints": ["Core principles", "Fundamental concepts"],
                "resources": ["Documentation", "Practice exercises"]
            },
            {
                "title": f"Intermediate {subject}",
                "summary": f"Intermediate level concepts in {subject}",
                "priority": "medium",
                "difficulty": "medium",
                "estimatedHours": hours_per_topic,
                "keyPoints": ["Intermediate concepts", "Practical applications"],
                "resources": ["Video tutorials", "Projects"]
            },
            {
                "title": f"Advanced {subject}",
                "summary": f"Advanced topics and techniques in {subject}",
                "priority": "medium",
                "difficulty": "hard",
                "estimatedHours": hours_per_topic,
                "keyPoints": ["Advanced techniques", "Best practices"],
                "resources": ["Advanced tutorials", "Case studies"]
            },
            {
                "title": f"Practical Applications of {subject}",
                "summary": f"Real-world applications and use cases of {subject}",
                "priority": "low",
                "difficulty": "medium",
                "estimatedHours": hours_per_topic,
                "keyPoints": ["Real-world examples", "Use cases"],
                "resources": ["Case studies", "Portfolio projects"]
            },
            {
                "title": f"Mastery and Review of {subject}",
                "summary": f"Review and mastery of all {subject} concepts",
                "priority": "low",
                "difficulty": "easy",
                "estimatedHours": hours_per_topic,
                "keyPoints": ["Comprehensive review", "Practice tests"],
                "resources": ["Review materials", "Practice tests"]
            }
        ]

    async def generate_overview(self, subject: str, topics: List[Dict[str, Any]]) -> str:
        """Generate a comprehensive overview of the study plan."""
        topic_titles = [topic['title'] for topic in topics]
        
        prompt = f"""
        Create a comprehensive overview for studying "{subject}".
        The study plan covers these topics: {', '.join(topic_titles)}
        
        Write a 2-3 paragraph overview that:
        - Explains the learning journey
        - Highlights the progression from basics to advanced topics
        - Motivates the learner
        - Mentions the practical value of studying this subject
        """
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an inspiring educator who writes motivational content."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            return response.choices[0].message.content.strip()
        except:
            return f"This comprehensive study plan for {subject} is designed to take you from beginner to proficient. The curriculum covers fundamental concepts, practical applications, and advanced techniques that will give you a solid foundation in {subject}."