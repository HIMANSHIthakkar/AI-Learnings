import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const generateStudyGuide = async (formData) => {
  try {
    const response = await api.post('/study-guide/generate', formData)
    
    // Save the generated plan with timestamp
    const planData = {
      ...response.data,
      timestamp: new Date().toISOString(),
      formData
    }
    
    // Store in localStorage for persistence
    localStorage.setItem('lastStudyPlan', JSON.stringify(planData))
    
    return response.data
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail)
    }
    throw new Error('Failed to generate study guide. Please try again.')
  }
}

export const setupReminders = async (email, studyData) => {
  try {
    const response = await api.post('/reminders/setup', {
      email,
      subject: studyData.subject,
      timetable: studyData.timetable,
      totalDays: studyData.totalDays
    })
    return response.data
  } catch (error) {
    console.error('Failed to setup reminders:', error)
    throw new Error('Failed to setup reminders')
  }
}

export const getStudyHistory = async () => {
  try {
    const response = await api.get('/study-guide/history')
    return response.data
  } catch (error) {
    console.error('Failed to fetch study history:', error)
    return []
  }
}

export default api