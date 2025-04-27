import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import api, { chapterAPI } from '../services/api'
import MDEditor from '@uiw/react-md-editor'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './EditChapter.css'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import * as marked from 'marked'
import DOMPurify from 'dompurify'

const EditChapter = () => {
  const { chapterId, novelId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    chapterNumber: 1,
    content: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [previewMode, setPreviewMode] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [autosaveStatus, setAutosaveStatus] = useState('idle') // idle, saving, saved, error
  const [autosaveTimer, setAutosaveTimer] = useState(null)
  
  // Debug log for component mount
  useEffect(() => {
    console.log('EditChapter component mounted, chapterId:', chapterId)
    // Immediately try to fetch chapter data directly
    if (chapterId) {
      fetchChapterDirectly(chapterId);
    }
  }, [chapterId])
  
  // Direct chapter fetching function
  const fetchChapterDirectly = async (id) => {
    try {
      console.log('Directly fetching chapter data for ID:', id);
      const data = await chapterAPI.getChapterForEditing(id);
      console.log('Direct fetch result:', data);
      
      if (data) {
        setFormData({
          title: data.title || '',
          chapterNumber: data.chapterNumber || 1,
          content: data.content || ''
        });
        setDataLoaded(true);
      }
    } catch (error) {
      console.error('Error in direct fetch:', error);
      alert('Failed to load chapter content. Please try again.');
    }
  };
  
  // Fetch chapter details as backup
  const { data: chapter, isLoading, refetch } = useQuery({
    queryKey: ['chapter-edit', chapterId],
    queryFn: async () => {
      console.log('Fetching chapter data for ID:', chapterId)
      return chapterAPI.getChapterForEditing(chapterId);
    },
    onSuccess: (data) => {
      console.log('Chapter data loaded successfully:', data)
      // Only update if direct fetch didn't already work
      if (!dataLoaded) {
      setFormData({
        title: data.title || '',
        chapterNumber: data.chapterNumber || 1,
        content: data.content || ''
        });
        setDataLoaded(true);
      }
    },
    onError: (error) => {
      console.error('Error fetching chapter:', error)
      alert('Failed to fetch chapter details. Please try again.')
    },
    enabled: !!chapterId && !dataLoaded,
    refetchOnMount: true,
    staleTime: 0,
    cacheTime: 0
  })

  // Force refetch on mount
  useEffect(() => {
    if (chapterId) {
      console.log('Forcing refetch of chapter data')
      refetch()
    }
  }, [chapterId, refetch])

  // Additional check for chapter data
  useEffect(() => {
    if (chapter && !dataLoaded) {
      console.log('Chapter data exists but not marked as loaded, loading now:', chapter)
      setFormData({
        title: chapter.title || '',
        chapterNumber: chapter.chapterNumber || 1,
        content: chapter.content || ''
      })
      setDataLoaded(true)
    }
  }, [chapter, dataLoaded])

  // Debug log for form data updates
  useEffect(() => {
    console.log('Current form data:', formData)
  }, [formData])

  // Fetch novel details
  const { data: novel, isLoading: isNovelLoading } = useQuery({
    queryKey: ['novel-for-chapter-edit', novelId || chapter?.novel],
    queryFn: async () => {
      const novelToFetch = novelId || chapter?.novel;
      if (!novelToFetch) return null;
      const response = await api.get(`/novels/${novelToFetch}`);
      return response.data;
    },
    enabled: !!(novelId || chapter?.novel)
  });

  // Check ownership
  useEffect(() => {
    const checkOwnership = async () => {
      if (novel && user && novel.author._id !== user._id) {
        alert('You do not have permission to edit this novel.')
        navigate(`/novels/${novelId}`)
      }
    }

    if (novel && user) {
      checkOwnership()
    }
  }, [novel, user, navigate, novelId])

  // Update chapter mutation
  const { mutate: updateChapter, isPending } = useMutation({
    mutationFn: async (chapterData) => {
      return api.put(`/chapters/chapter/${chapterId}`, chapterData)
    },
    onSuccess: (response) => {
      const novelRoute = novelId || chapter.novel;
      navigate(`/novels/${novelRoute}`);
    },
    onError: (error) => {
      console.error('Error updating chapter:', error)
      alert('Failed to update chapter. Please try again.')
    }
  })

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

  const validateForm = () => {
    const errors = {}
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required'
    }
    
    if (!formData.content.trim()) {
      errors.content = 'Content is required'
    }
    
    if (formData.chapterNumber < 1) {
      errors.chapterNumber = 'Chapter number must be at least 1'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
    updateChapter(formData)
  }
  }
  
  // Handle autosave functionality - only save drafts for changes, not for initial load
  let initialContentRef = useRef(null);
  
  useEffect(() => {
    if (chapter?.content && !initialContentRef.current) {
      initialContentRef.current = chapter.content;
    }
  }, [chapter]);

  useEffect(() => {
    const autosaveInterval = setInterval(() => {
      if (formData.title && formData.content && chapterId) {
        // Only save if content has changed from initial load
        if (initialContentRef.current !== formData.content) {
          setAutosaveStatus('saving');
          localStorage.setItem(`chapter-draft-${chapterId}`, JSON.stringify({
            ...formData,
            lastSaved: new Date().toISOString()
          }));
          
          // Set status to saved after a brief delay
          setTimeout(() => {
            setAutosaveStatus('saved');
            
            // Reset status after 3 seconds
            setTimeout(() => {
              setAutosaveStatus('idle');
            }, 3000);
          }, 800);
        }
      }
    }, 30000); // Autosave every 30 seconds

    return () => clearInterval(autosaveInterval);
  }, [formData, chapterId]);

  return (
    <div className="edit-chapter-container">
      {isLoading ? (
        <div className="edit-chapter-loading">
          <div className="edit-chapter-spinner"></div>
        </div>
      ) : (
        <>
          <div className="edit-chapter-card">
            <div className="edit-chapter-header">
              <div className="edit-chapter-header-content">
                <div className="edit-chapter-title-container">
                  <h1 className="edit-chapter-title">
                    {chapterId ? 'Edit Chapter' : 'Add New Chapter'}
                  </h1>
                  <p className="edit-chapter-subtitle">
                    {novel?.title || 'Loading novel...'}
                  </p>
                </div>
                <div className="edit-chapter-actions">
                  <motion.button
                    type="button"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="edit-chapter-action-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {previewMode ? 'Edit Mode' : 'Preview Mode'}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => navigate(`/novels/${novelId || chapter?.novel}`)}
                    className="edit-chapter-action-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="edit-chapter-form">
              {!previewMode ? (
                <>
                  <div className="edit-chapter-form-grid">
                    <div>
                      <label htmlFor="title" className="edit-chapter-label">
                        Chapter Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={`edit-chapter-input ${formErrors.title ? 'border-red-500' : ''}`}
                        placeholder="Enter chapter title"
                      />
                      {formErrors.title && (
                        <p className="edit-chapter-error">{formErrors.title}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="chapterNumber" className="edit-chapter-label">
                        Chapter Number
                      </label>
                      <input
                        type="number"
                        id="chapterNumber"
                        name="chapterNumber"
                        value={formData.chapterNumber}
                        onChange={handleChange}
                        className={`edit-chapter-input ${formErrors.chapterNumber ? 'border-red-500' : ''}`}
                        placeholder="Enter chapter number (e.g. 1, 2, 3)"
                        min="1"
                      />
                      {formErrors.chapterNumber && (
                        <p className="edit-chapter-error">{formErrors.chapterNumber}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="edit-chapter-form-section">
                    <label htmlFor="content" className="edit-chapter-label">
                      Chapter Content
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      rows={20}
                      value={formData.content}
                      onChange={handleChange}
                      className={`edit-chapter-textarea ${formErrors.content ? 'border-red-500' : ''}`}
                      placeholder="Enter your chapter content here... (You can use Markdown for formatting)"
                    />
                    {formErrors.content && (
                      <p className="edit-chapter-error">{formErrors.content}</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="edit-chapter-preview">
                  <h1>{formData.title || 'Untitled Chapter'}</h1>
                  <div 
                    className="prose prose-invert max-w-none" 
                    dangerouslySetInnerHTML={{ 
                      __html: DOMPurify.sanitize(marked.parse(formData.content || '')) 
                    }}
                  ></div>
                </div>
              )}
              
              <div className="edit-chapter-footer">
                <motion.button
                  type="button"
                  onClick={() => navigate(`/novels/${novelId || chapter?.novel}`)}
                  className="edit-chapter-cancel-btn"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isPending}
                  className="edit-chapter-submit-btn"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isPending ? 'Saving...' : 'Save Chapter'}
                </motion.button>
              </div>
            </form>
          </div>
          
          {(autosaveStatus === 'saving' || autosaveStatus === 'saved') && (
            <div className="edit-chapter-autosave">
              <span className={`edit-chapter-autosave-icon ${autosaveStatus}`}></span>
              <span>{autosaveStatus === 'saving' ? 'Autosaving...' : 'Changes saved'}</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default EditChapter 