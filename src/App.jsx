import React, { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import StudyForm from './components/StudyForm'
import StudyGuide from './components/StudyGuide'
import Timetable from './components/Timetable'
import Header from './components/Header'

function App() {
  const [studyData, setStudyData] = useState(null)
  const [currentView, setCurrentView] = useState('form')

  const handleStudyDataGenerated = (data) => {
    setStudyData(data)
    setCurrentView('guide')
  }

  const resetToForm = () => {
    setStudyData(null)
    setCurrentView('form')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <Toaster position="top-right" />
      
      <main className="container mx-auto px-4 py-8">
        {currentView === 'form' && (
          <StudyForm onDataGenerated={handleStudyDataGenerated} />
        )}
        
        {currentView === 'guide' && studyData && (
          <StudyGuide 
            data={studyData} 
            onViewTimetable={() => setCurrentView('timetable')}
            onReset={resetToForm}
          />
        )}
        
        {currentView === 'timetable' && studyData && (
          <Timetable 
            data={studyData}
            onViewGuide={() => setCurrentView('guide')}
            onReset={resetToForm}
          />
        )}
      </main>
    </div>
  )
}

export default App