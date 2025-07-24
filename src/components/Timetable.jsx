import React from 'react'
import { Calendar, Clock, Download, ArrowLeft, BookOpen } from 'lucide-react'
import { exportToPDF } from '../services/pdfExport'

const Timetable = ({ data, onViewGuide, onReset }) => {
  const handleExportPDF = () => {
    exportToPDF(data, 'timetable')
  }

  const getDayName = (dayIndex) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const today = new Date()
    const targetDay = new Date(today.getTime() + dayIndex * 24 * 60 * 60 * 1000)
    return `${days[targetDay.getDay()]} (${targetDay.toLocaleDateString()})`
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 border-red-300 text-red-800'
      case 'medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      default:
        return 'bg-green-100 border-green-300 text-green-800'
    }
  }

  const getTotalDailyHours = (day) => {
    return day.sessions.reduce((total, session) => total + session.duration, 0)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onReset}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Form
        </button>
        
        <div className="flex space-x-3">
          <button
            onClick={onViewGuide}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            View Study Guide
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <Calendar className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {data.subject} Study Timetable
          </h1>
          <p className="text-gray-600">
            {data.hoursPerDay} hours/day • {data.totalDays} days plan
          </p>
        </div>

        <div className="grid gap-6">
          {data.timetable.map((day, dayIndex) => (
            <div key={dayIndex} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Day {dayIndex + 1} - {getDayName(dayIndex)}
                </h2>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">
                    Total: {getTotalDailyHours(day)}h
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {day.sessions.map((session, sessionIndex) => (
                  <div key={sessionIndex} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{session.topic}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(session.priority)}`}>
                            {session.priority}
                          </span>
                          <span className="text-sm text-gray-500">
                            {session.duration}h
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2">{session.description}</p>
                      
                      {session.suggestedTime && (
                        <div className="flex items-center text-gray-500 text-sm">
                          <Clock className="h-3 w-3 mr-1" />
                          Suggested: {session.suggestedTime}
                        </div>
                      )}

                      {session.activities && session.activities.length > 0 && (
                        <div className="mt-2">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Activities:</h4>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {session.activities.map((activity, activityIndex) => (
                              <li key={activityIndex} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{activity}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {day.notes && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-1">Daily Notes:</h4>
                  <p className="text-blue-800 text-sm">{day.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3">Study Schedule Tips</h3>
            <ul className="text-blue-800 text-sm space-y-2">
              <li>• Start with high-priority topics when your mind is fresh</li>
              <li>• Take 5-10 minute breaks between sessions</li>
              <li>• Adjust timing based on your peak focus hours</li>
              <li>• Review previous day's material before new topics</li>
            </ul>
          </div>

          <div className="p-6 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-3">Progress Tracking</h3>
            <ul className="text-green-800 text-sm space-y-2">
              <li>• Mark completed sessions daily</li>
              <li>• Note areas that need extra attention</li>
              <li>• Celebrate completing each day's plan</li>
              <li>• Adjust next day if needed based on progress</li>
            </ul>
          </div>
        </div>

        {data.email && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              📧 Daily study reminders will be sent to <strong>{data.email}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Timetable