import { useState, useEffect, useRef } from 'react'
import { useHighlights } from '../context/HighlightContext'
import { useMutation } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import api, { annotationsAPI } from '../services/api'

const HIGHLIGHT_COLORS = [
  { name: 'yellow', bg: 'bg-yellow-200', hover: 'hover:bg-yellow-300', text: 'text-yellow-800' },
  { name: 'green', bg: 'bg-green-200', hover: 'hover:bg-green-300', text: 'text-green-800' },
  { name: 'blue', bg: 'bg-blue-200', hover: 'hover:bg-blue-300', text: 'text-blue-800' },
  { name: 'pink', bg: 'bg-pink-200', hover: 'hover:bg-pink-300', text: 'text-pink-800' }
]

const TextSelection = ({ children, chapterId }) => {
  const [selectedText, setSelectedText] = useState('')
  const [showPopup, setShowPopup] = useState(false)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [currentSelection, setCurrentSelection] = useState(null)
  const [popupAnimation, setPopupAnimation] = useState('popup-hidden')
  const containerRef = useRef(null)
  const popupRef = useRef(null)
  
  const { addHighlight, getChapterHighlights, removeHighlight } = useHighlights()
  const queryClient = useQueryClient()
  
  // Get saved highlights for this chapter
  const chapterHighlights = chapterId ? getChapterHighlights(chapterId) : []
  
  // Add annotation mutation
  const { mutate: addAnnotation } = useMutation({
    mutationFn: async (data) => {
      return annotationsAPI.addAnnotation(data);
    },
    onSuccess: () => {
      setSelectedText('');
      setShowPopup(false);
      queryClient.invalidateQueries({ queryKey: ['annotations', chapterId] });
    },
    onError: (error) => {
      console.error('Error adding annotation:', error);
      alert('Failed to add annotation. Please try again.');
    }
  });
  
  const handleTextSelection = () => {
    const selection = window.getSelection()
    const text = selection.toString().trim()
    
    if (text) {
      setSelectedText(text)
      
      // Get position for popup
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      
      // Calculate position with edge detection
      const viewportWidth = window.innerWidth
      let xPos = rect.left + (rect.width / 2)
      
      // Ensure the popup doesn't go off-screen
      const popupWidth = 240 // Approximate width of popup
      const minX = popupWidth / 2
      const maxX = viewportWidth - (popupWidth / 2)
      
      // Keep popup within bounds
      xPos = Math.min(Math.max(xPos, minX), maxX)
      
      // Position the popup directly above the selected text
      setPopupPosition({
        x: xPos,
        y: rect.top - 10 + window.scrollY  // Position above with a small gap
      })
      
      // Save the current selection for later use
      setCurrentSelection({
        range: range.cloneRange(),
        selection: selection
      })
      
      // Reset animation first (to handle quick re-selections)
      setPopupAnimation('popup-hidden')
      setShowPopup(true)
      
      // Trigger fade-in animation after a brief delay
      setTimeout(() => {
        setPopupAnimation('popup-visible')
      }, 10)
    } else {
      handleHidePopup()
    }
  }
  
  // Function to hide popup with animation
  const handleHidePopup = () => {
    setPopupAnimation('popup-hidden')
    setTimeout(() => {
      setShowPopup(false)
      setShowColorPicker(false)
    }, 150) // Duration of fade-out animation
  }
  
  const handleGoogleSearch = () => {
    if (selectedText) {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`define ${selectedText}`)}`
      window.open(searchUrl, '_blank')
    }
  }
  
  const handleHighlightClick = () => {
    setShowColorPicker(true)
  }
  
  const applyHighlight = async (color) => {
    if (!selectedText || !currentSelection || !chapterId) return
    
    // Create highlight DOM element
    const range = currentSelection.range
    
    // Get the highlighted text's position info for later restoration
    const textPosition = {
      startContainer: range.startContainer.textContent,
      startOffset: range.startOffset,
      endContainer: range.endContainer.textContent,
      endOffset: range.endOffset
    }
    
    try {
      // Create highlight span
      const highlightSpan = document.createElement('span')
      // Get the correct color class
      const colorClass = HIGHLIGHT_COLORS.find(c => c.name === color)?.bg || 'bg-yellow-200'
      highlightSpan.className = `${colorClass} highlight-text`
      highlightSpan.dataset.color = color // Store color as data attribute
      
      // Save highlight to context/localStorage/API
      const newHighlight = await addHighlight(chapterId, selectedText, color, textPosition)
      if (newHighlight) {
        highlightSpan.dataset.highlightId = newHighlight.id
        
        // Add remove highlight function on right-click
        highlightSpan.addEventListener('contextmenu', (e) => {
          e.preventDefault()
          if (confirm('Remove this highlight?')) {
            removeHighlight(chapterId, newHighlight.id)
            // Unwrap the span (remove the highlight visually)
            const parent = highlightSpan.parentNode
            while (highlightSpan.firstChild) {
              parent.insertBefore(highlightSpan.firstChild, highlightSpan)
            }
            parent.removeChild(highlightSpan)
          }
        })
      }
      
      // Surround the selected text with the highlight span
      range.surroundContents(highlightSpan)
      
      // Clear selection
      window.getSelection().removeAllRanges()
      setShowPopup(false)
      setShowColorPicker(false)
    } catch (e) {
      console.error('Cannot highlight across different elements', e)
      alert('Cannot highlight text that spans multiple paragraphs or elements')
      setShowPopup(false)
      setShowColorPicker(false)
    }
  }
  
  // Restore highlights when the component mounts
  useEffect(() => {
    if (!chapterId || chapterHighlights.length === 0 || !containerRef.current) return
    
    // This is a simplified version - in practice, restoring highlights precisely requires 
    // more complex text node traversal logic
    
    // For demonstration purposes, we'll search for exact text matches
    setTimeout(() => {
      const container = containerRef.current
      
      chapterHighlights.forEach(highlight => {
        // Create a TreeWalker to search through text nodes
        const walker = document.createTreeWalker(
          container,
          NodeFilter.SHOW_TEXT,
          null,
          false
        )
        
        let node
        while ((node = walker.nextNode())) {
          if (node.textContent.includes(highlight.text)) {
            try {
              const range = document.createRange()
              const startIndex = node.textContent.indexOf(highlight.text)
              range.setStart(node, startIndex)
              range.setEnd(node, startIndex + highlight.text.length)
              
              // Use the correct color from the highlight object or default to yellow if not found
              const highlightColor = highlight.color || 'yellow'
              const colorClass = HIGHLIGHT_COLORS.find(c => c.name === highlightColor)?.bg || 'bg-yellow-200'
              
              const highlightSpan = document.createElement('span')
              highlightSpan.className = `${colorClass} highlight-text`
              highlightSpan.dataset.highlightId = highlight.id
              highlightSpan.dataset.color = highlightColor // Store color as data attribute
              
              // Add remove highlight function on right-click
              highlightSpan.addEventListener('contextmenu', (e) => {
                e.preventDefault()
                if (confirm('Remove this highlight?')) {
                  removeHighlight(chapterId, highlight.id)
                  // Unwrap the span
                  const parent = highlightSpan.parentNode
                  while (highlightSpan.firstChild) {
                    parent.insertBefore(highlightSpan.firstChild, highlightSpan)
                  }
                  parent.removeChild(highlightSpan)
                }
              })
              
              try {
                range.surroundContents(highlightSpan)
              } catch (e) {
                console.error('Error restoring highlight:', e)
              }
              break // Stop after first match
            } catch (e) {
              console.error('Error setting up highlight range:', e)
            }
          }
        }
      })
    }, 500) // Delay to ensure content is fully rendered
  }, [chapterId, chapterHighlights])
  
  // Handle clicks outside to close popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPopup && popupRef.current && !popupRef.current.contains(event.target)) {
        handleHidePopup()
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPopup])
  
  // Add CSS for animations
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .popup-hidden {
        opacity: 0;
        transform: translate(-50%, -90%);
      }
      .popup-visible {
        opacity: 1;
        transform: translate(-50%, -100%);
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])
  
  return (
    <div 
      ref={containerRef}
      onMouseUp={handleTextSelection} 
      className="relative text-selection-container"
    >
      {children}
      
      {showPopup && selectedText && (
        <div 
          ref={popupRef}
          className={`absolute z-50 bg-white rounded-lg shadow-lg py-2 px-3 text-sm highlight-popup transition-all duration-150 ease-in-out ${popupAnimation}`}
          style={{ 
            top: `${popupPosition.y}px`, 
            left: `${popupPosition.x}px`,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(229, 231, 235, 1)',
            minWidth: '180px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {!showColorPicker ? (
            <div className="flex items-center space-x-3">
              <button 
                className="flex items-center text-blue-600 hover:text-blue-800"
                onClick={handleGoogleSearch}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
                </svg>
                Look up
              </button>
              
              <button 
                className="flex items-center text-amber-500 hover:text-amber-600"
                onClick={handleHighlightClick}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Highlight
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-center space-x-2 mb-2">
                {HIGHLIGHT_COLORS.map(color => (
                  <button
                    key={color.name}
                    className={`w-6 h-6 rounded-full ${color.bg} ${color.hover} transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400`}
                    onClick={() => applyHighlight(color.name)}
                    title={`Highlight in ${color.name}`}
                  />
                ))}
              </div>
              <div className="text-xs text-center text-gray-500">
                Choose highlight color
              </div>
            </div>
          )}
          
          {/* Arrow pointing to the selected text */}
          <div className="absolute -bottom-2 left-1/2 w-3 h-3 bg-white transform rotate-45 -translate-x-1/2 border-r border-b" style={{ borderColor: 'rgba(229, 231, 235, 1)' }}></div>
        </div>
      )}
    </div>
  )
}

export default TextSelection 