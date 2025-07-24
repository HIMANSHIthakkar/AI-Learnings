import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import StudyForm from '../StudyForm'
import * as api from '../../services/api'

// Mock the API
vi.mock('../../services/api')

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('StudyForm', () => {
  const mockOnDataGenerated = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form elements correctly', () => {
    render(<StudyForm onDataGenerated={mockOnDataGenerated} />)
    
    expect(screen.getByLabelText(/subject name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/hours per day/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/study period/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate study guide/i })).toBeInTheDocument()
  })

  it('shows error when subject is empty', async () => {
    render(<StudyForm onDataGenerated={mockOnDataGenerated} />)
    
    const submitButton = screen.getByRole('button', { name: /generate study guide/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/subject name is required/i)).toBeInTheDocument()
    })
  })

  it('shows error when hours per day is 0', async () => {
    render(<StudyForm onDataGenerated={mockOnDataGenerated} />)
    
    const hoursInput = screen.getByLabelText(/hours per day/i)
    fireEvent.change(hoursInput, { target: { value: '0' } })
    
    const submitButton = screen.getByRole('button', { name: /generate study guide/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/minimum 0.5 hours required/i)).toBeInTheDocument()
    })
  })

  it('successfully generates study guide with valid data', async () => {
    const mockResponse = {
      subject: 'JavaScript',
      topics: [
        { title: 'Variables', summary: 'Learn about variables', priority: 'high', estimatedHours: 2 },
        { title: 'Functions', summary: 'Learn about functions', priority: 'medium', estimatedHours: 3 },
        { title: 'Objects', summary: 'Learn about objects', priority: 'medium', estimatedHours: 2 },
        { title: 'Arrays', summary: 'Learn about arrays', priority: 'low', estimatedHours: 2 },
        { title: 'DOM', summary: 'Learn about DOM', priority: 'high', estimatedHours: 3 }
      ],
      timetable: [
        {
          sessions: [
            { topic: 'Variables', duration: 2, priority: 'high' }
          ]
        }
      ],
      hoursPerDay: 2,
      totalDays: 7
    }

    vi.mocked(api.generateStudyGuide).mockResolvedValue(mockResponse)

    render(<StudyForm onDataGenerated={mockOnDataGenerated} />)
    
    const subjectInput = screen.getByLabelText(/subject name/i)
    const hoursInput = screen.getByLabelText(/hours per day/i)
    
    fireEvent.change(subjectInput, { target: { value: 'JavaScript' } })
    fireEvent.change(hoursInput, { target: { value: '2' } })
    
    const submitButton = screen.getByRole('button', { name: /generate study guide/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnDataGenerated).toHaveBeenCalledWith(mockResponse)
    })
  })

  it('shows error when generated guide has less than 5 topics', async () => {
    const mockResponse = {
      topics: [
        { title: 'Topic 1', summary: 'Summary 1' },
        { title: 'Topic 2', summary: 'Summary 2' }
      ],
      timetable: []
    }

    vi.mocked(api.generateStudyGuide).mockResolvedValue(mockResponse)

    render(<StudyForm onDataGenerated={mockOnDataGenerated} />)
    
    const subjectInput = screen.getByLabelText(/subject name/i)
    const hoursInput = screen.getByLabelText(/hours per day/i)
    
    fireEvent.change(subjectInput, { target: { value: 'Test Subject' } })
    fireEvent.change(hoursInput, { target: { value: '2' } })
    
    const submitButton = screen.getByRole('button', { name: /generate study guide/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnDataGenerated).not.toHaveBeenCalled()
    })
  })

  it('shows warning for high study hours', () => {
    render(<StudyForm onDataGenerated={mockOnDataGenerated} />)
    
    const hoursInput = screen.getByLabelText(/hours per day/i)
    fireEvent.change(hoursInput, { target: { value: '10' } })

    expect(screen.getByText(/consider taking breaks/i)).toBeInTheDocument()
  })
})