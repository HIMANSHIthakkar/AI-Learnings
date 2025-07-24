import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export const exportToPDF = async (data, type = 'both') => {
  const pdf = new jsPDF()
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  let yPosition = margin

  // Helper function to add text with line wrapping
  const addWrappedText = (text, x, y, maxWidth, fontSize = 12) => {
    pdf.setFontSize(fontSize)
    const lines = pdf.splitTextToSize(text, maxWidth)
    pdf.text(lines, x, y)
    return y + (lines.length * fontSize * 0.3)
  }

  // Helper function to check if we need a new page
  const checkNewPage = (requiredHeight) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      pdf.addPage()
      yPosition = margin
    }
  }

  // Title page
  pdf.setFontSize(24)
  pdf.setFont(undefined, 'bold')
  pdf.text(`${data.subject} Study Plan`, pageWidth / 2, 40, { align: 'center' })
  
  pdf.setFontSize(14)
  pdf.setFont(undefined, 'normal')
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 55, { align: 'center' })
  pdf.text(`Study Period: ${data.totalDays} days • ${data.hoursPerDay} hours/day`, pageWidth / 2, 70, { align: 'center' })

  yPosition = 90

  if (type === 'guide' || type === 'both') {
    // Study Guide Section
    checkNewPage(60)
    pdf.setFontSize(18)
    pdf.setFont(undefined, 'bold')
    pdf.text('Study Guide', margin, yPosition)
    yPosition += 20

    if (data.overview) {
      checkNewPage(40)
      pdf.setFontSize(14)
      pdf.setFont(undefined, 'bold')
      pdf.text('Overview:', margin, yPosition)
      yPosition += 10
      
      pdf.setFont(undefined, 'normal')
      yPosition = addWrappedText(data.overview, margin, yPosition, pageWidth - 2 * margin, 11)
      yPosition += 15
    }

    // Topics
    checkNewPage(40)
    pdf.setFontSize(14)
    pdf.setFont(undefined, 'bold')
    pdf.text('Study Topics:', margin, yPosition)
    yPosition += 15

    data.topics.forEach((topic, index) => {
      checkNewPage(50)
      
      // Topic number and title
      pdf.setFontSize(12)
      pdf.setFont(undefined, 'bold')
      pdf.text(`${index + 1}. ${topic.title}`, margin, yPosition)
      yPosition += 8
      
      // Priority and difficulty
      pdf.setFontSize(10)
      pdf.setFont(undefined, 'normal')
      pdf.text(`Priority: ${topic.priority} • Difficulty: ${topic.difficulty} • Est. Time: ${topic.estimatedHours}h`, margin + 10, yPosition)
      yPosition += 8
      
      // Summary
      pdf.setFontSize(10)
      yPosition = addWrappedText(topic.summary, margin + 10, yPosition, pageWidth - 2 * margin - 10, 10)
      yPosition += 5
      
      // Key points
      if (topic.keyPoints && topic.keyPoints.length > 0) {
        pdf.setFont(undefined, 'bold')
        pdf.text('Key Points:', margin + 10, yPosition)
        yPosition += 6
        
        pdf.setFont(undefined, 'normal')
        topic.keyPoints.forEach(point => {
          checkNewPage(15)
          yPosition = addWrappedText(`• ${point}`, margin + 15, yPosition, pageWidth - 2 * margin - 15, 9)
          yPosition += 3
        })
      }
      
      yPosition += 10
    })
  }

  if (type === 'timetable' || type === 'both') {
    // Timetable Section
    if (type === 'both') {
      pdf.addPage()
      yPosition = margin
    }

    pdf.setFontSize(18)
    pdf.setFont(undefined, 'bold')
    pdf.text('Study Timetable', margin, yPosition)
    yPosition += 20

    data.timetable.forEach((day, dayIndex) => {
      checkNewPage(60)
      
      // Day header
      pdf.setFontSize(14)
      pdf.setFont(undefined, 'bold')
      const dayName = getDayName(dayIndex)
      pdf.text(`Day ${dayIndex + 1} - ${dayName}`, margin, yPosition)
      yPosition += 15
      
      // Sessions
      day.sessions.forEach((session, sessionIndex) => {
        checkNewPage(40)
        
        pdf.setFontSize(11)
        pdf.setFont(undefined, 'bold')
        pdf.text(`${session.topic} (${session.duration}h)`, margin + 10, yPosition)
        yPosition += 8
        
        pdf.setFontSize(10)
        pdf.setFont(undefined, 'normal')
        pdf.text(`Priority: ${session.priority}`, margin + 15, yPosition)
        yPosition += 6
        
        yPosition = addWrappedText(session.description, margin + 15, yPosition, pageWidth - 2 * margin - 15, 9)
        
        if (session.suggestedTime) {
          pdf.text(`Suggested time: ${session.suggestedTime}`, margin + 15, yPosition)
          yPosition += 6
        }
        
        yPosition += 8
      })
      
      yPosition += 10
    })
  }

  // Save the PDF
  const fileName = `${data.subject.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_study_${type}_${Date.now()}.pdf`
  pdf.save(fileName)
}

const getDayName = (dayIndex) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const today = new Date()
  const targetDay = new Date(today.getTime() + dayIndex * 24 * 60 * 60 * 1000)
  return `${days[targetDay.getDay()]} ${targetDay.toLocaleDateString()}`
}