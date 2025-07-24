import os
from typing import List
from celery import Celery
from datetime import datetime, timedelta
from models.study_models import StudyResponse, ReminderRequest
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Initialize Celery
celery_app = Celery(
    'study_reminders',
    broker=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
    backend=os.getenv('REDIS_URL', 'redis://localhost:6379/0')
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

class ReminderService:
    def __init__(self):
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_username = os.getenv('SMTP_USERNAME')
        self.smtp_password = os.getenv('SMTP_PASSWORD')
        self.from_email = os.getenv('FROM_EMAIL', self.smtp_username)

    async def setup_reminders(self, email: str, study_data: StudyResponse) -> str:
        """Setup daily study reminders for the user."""
        
        if not self.smtp_username or not self.smtp_password:
            print("SMTP credentials not configured, skipping email reminders")
            return "reminder_disabled"
        
        # Schedule daily reminders
        reminder_id = f"study_reminder_{email}_{datetime.now().timestamp()}"
        
        for day_index in range(study_data.totalDays):
            # Schedule reminder for 8 AM each day
            reminder_date = datetime.now() + timedelta(days=day_index)
            reminder_datetime = reminder_date.replace(hour=8, minute=0, second=0, microsecond=0)
            
            # Skip if the time has already passed today
            if reminder_datetime <= datetime.now():
                reminder_datetime += timedelta(days=1)
            
            # Schedule the task
            send_daily_reminder.apply_async(
                args=[email, study_data.subject, day_index + 1, study_data.timetable[day_index]],
                eta=reminder_datetime
            )
        
        return reminder_id

@celery_app.task
def send_daily_reminder(email: str, subject: str, day_number: int, day_plan: dict):
    """Send daily study reminder email."""
    
    service = ReminderService()
    
    if not service.smtp_username or not service.smtp_password:
        print(f"SMTP not configured, skipping reminder for {email}")
        return
    
    try:
        # Create email content
        html_content = f"""
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
              <h2 style="color: #3b82f6; text-align: center;">📚 Daily Study Reminder</h2>
              
              <p>Hi there!</p>
              
              <p>It's time for Day {day_number} of your <strong>{subject}</strong> study plan! 🎯</p>
              
              <h3 style="color: #3b82f6;">Today's Schedule:</h3>
              <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
        """
        
        for session in day_plan['sessions']:
            html_content += f"""
                <div style="margin-bottom: 15px; padding: 10px; background-color: white; border-radius: 5px; border-left: 4px solid #3b82f6;">
                  <h4 style="margin: 0 0 5px 0; color: #1f2937;">{session['topic']} ({session['duration']}h)</h4>
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">{session['description']}</p>
                  {f"<p style='margin: 5px 0 0 0; color: #059669; font-size: 12px;'>💡 {session['suggestedTime']}</p>" if session.get('suggestedTime') else ''}
                </div>
            """
        
        html_content += f"""
              </div>
              
              {f"<div style='background-color: #fef3c7; padding: 10px; border-radius: 5px; margin: 15px 0;'><p style='margin: 0; color: #92400e;'><strong>Daily Tip:</strong> {day_plan.get('notes', '')}</p></div>" if day_plan.get('notes') else ''}
              
              <div style="text-align: center; margin-top: 20px;">
                <p style="color: #6b7280; font-size: 14px;">You've got this! Every study session brings you closer to your goals. 💪</p>
              </div>
              
              <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px;">
                  This is an automated reminder from Study Guide Generator.<br>
                  Keep up the great work!
                </p>
              </div>
            </div>
          </body>
        </html>
        """
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"📚 Day {day_number}: {subject} Study Reminder"
        msg['From'] = service.from_email
        msg['To'] = email
        
        # Add HTML content
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        # Send email
        with smtplib.SMTP(service.smtp_server, service.smtp_port) as server:
            server.starttls()
            server.login(service.smtp_username, service.smtp_password)
            server.send_message(msg)
        
        print(f"Daily reminder sent to {email} for day {day_number}")
        
    except Exception as e:
        print(f"Failed to send reminder to {email}: {e}")

@celery_app.task
def send_completion_celebration(email: str, subject: str):
    """Send completion celebration email."""
    service = ReminderService()
    
    try:
        html_content = f"""
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #ddd; border-radius: 10px;">
              <h1 style="color: #10b981; font-size: 36px;">🎉 Congratulations! 🎉</h1>
              
              <p style="font-size: 18px; margin: 20px 0;">
                You've completed your <strong>{subject}</strong> study plan!
              </p>
              
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h2 style="margin: 0;">Mission Accomplished! 🚀</h2>
                <p style="margin: 10px 0 0 0;">You've shown dedication and consistency. That's the mark of a true learner!</p>
              </div>
              
              <p style="color: #6b7280;">
                Keep practicing what you've learned and consider your next learning adventure!
              </p>
            </div>
          </body>
        </html>
        """
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"🎉 Congratulations on completing {subject}!"
        msg['From'] = service.from_email
        msg['To'] = email
        
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        with smtplib.SMTP(service.smtp_server, service.smtp_port) as server:
            server.starttls()
            server.login(service.smtp_username, service.smtp_password)
            server.send_message(msg)
            
        print(f"Completion celebration sent to {email}")
        
    except Exception as e:
        print(f"Failed to send completion email to {email}: {e}")