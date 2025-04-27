import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import api from '../services/api'
import MDEditor from '@uiw/react-md-editor'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './EditChapter.css'
import '../styles/3dBook.css'
import '../styles/home.css'

// Custom styles for the markdown editor
import './MarkdownEditor.css'

// Animation variants for elements
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const slideIn = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const AddChapter = () => {
  const { novelId } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    chapterNumber: 1 // Default to chapter 1
  })
  const [formErrors, setFormErrors] = useState({})
  const [previewMode, setPreviewMode] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [autoSaveStatus, setAutoSaveStatus] = useState(null)

  // Fetch the novel to display its title
  const { data: novel, isLoading: isNovelLoading } = useQuery({
    queryKey: ['novel', novelId],
    queryFn: async () => {
      const response = await api.get(`/novels/${novelId}`)
      return response.data
    },
    onError: (error) => {
      console.error('Error fetching novel:', error)
      alert('Failed to fetch novel information. Please try again.')
    }
  })

  // Fetch existing chapters to determine the next chapter number
  const { data: chapters, isLoading: areChaptersLoading } = useQuery({
    queryKey: ['chapters', novelId],
    queryFn: async () => {
      const response = await api.get(`/chapters/${novelId}`)
      return response.data
    },
    onSuccess: (data) => {
      // If chapters exist, set the next chapter number
      if (data && data.length > 0) {
        const maxChapterNumber = Math.max(...data.map(c => c.chapterNumber))
        setFormData(prev => ({ ...prev, chapterNumber: maxChapterNumber + 1, title: '', content: '' }))
      }
    },
    onError: (error) => {
      console.error('Error fetching chapters:', error)
    }
  })

  // Create chapter mutation
  const { mutate: createChapter, isPending } = useMutation({
    mutationFn: async (chapterData) => {
      const response = await api.post(`/chapters/${novelId}`, chapterData)
      return response.data
    },
    onSuccess: (data) => {
      console.log('Chapter created successfully:', data)
      // Clear draft after successful creation
      localStorage.removeItem(`chapter-draft-new-${novelId}`)
      // Navigate to the novel detail page
      navigate(`/novels/${novelId}`)
    },
    onError: (error) => {
      console.error('Error creating chapter:', error)
      alert('Failed to create chapter. Please try again.')
    }
  })

  // Reset form data and clear previous drafts when component mounts
  useEffect(() => {
    // Clear all drafts for this novel to start fresh
    localStorage.removeItem(`chapter-draft-new-${novelId}`)
    
    // Reset form data to empty state (except chapterNumber which is set from the API)
    setFormData(prev => ({
      ...prev,
      title: '',
      content: ''
    }))
  }, [novelId]);

  // Calculate word count when content changes
  useEffect(() => {
    if (formData.content) {
      const words = formData.content.trim().split(/\s+/).filter(Boolean).length;
      setWordCount(words);
    } else {
      setWordCount(0);
    }
  }, [formData.content]);

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear validation error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleContentChange = (value) => {
    setFormData(prev => ({ ...prev, content: value || '' }))
    
    // Clear validation error when user types
    if (formErrors.content) {
      setFormErrors(prev => ({ ...prev, content: '' }))
    }
  }

  // Handle autosave functionality - only save after user has started typing
  useEffect(() => {
    const autosaveInterval = setInterval(() => {
      if ((formData.title || formData.content) && novelId) {
        localStorage.setItem(`chapter-draft-new-${novelId}`, JSON.stringify(formData));
        setAutoSaveStatus('Saved just now');
        
        // Reset the status message after 3 seconds
        setTimeout(() => {
          setAutoSaveStatus('Auto-saved');
        }, 3000);
      }
    }, 30000); // Autosave every 30 seconds

    return () => clearInterval(autosaveInterval);
  }, [formData, novelId]);

  const validateForm = () => {
    const errors = {}
    if (!formData.title.trim()) errors.title = 'Title is required'
    if (!formData.content.trim()) errors.content = 'Content is required'
    if (!formData.chapterNumber) errors.chapterNumber = 'Chapter number is required'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    createChapter(formData)
  }

  const isLoading = isNovelLoading || areChaptersLoading

  // Generate an inspiring writing quote
  const inspiringQuotes = [
    "Write without fear. Edit without mercy.",
    "Your first draft doesn't have to be perfect, it just needs to be written.",
    "The cure for writer's block is to simply sit down and write.",
    "Stories live forever, but only if you give them life.",
    "Every great story starts with just one word.",
    "Write with passion, revise with precision.",
    "Show the readers a world they've never seen before.",
    "Let your characters lead the way."
  ];
  
  const randomQuote = inspiringQuotes[Math.floor(Math.random() * inspiringQuotes.length)];

  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5199fc]"></div>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="flex flex-col h-full gap-8"
          >
            {/* Header Section */}
            <motion.div className="relative mb-6" variants={slideIn}>
              <div className="absolute -left-6 top-10 opacity-20 sm:opacity-40 z-0">
                <div className="book-spine book-spine-blue" style={{ width: '50px', transform: 'rotate(15deg)' }}>
                  Story
                </div>
              </div>
                
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 relative z-10">
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <span className="text-[#ff5068]">Chapter {formData.chapterNumber}:</span> 
                    New Chapter
                  </h1>
                  <div className="mt-2 text-gray-400 flex items-center">
                    <span className="text-[#5199fc]">Novel:</span>
                    <span className="ml-2 text-white font-medium">{novel?.title || 'Loading novel...'}</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {autoSaveStatus && (
                      <div className="flex items-center">
                        <svg className="h-3 w-3 text-green-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {autoSaveStatus}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-4 mt-4 sm:mt-0">
                  <button
                    type="button"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="px-5 py-2.5 rounded-lg transition-all text-sm font-medium bg-gray-800 hover:bg-gray-700 border border-gray-700"
                  >
                    {previewMode ? 'Edit Mode' : 'Preview Mode'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/novels/${novelId}`)}
                    className="px-5 py-2.5 rounded-lg transition-all text-sm font-medium bg-gray-800 hover:bg-gray-700 border border-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
                
              {/* Inspiring quote */}
              <div className="text-sm italic text-gray-500 max-w-3xl font-serif mb-6">
                "{randomQuote}"
              </div>
            </motion.div>
            
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-8">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                    Chapter Title <span className="text-[#ff5068]">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full bg-gray-800/90 text-white border ${
                      formErrors.title ? 'border-[#ff5068]' : 'border-gray-700'
                    } rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#5199fc] focus:border-transparent transition duration-200`}
                    placeholder="Enter chapter title"
                  />
                  {formErrors.title && (
                    <p className="mt-2 text-sm text-[#ff5068]">{formErrors.title}</p>
                  )}
                </div>
              
                <div>
                  <label htmlFor="chapterNumber" className="block text-sm font-medium text-gray-300 mb-2">
                    Chapter Number <span className="text-[#ff5068]">*</span>
                  </label>
                  <input
                    type="number"
                    id="chapterNumber"
                    name="chapterNumber"
                    value={formData.chapterNumber}
                    onChange={handleChange}
                    min="1"
                    className={`w-full bg-gray-800/90 text-white border ${
                      formErrors.chapterNumber ? 'border-[#ff5068]' : 'border-gray-700'
                    } rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#5199fc] focus:border-transparent transition duration-200`}
                  />
                  {formErrors.chapterNumber && (
                    <p className="mt-2 text-sm text-[#ff5068]">{formErrors.chapterNumber}</p>
                  )}
                </div>
              </div>
                
              <motion.div className="flex-1 flex flex-col" variants={fadeIn}>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Chapter Content <span className="text-[#ff5068]">*</span>
                  </label>
                  <div className="text-xs text-gray-500">
                    {wordCount > 0 && (
                      <span>Word count: <span className="text-[#5199fc]">{wordCount}</span></span>
                    )}
                  </div>
                </div>
                  
                <div className="flex-1 flex flex-col relative">
                  {previewMode ? (
                    <div className="markdown-preview border border-gray-700 rounded-lg p-8 prose prose-invert max-w-none min-h-[600px] bg-gray-900/50 overflow-y-auto flex-1">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {formData.content || "*No content yet. Switch to Edit Mode to start writing.*"}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="editor-container flex-1 flex flex-col bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                      <div className="flex items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="text-xs text-gray-400 ml-4">Markdown Editor</div>
                      </div>
                      <div className="flex-1 h-[600px]" data-color-mode="dark">
                        <MDEditor
                          value={formData.content}
                          onChange={handleContentChange}
                          height="600px"
                          preview="edit"
                          className={`w-full ${formErrors.content ? 'md-editor-error' : ''}`}
                          textareaProps={{
                            placeholder: 'Start writing your chapter content here...'
                          }}
                        />
                      </div>
                      {formErrors.content && (
                        <div className="px-4 py-2 bg-[#ff5068]/10 border-t border-[#ff5068]/30">
                          <p className="text-sm text-[#ff5068]">{formErrors.content}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                  
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-400 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <span className="inline-flex items-center">
                    <code className="bg-gray-700 text-xs p-1.5 rounded"># Heading</code>
                  </span>
                  <span className="inline-flex items-center">
                    <code className="bg-gray-700 text-xs p-1.5 rounded">## Subheading</code>
                  </span>
                  <span className="inline-flex items-center">
                    <code className="bg-gray-700 text-xs p-1.5 rounded">**bold**</code>
                  </span>
                  <span className="inline-flex items-center">
                    <code className="bg-gray-700 text-xs p-1.5 rounded">*italic*</code>
                  </span>
                  <span className="inline-flex items-center">
                    <code className="bg-gray-700 text-xs p-1.5 rounded">[link](url)</code>
                  </span>
                  <span className="inline-flex items-center">
                    <code className="bg-gray-700 text-xs p-1.5 rounded">![image](url)</code>
                  </span>
                  <span className="inline-flex items-center">
                    <code className="bg-gray-700 text-xs p-1.5 rounded">> blockquote</code>
                  </span>
                  <span className="inline-flex items-center">
                    <code className="bg-gray-700 text-xs p-1.5 rounded">- list item</code>
                  </span>
                </div>
              </motion.div>
                
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="submit"
                  disabled={isPending}
                  className={`px-8 py-3.5 rounded-lg text-white font-medium ${
                    isPending
                      ? 'bg-gray-700'
                      : 'bg-gradient-to-r from-[#5199fc] to-[#5199fc]/80 hover:from-[#5199fc]/90 hover:to-[#5199fc]/70'
                  } transition duration-200 shadow-lg disabled:opacity-60`}
                >
                  {isPending ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Publishing...
                    </span>
                  ) : (
                    'Publish Chapter'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default AddChapter 