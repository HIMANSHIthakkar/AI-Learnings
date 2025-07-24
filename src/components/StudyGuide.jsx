import React from 'react'
import { BookOpen, Calendar, Download, ArrowLeft, Star } from 'lucide-react'
import { exportToPDF } from '../services/pdfExport'

const StudyGuide = ({ data, onViewTimetable, onReset }) => {
  const handleExportPDF = () => {
    exportToPDF(data, 'guide')
  }

  return (
    <div className="max-w-4xl mx-auto">
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
            onClick={onViewTimetable}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Calendar className="h-4 w-4 mr-2" />
            View Timetable
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
              <BookOpen className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {data.subject} Study Guide
          </h1>
          <p className="text-gray-600">
            {data.hoursPerDay} hours/day • {data.totalDays} days study plan
          </p>
        </div>

        {data.overview && (
          <div className="mb-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Overview</h2>
            <p className="text-gray-700 leading-relaxed">{data.overview}</p>
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Study Topics</h2>
          
          {data.topics.map((topic, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 ${
                    topic.priority === 'high' ? 'bg-red-500' :
                    topic.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}>
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{topic.title}</h3>
                </div>
                {topic.priority === 'high' && (
                  <div className="flex items-center text-red-600">
                    <Star className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">High Priority</span>
                  </div>
                )}
              </div>
              
              <p className="text-gray-700 mb-4 leading-relaxed">{topic.summary}</p>
              
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  Est. Time: {topic.estimatedHours}h
                </span>
                <span className={`px-3 py-1 rounded-full text-sm text-white ${
                  topic.difficulty === 'easy' ? 'bg-green-500' :
                  topic.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  {topic.difficulty.charAt(0).toUpperCase() + topic.difficulty.slice(1)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm text-white ${
                  topic.priority === 'high' ? 'bg-red-500' :
                  topic.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}>
                  {topic.priority.charAt(0).toUpperCase() + topic.priority.slice(1)} Priority
                </span>
              </div>

              {topic.keyPoints && topic.keyPoints.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Key Points:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {topic.keyPoints.map((point, pointIndex) => (
                      <li key={pointIndex}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {topic.resources && topic.resources.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Recommended Resources:</h4>
                  <ul className="space-y-1">
                    {topic.resources.map((resource, resourceIndex) => (
                      <li key={resourceIndex} className="text-blue-600 hover:text-blue-800">
                        • {resource}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Study Tips</h3>
          <ul className="text-gray-700 space-y-1">
            <li>• Take 15-minute breaks every hour to maintain focus</li>
            <li>• Review previous day's material for 10 minutes before starting new topics</li>
            <li>• Practice active recall by summarizing topics without looking at notes</li>
            <li>• High-priority topics are scheduled early in your plan for maximum retention</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default StudyGuide