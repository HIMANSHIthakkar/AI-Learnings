import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Clock, BookOpen, Sparkles } from 'lucide-react'
import { generateStudyGuide } from '../services/api'

const StudyForm = ({ onDataGenerated }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, watch } = useForm()

  const hoursValue = watch('hoursPerDay')

  const onSubmit = async (data) => {
    // Validation hooks
    if (!data.subject.trim()) {
      toast.error('Subject name is required')
      return
    }

    if (data.hoursPerDay <= 0) {
      toast.error('Please enter a valid number of hours per day')
      return
    }

    if (data.hoursPerDay > 12) {
      toast.error('Please enter a realistic number of hours (max 12 per day)')
      return
    }

    setIsLoading(true)
    
    try {
      const result = await generateStudyGuide({
        subject: data.subject.trim(),
        hoursPerDay: parseInt(data.hoursPerDay),
        totalDays: parseInt(data.totalDays) || 7,
        email: data.email?.trim() || null
      })

      // Validation: Output topics ≥ 5
      if (!result.topics || result.topics.length < 5) {
        toast.error('Generated study guide should have at least 5 topics. Please try again.')
        return
      }

      // Validation: Timetable must not exceed user-provided hours/day
      const maxDailyHours = Math.max(...result.timetable.map(day => 
        day.sessions.reduce((total, session) => total + session.duration, 0)
      ))
      
      if (maxDailyHours > data.hoursPerDay) {
        toast.error('Generated timetable exceeds your daily study hours. Please try again.')
        return
      }

      toast.success('Study guide generated successfully!')
      onDataGenerated(result)
    } catch (error) {
      toast.error(error.message || 'Failed to generate study guide')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <Sparkles className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your Study Plan
          </h2>
          <p className="text-gray-600">
            Enter your subject and available time to generate a personalized study guide
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <BookOpen className="h-4 w-4 mr-2" />
              Subject Name
            </label>
            <input
              type="text"
              {...register('subject', { 
                required: 'Subject name is required',
                minLength: { value: 2, message: 'Subject name must be at least 2 characters' }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., JavaScript Fundamentals, Organic Chemistry, World History"
            />
            {errors.subject && (
              <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 mr-2" />
                Hours per Day
              </label>
              <input
                type="number"
                min="0.5"
                max="12"
                step="0.5"
                {...register('hoursPerDay', { 
                  required: 'Hours per day is required',
                  min: { value: 0.5, message: 'Minimum 0.5 hours required' },
                  max: { value: 12, message: 'Maximum 12 hours allowed' }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="2"
              />
              {errors.hoursPerDay && (
                <p className="mt-1 text-sm text-red-600">{errors.hoursPerDay.message}</p>
              )}
              {hoursValue > 8 && (
                <p className="mt-1 text-sm text-yellow-600">
                  ⚠️ Consider taking breaks to maintain focus
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Study Period (Days)
              </label>
              <select
                {...register('totalDays')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="7">1 Week (7 days)</option>
                <option value="14">2 Weeks (14 days)</option>
                <option value="21">3 Weeks (21 days)</option>
                <option value="30">1 Month (30 days)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Email (optional - for reminders)
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="your.email@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating Guide...
              </div>
            ) : (
              'Generate Study Guide + Plan'
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">What you'll get:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Comprehensive study guide with topics and summaries</li>
            <li>• Day-wise personalized timetable</li>
            <li>• High-priority topics scheduled early</li>
            <li>• PDF export functionality</li>
            <li>• Optional daily study reminders</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default StudyForm