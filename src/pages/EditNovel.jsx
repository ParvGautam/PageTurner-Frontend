import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import defaultCover from '../assets/default-cover.png'
import NovelCover from '../components/NovelCover'
import { motion } from 'framer-motion'
import './EditNovel.css'

const EditNovel = () => {
  const { novelId } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    thumbnail: '',
  })
  const [preview, setPreview] = useState('')
  const [formErrors, setFormErrors] = useState({})

  // Fetch novel details
  const { data: novel, isLoading } = useQuery({
    queryKey: ['novel', novelId],
    queryFn: async () => {
      const response = await api.get(`/novels/${novelId}`)
      return response.data
    },
    onSuccess: (data) => {
      setFormData({
        title: data.title || '',
        description: data.description || '',
        genre: data.genre || '',
        thumbnail: '',
      })
      setPreview(data.thumbnail || defaultCover)
      console.log("Loaded thumbnail:", data.thumbnail || defaultCover)
    },
    onError: (error) => {
      console.error('Error fetching novel:', error)
      alert('Failed to fetch novel details. Please try again.')
    }
  })

  // Update novel mutation
  const { mutate: updateNovel, isPending } = useMutation({
    mutationFn: async (novelData) => {
      return api.put(`/novels/${novelId}`, novelData)
    },
    onSuccess: () => {
      navigate(`/novels/${novelId}`)
    },
    onError: (error) => {
      console.error('Error updating novel:', error)
      alert('Failed to update novel. Please try again.')
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

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/i)) {
      setFormErrors(prev => ({
        ...prev,
        thumbnail: 'File must be an image (JPEG, PNG, WEBP)',
      }))
      return
    }
    
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result)
      setFormData(prev => ({ ...prev, thumbnail: reader.result }))
      
      // Clear validation error
      if (formErrors.thumbnail) {
        setFormErrors(prev => ({ ...prev, thumbnail: '' }))
      }
    }
    reader.readAsDataURL(file)
  }

  const validateForm = () => {
    const errors = {}
    // Remove all required field validations
    // Fields are now optional
    
    setFormErrors(errors)
    return true // Always valid since all fields are optional
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    // Create a data object with only fields that have values
    const updateData = {};
    
    // Only include fields that have values
    if (formData.title.trim()) updateData.title = formData.title;
    if (formData.description.trim()) updateData.description = formData.description;
    if (formData.genre.trim()) updateData.genre = formData.genre;
    if (formData.thumbnail) updateData.thumbnail = formData.thumbnail;
    
    updateNovel(updateData)
  }

  return (
    <div className="edit-novel-container">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <motion.button
          onClick={() => navigate(`/novels/${novelId}`)}
          className="edit-novel-back-btn"
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.97 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Novel
        </motion.button>

        <div className="edit-novel-card">
          <div className="edit-novel-header">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5199fc]"></div>
              </div>
            ) : (
              <>
                <h1 className="edit-novel-title">Edit Novel</h1>
                <p className="edit-novel-subtitle">
                  Update information for "{novel?.title}"
                </p>
              </>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="edit-novel-form">
            <div className="edit-novel-form-grid">
              {/* Left Column - Thumbnail */}
              <div>
                <label className="edit-novel-label">
                  Cover Image
                </label>
                <div className="flex flex-col items-center space-y-4">
                  <div className="edit-novel-thumbnail w-full h-64">
                    <NovelCover 
                      coverImage={preview || defaultCover}
                      title="Novel Cover Preview"
                      className="w-full h-full rounded-lg"
                    />
                  </div>
                  <div className="edit-novel-file-input-container">
                    <input
                      type="file"
                      id="thumbnail"
                      name="thumbnail"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleImageChange}
                      className="edit-novel-file-input"
                    />
                    <div className="edit-novel-file-input-btn">
                      Change Cover Image
                    </div>
                  </div>
                  {formErrors.thumbnail && (
                    <p className="edit-novel-error self-start">{formErrors.thumbnail}</p>
                  )}
                </div>
              </div>
              
              {/* Right Column - Form Fields */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="edit-novel-label">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`edit-novel-input ${formErrors.title ? 'border-red-500' : ''}`}
                    placeholder="Enter novel title"
                  />
                  {formErrors.title && (
                    <p className="edit-novel-error">{formErrors.title}</p>
                  )}
                </div>
                
                {/* Genre */}
                <div>
                  <label htmlFor="genre" className="edit-novel-label">
                    Genre
                  </label>
                  <select
                    id="genre"
                    name="genre"
                    value={formData.genre}
                    onChange={handleChange}
                    className={`edit-novel-select ${formErrors.genre ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select a genre</option>
                    <option value="Fantasy">Fantasy</option>
                    <option value="Romance">Romance</option>
                    <option value="Mystery">Mystery</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Horror">Horror</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Thriller">Thriller</option>
                  </select>
                  {formErrors.genre && (
                    <p className="edit-novel-error">{formErrors.genre}</p>
                  )}
                </div>
                
                {/* Description */}
                <div>
                  <label htmlFor="description" className="edit-novel-label">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={5}
                    value={formData.description}
                    onChange={handleChange}
                    className={`edit-novel-textarea ${formErrors.description ? 'border-red-500' : ''}`}
                    placeholder="Enter a description for your novel"
                  />
                  {formErrors.description && (
                    <p className="edit-novel-error">{formErrors.description}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="edit-novel-btn-container">
              <motion.button
                type="button"
                onClick={() => navigate(`/novels/${novelId}`)}
                className="edit-novel-btn-cancel"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={isPending}
                className="edit-novel-btn-submit"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                {isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : 'Save Changes'}
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditNovel 