import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHighlights } from '../context/HighlightContext'

// Updated colors with dark theme variants
const HIGHLIGHT_COLORS = {
  yellow: { bg: 'bg-yellow-900/30', text: 'text-yellow-300' },
  green: { bg: 'bg-green-900/30', text: 'text-green-300' },
  blue: { bg: 'bg-blue-900/30', text: 'text-blue-300' },
  pink: { bg: 'bg-pink-900/30', text: 'text-pink-300' }
}

const HighlightInfo = () => {
  const { highlights, removeHighlight } = useHighlights()
  const navigate = useNavigate()
  const [chapterTitles, setChapterTitles] = useState({})
  const [novelTitles, setNovelTitles] = useState({})
  const [activeTab, setActiveTab] = useState('all')
  
  // Fetch novel and chapter titles for the highlights
  useEffect(() => {
    const fetchTitles = async () => {
      const chaptersToFetch = new Set()
      const novelsToFetch = new Set()
      
      // Collect unique chapter and novel IDs
      Object.keys(highlights).forEach(chapterId => {
        chaptersToFetch.add(chapterId)
        // We would fetch novel IDs here too, but for simplicity we'll assume they're available
      })
      
      // Fetch chapter titles
      if (chaptersToFetch.size > 0) {
        try {
          const chapterPromises = Array.from(chaptersToFetch).map(async id => {
            try {
              const response = await fetch(`/api/chapters/chapter/${id}`)
              const data = await response.json()
              return { id, title: data.title, novelId: data.novel }
            } catch (error) {
              console.error(`Error fetching chapter ${id}:`, error)
              return { id, title: 'Unknown Chapter', novelId: null }
            }
          })
          
          const chapterData = await Promise.all(chapterPromises)
          const newChapterTitles = {}
          
          chapterData.forEach(chapter => {
            newChapterTitles[chapter.id] = chapter.title
            if (chapter.novelId) {
              novelsToFetch.add(chapter.novelId)
            }
          })
          
          setChapterTitles(newChapterTitles)
          
          // Fetch novel titles
          const novelPromises = Array.from(novelsToFetch).map(async id => {
            try {
              const response = await fetch(`/api/novels/${id}`)
              const data = await response.json()
              return { id, title: data.title }
            } catch (error) {
              console.error(`Error fetching novel ${id}:`, error)
              return { id, title: 'Unknown Novel' }
            }
          })
          
          const novelData = await Promise.all(novelPromises)
          const newNovelTitles = {}
          
          novelData.forEach(novel => {
            newNovelTitles[novel.id] = novel.title
          })
          
          setNovelTitles(newNovelTitles)
        } catch (error) {
          console.error('Error fetching titles:', error)
        }
      }
    }
    
    if (Object.keys(highlights).length > 0) {
      fetchTitles()
    }
  }, [highlights])
  
  // Handle navigation to a chapter with a specific highlight
  const navigateToHighlight = (chapterId) => {
    navigate(`/chapters/${chapterId}`)
  }
  
  // Get unique color tabs
  const getColorTabs = () => {
    const colors = new Set(['all'])
    
    Object.values(highlights).forEach(chapterHighlights => {
      chapterHighlights.forEach(highlight => {
        if (highlight.color) {
          colors.add(highlight.color)
        }
      })
    })
    
    return Array.from(colors)
  }
  
  // Filter highlights by color
  const getFilteredHighlights = () => {
    if (activeTab === 'all') {
      return highlights
    }
    
    const filtered = {}
    
    Object.entries(highlights).forEach(([chapterId, chapterHighlights]) => {
      const filteredChapterHighlights = chapterHighlights.filter(
        highlight => highlight.color === activeTab
      )
      
      if (filteredChapterHighlights.length > 0) {
        filtered[chapterId] = filteredChapterHighlights
      }
    })
    
    return filtered
  }
  
  const colorTabs = getColorTabs()
  const filteredHighlights = getFilteredHighlights()
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-white">Your Highlights</h2>
      
      {Object.keys(highlights).length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>You haven't highlighted any text yet.</p>
          <p className="mt-2 text-sm">Select text while reading to highlight it.</p>
        </div>
      ) : (
        <>
          {/* Color tabs */}
          <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
            {colorTabs.map(color => (
              <button
                key={color}
                onClick={() => setActiveTab(color)}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap
                  ${activeTab === color 
                    ? color === 'all' 
                      ? 'bg-[#5199fc] text-white' 
                      : `${HIGHLIGHT_COLORS[color]?.bg || 'bg-gray-800'} ${HIGHLIGHT_COLORS[color]?.text || 'text-gray-300'}`
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
              >
                {color === 'all' ? 'All Highlights' : `${color.charAt(0).toUpperCase() + color.slice(1)}`}
              </button>
            ))}
          </div>
          
          {/* Highlights list */}
          <div className="space-y-6">
            {Object.entries(filteredHighlights).length === 0 ? (
              <div className="text-center py-4 text-gray-400">
                <p>No highlights with this color.</p>
              </div>
            ) : (
              Object.entries(filteredHighlights).map(([chapterId, chapterHighlights]) => (
                <div key={chapterId} className="border border-gray-700 rounded-lg overflow-hidden">
                  <div 
                    className="bg-gray-800 px-4 py-2 font-medium cursor-pointer hover:bg-gray-700"
                    onClick={() => navigateToHighlight(chapterId)}
                  >
                    <span className="text-white">{chapterTitles[chapterId] || 'Unknown Chapter'}</span>
                    {novelTitles[chapterId] && (
                      <span className="text-sm text-gray-400 ml-2">
                        from {novelTitles[chapterId]}
                      </span>
                    )}
                  </div>
                  
                  <div className="divide-y divide-gray-700">
                    {chapterHighlights.map(highlight => (
                      <div key={highlight.id} className="p-4 group bg-gray-900">
                        <div className="flex justify-between items-start">
                          <div className={`p-2 rounded ${HIGHLIGHT_COLORS[highlight.color || 'yellow']?.bg || 'bg-gray-800'} border border-gray-700 flex-grow`}>
                            <p className={`text-sm ${HIGHLIGHT_COLORS[highlight.color || 'yellow']?.text || 'text-gray-300'}`}>"{highlight.text}"</p>
                          </div>
                          
                          <button
                            onClick={() => removeHighlight(chapterId, highlight.id)}
                            className="ml-2 text-gray-400 hover:text-[#ff5068] opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove highlight"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default HighlightInfo 