import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import api, { chapterAPI, novelAPI, bookmarksAPI } from '../services/api'
import TextSelection from '../components/TextSelection'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './EditChapter.css'

const ChapterDetail = () => {
  const { chapterId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const contentRef = useRef(null)
  
  // Reader settings state
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('readerFontSize') || '18px')
  const [theme, setTheme] = useState(() => localStorage.getItem('readerTheme') || 'light')
  const [showControls, setShowControls] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [textAlign, setTextAlign] = useState(() => localStorage.getItem('readerTextAlign') || 'left')

  // Font options
  const fontSizeOptions = [
    { label: 'Small', value: '16px' },
    { label: 'Medium', value: '18px' },
    { label: 'Large', value: '20px' },
    { label: 'X-Large', value: '22px' }
  ]

  // Theme options
  const themeOptions = [
    { value: 'light', label: 'Light', bg: 'bg-white', text: 'text-gray-900' },
    { value: 'sepia', label: 'Sepia', bg: 'bg-amber-50', text: 'text-amber-900' },
    { value: 'dark', label: 'Dark', bg: 'bg-gray-900', text: 'text-gray-100' },
    { value: 'black', label: 'Black', bg: 'bg-black', text: 'text-gray-200' },
  ]

  // Save reader settings to localStorage
  useEffect(() => {
    localStorage.setItem('readerFontSize', fontSize)
    localStorage.setItem('readerTheme', theme)
    localStorage.setItem('readerTextAlign', textAlign)
  }, [fontSize, theme, textAlign])

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    let timeout
    if (showControls && !showSettings) {
      timeout = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
    return () => clearTimeout(timeout)
  }, [showControls, showSettings])

  // Fetch chapter details
  const { data: chapter, isLoading } = useQuery({
    queryKey: ['chapter', chapterId],
    queryFn: async () => {
      try {
        console.log('Fetching chapter details for ID:', chapterId);
        // Use the improved chapterAPI method with CORS fixes
        return await chapterAPI.getChapterForEditing(chapterId);
      } catch (error) {
        console.error('Error fetching chapter:', error);
        throw error;
      }
    },
    onError: (error) => {
      console.error('Error in chapter query:', error);
      // More user-friendly error handling
      if (error.message === 'Network Error') {
        alert('Network connection error. Please check your internet connection.');
      } else {
        alert('Failed to load chapter. Please try again later.');
      }
    }
  })

  // Set document title based on chapter - MOVED HERE after chapter is defined
  useEffect(() => {
    if (chapter?.title) {
      document.title = `${chapter.title} | Reading`
    }
    return () => {
      document.title = 'Novel Reading App'
    }
  }, [chapter])

  // Calculate reading progress - MOVED HERE after chapter is defined
  useEffect(() => {
    if (!contentRef.current) return
    
    const handleScroll = () => {
      const element = contentRef.current
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const contentHeight = element.clientHeight
      const scrolled = Math.min(100, Math.round((scrollTop / (contentHeight - windowHeight)) * 100))
      setProgress(scrolled)

      // Check if user has scrolled to bottom
      if (scrolled > 95 && chapter?.novel) {
        // Removed progress tracking functionality
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [contentRef.current, chapter])

  // Fetch novel details for navigation
  const { data: novel } = useQuery({
    queryKey: ['novel-for-chapter', chapter?.novel],
    queryFn: async () => {
      try {
        console.log('Fetching novel for chapter navigation, ID:', chapter.novel);
        // Use the improved novelAPI method
        return await novelAPI.getNovelById(chapter.novel);
      } catch (error) {
        console.error('Error fetching novel for chapter:', error);
        return null;
      }
    },
    enabled: !!chapter?.novel
  })

  // Fetch chapters for navigation
  const { data: chapters } = useQuery({
    queryKey: ['chapters-for-novel', chapter?.novel],
    queryFn: async () => {
      try {
        console.log('Fetching chapters for navigation in ChapterDetail, novel ID:', chapter.novel);
        // Use the enhanced API method with better error handling
        const chaptersData = await chapterAPI.getChaptersForNovel(chapter.novel);
        return chaptersData.sort((a, b) => a.chapterNumber - b.chapterNumber);
      } catch (error) {
        console.error('Error fetching chapters for navigation:', error);
        return [];
      }
    },
    enabled: !!chapter?.novel
  })

  // Check if chapter is bookmarked
  const { data: bookmarkData, refetch: refetchBookmark } = useQuery({
    queryKey: ['bookmark-status', chapterId, chapter?.novel],
    queryFn: async () => {
      if (!user || !chapter?.novel) return { isBookmarked: false };
      try {
        return await bookmarksAPI.checkBookmark(chapter.novel, chapterId);
      } catch (error) {
        console.error('Error checking bookmark status:', error);
        return { isBookmarked: false };
      }
    },
    enabled: !!chapter?.novel && !!user,
    onSuccess: (data) => {
      setIsBookmarked(data.isBookmarked);
    }
  });

  // Add bookmark mutation
  const { mutate: addBookmark } = useMutation({
    mutationFn: async () => {
      if (!chapter?.novel) return;
      return await bookmarksAPI.addBookmark({
        novelId: chapter.novel,
        chapterId: chapterId
      });
    },
    onSuccess: () => {
      setIsBookmarked(true);
      refetchBookmark();
    },
    onError: (error) => {
      console.error('Error adding bookmark:', error);
      alert('Failed to add bookmark. Please try again.');
    }
  });

  // Remove bookmark mutation
  const { mutate: removeBookmark } = useMutation({
    mutationFn: async () => {
      if (!chapter?.novel) return;
      return await bookmarksAPI.removeBookmark({
        novelId: chapter.novel,
        chapterId: chapterId
      });
    },
    onSuccess: () => {
      setIsBookmarked(false);
      refetchBookmark();
    },
    onError: (error) => {
      console.error('Error removing bookmark:', error);
      alert('Failed to remove bookmark. Please try again.');
    }
  });

  // Get current chapter index and prev/next chapters
  const currentChapterIndex = chapters?.findIndex(c => c._id === chapterId) || 0
  const prevChapter = chapters && currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] : null
  const nextChapter = chapters && currentChapterIndex < chapters.length - 1 ? chapters[currentChapterIndex + 1] : null

  // Navigate to next or previous chapter
  const handleNavigateChapter = (direction) => {
    if (!chapters || !chapter?.novel) return
    
    if (direction === 'prev' && prevChapter) {
      navigate(`/chapters/${prevChapter._id}`)
    } else if (direction === 'next' && nextChapter) {
      navigate(`/chapters/${nextChapter._id}`)
    }
  }

  // Navigate back to novel detail
  const handleBackToNovel = () => {
    if (chapter?.novel) {
      navigate(`/novels/${chapter.novel}`)
    } else {
      navigate('/')
    }
  }

  // Toggle bookmark status
  const toggleBookmark = () => {
    if (!user) {
      alert('Please login to bookmark chapters');
      return;
    }
    
    if (isBookmarked) {
      removeBookmark();
    } else {
      addBookmark();
    }
  };

  // Get current theme colors
  const currentTheme = themeOptions.find(t => t.value === theme) || themeOptions[0]

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Arrow Left -> Previous Chapter
      if (e.key === 'ArrowLeft' && prevChapter) {
        navigate(`/chapters/${prevChapter._id}`)
      }
      // Arrow Right -> Next Chapter
      else if (e.key === 'ArrowRight' && nextChapter) {
        navigate(`/chapters/${nextChapter._id}`)
      }
      // B -> Toggle Bookmark
      else if (e.key === 'b' || e.key === 'B') {
        toggleBookmark()
      }
      // Esc -> Go back to novel
      else if (e.key === 'Escape') {
        handleBackToNovel()
      }
      // Space bar -> Show/hide controls
      else if (e.key === ' ' && e.target === document.body) {
        e.preventDefault() // Prevent page scrolling
        // Don't hide controls if settings are open
        if (!showSettings) {
          setShowControls(!showControls)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [prevChapter, nextChapter, navigate, showControls, toggleBookmark, handleBackToNovel, showSettings])

  return (
    <div 
      className={`min-h-screen ${currentTheme.bg} ${currentTheme.text}`}
      onClick={() => setShowControls(true)}
    >
      {/* Top navigation bar */}
      <div 
        className={`fixed top-0 left-0 right-0 z-10 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className={`w-full p-4 ${theme === 'black' ? 'bg-black text-gray-200' : theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md flex justify-between items-center`}>
          <button
            onClick={handleBackToNovel}
            className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            {novel?.title || 'Back'}
          </button>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleBookmark}
              className="text-gray-600 hover:text-yellow-500 dark:text-gray-300"
              title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isBookmarked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            
            <button 
              onClick={() => {
                setShowSettings(!showSettings)
                // Make sure controls stay visible when settings are open
                setShowControls(true)
              }}
              className="text-gray-600 hover:text-blue-500 dark:text-gray-300"
              title="Reader settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Settings panel */}
        {showSettings && (
          <div className={`w-full p-4 ${theme === 'black' ? 'bg-black text-gray-200' : theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md border-t ${theme === 'black' ? 'border-gray-800' : theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Text Size</h3>
                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => {
                      const currentIndex = fontSizeOptions.findIndex(option => option.value === fontSize)
                      if (currentIndex > 0) {
                        setFontSize(fontSizeOptions[currentIndex - 1].value)
                      }
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600"
                    disabled={fontSize === fontSizeOptions[0].value}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  
                  <span className="text-sm">
                    {fontSizeOptions.find(option => option.value === fontSize)?.label || 'Medium'}
                  </span>
                  
                  <button 
                    onClick={() => {
                      const currentIndex = fontSizeOptions.findIndex(option => option.value === fontSize)
                      if (currentIndex < fontSizeOptions.length - 1) {
                        setFontSize(fontSizeOptions[currentIndex + 1].value)
                      }
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600"
                    disabled={fontSize === fontSizeOptions[fontSizeOptions.length - 1].value}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Text Alignment</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setTextAlign('left')}
                    className={`flex-1 py-1 px-2 rounded ${
                      textAlign === 'left' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                    title="Left align"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => setTextAlign('justify')}
                    className={`flex-1 py-1 px-2 rounded ${
                      textAlign === 'justify' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                    title="Justify"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Theme</h3>
                <div className="flex space-x-2">
                  {themeOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        theme === option.value ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'
                      } ${option.bg}`}
                      title={option.label}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 mb-2">Keyboard Shortcuts</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded mr-1">←</span>
                  <span>Previous Chapter</span>
                </div>
                <div>
                  <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded mr-1">→</span>
                  <span>Next Chapter</span>
                </div>
                <div>
                  <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded mr-1">B</span>
                  <span>Bookmark</span>
                </div>
                <div>
                  <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded mr-1">Esc</span>
                  <span>Back to Novel</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Reading progress bar */}
      <div className={`fixed top-0 left-0 right-0 h-1 ${theme === 'black' ? 'bg-gray-800' : 'bg-gray-200 dark:bg-gray-700'} z-20`}>
        <div 
          className="h-full bg-blue-500" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Main content */}
      <main className="pt-20 pb-20 px-4 sm:px-6 lg:px-0 max-w-2xl mx-auto" ref={contentRef}>
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : chapter ? (
          <div className={`${theme === 'black' || theme === 'dark' ? 'reader-dark' : 'reader-light'}`}>
            <h1 className={`text-3xl font-bold mb-6 text-center ${theme === 'black' ? 'text-gray-100' : ''}`}>
              {chapter.title}
            </h1>
            <h2 className={`text-xl font-medium mb-8 text-center ${theme === 'black' ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>
              Chapter {chapter.chapterNumber}
            </h2>
            
            <div 
              id="chapterContent" 
              className={`prose max-w-none ${theme === 'black' ? 'prose-invert prose-black' : theme === 'dark' ? 'dark:prose-invert' : ''}`} 
              style={{ fontSize, textAlign, lineHeight: '1.8' }}
            >
              <TextSelection chapterId={chapterId}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {chapter.content}
                </ReactMarkdown>
              </TextSelection>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className={`${theme === 'black' ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'} mb-4`}>Chapter not found.</p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return Home
            </button>
          </div>
        )}
      </main>
      
      {/* Bottom navigation */}
      <div 
        className={`fixed bottom-0 left-0 right-0 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className={`w-full p-4 ${theme === 'black' ? 'bg-black' : theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-[0_-1px_3px_rgba(0,0,0,0.1)] flex justify-between`}>
          <button
            onClick={() => handleNavigateChapter('prev')}
            disabled={!prevChapter}
            className={`flex items-center px-4 py-2 rounded-lg ${
              prevChapter ? 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700' : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Previous
          </button>
          
          <div className="text-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentChapterIndex + 1} / {chapters?.length || 1}
            </span>
          </div>
          
          <button
            onClick={() => handleNavigateChapter('next')}
            disabled={!nextChapter}
            className={`flex items-center px-4 py-2 rounded-lg ${
              nextChapter ? 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700' : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChapterDetail 