import React from 'react'
import { BookOpen, Brain } from 'lucide-react'

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-primary-600" />
            <BookOpen className="h-6 w-6 text-primary-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Study Guide Generator
            </h1>
            <p className="text-sm text-gray-600">
              AI-powered personalized study plans
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header