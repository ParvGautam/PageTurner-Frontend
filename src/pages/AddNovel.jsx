/* eslint-disable no-unused-vars */
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../services/api'
import '../styles/3dBook.css'
import '../styles/home.css'

const GENRES = [
  'Fantasy',
  'Science Fiction',
  'Mystery',
  'Thriller',
  'Romance',
  'Horror',
  'Adventure',
  'Historical Fiction',
  'Young Adult',
  'Children',
  'Comedy',
  'Drama',
  'Action',
  'Short Story',
  'Other'
]

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

const formFieldVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

// Function to get color based on genre
const getGenreColor = (genre) => {
  const colors = {
    'Fantasy': '#5199fc',
    'Romance': '#ff69b4',
    'Mystery': '#da70d6',
    'Thriller': '#ff9868',
    'Horror': '#ff5068',
    'Adventure': '#6adb91',
    'Science Fiction': '#6eb5ff',
    'Historical Fiction': '#ffd700',
    'Young Adult': '#b19cd9',
    'Children': '#66cdaa',
    'Comedy': '#ffdb58',
    'Drama': '#fa8072',
    'Action': '#ff6347',
    'Short Story': '#87ceeb',
    'Other': '#c0c0c0'
  };
  
  return colors[genre] || '#5199fc';
};

const AddNovel = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    thumbnail: null
  })
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const [formErrors, setFormErrors] = useState({})

  // Create novel mutation
  const { mutate: createNovel, isPending } = useMutation({
    mutationFn: async (novelData) => {
      const response = await api.post('/novels', novelData)
      return response.data
    },
    onSuccess: (data) => {
      console.log('Novel created successfully:', data)
      // Navigate to the add chapter page for this novel
      navigate(`/novels/${data.newNovel._id}/add-chapter`)
    },
    onError: (error) => {
      console.error('Error creating novel:', error)
      alert('Failed to create novel. Please try again.')
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

  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.match('image.*')) {
      setFormErrors(prev => ({ ...prev, thumbnail: 'Please select an image file' }))
      return
    }
    
    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      setFormErrors(prev => ({ ...prev, thumbnail: 'Image is too large. Please select an image under 2MB' }))
      return
    }
    
    try {
      // Convert to base64 for preview and submission
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result)
        setFormData(prev => ({ ...prev, thumbnail: reader.result }))
        setFormErrors(prev => ({ ...prev, thumbnail: '' }))
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error processing image:', error)
      setFormErrors(prev => ({ ...prev, thumbnail: 'Error processing image. Please try again.' }))
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.title.trim()) errors.title = 'Title is required'
    if (!formData.description.trim()) errors.description = 'Description is required'
    if (!formData.genre) errors.genre = 'Please select a genre'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    createNovel(formData)
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-black text-white py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with animated book spine decoration */}
        <motion.div 
          className="relative flex items-center justify-center mb-12"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          {/* Decorative book spine */}
          <div className="absolute -left-20 top-10 z-0 opacity-40 sm:opacity-70">
            <div className="book-spine book-spine-red" style={{ width: '45px', transform: 'rotate(15deg)' }}>
              Story
            </div>
          </div>
          
          <div className="absolute -right-10 top-5 z-0 opacity-40 sm:opacity-70">
            <div className="book-spine book-spine-blue" style={{ width: '55px', transform: 'rotate(-10deg)' }}>
              Create
            </div>
          </div>
          
          {/* Page Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white relative z-10 text-center">
            Create Your Novel
            <span className="block h-1 w-24 bg-[#ff5068] mt-4 mx-auto rounded-full"></span>
          </h1>
        </motion.div>

        {/* Main Form Area */}
        <motion.div 
          className="bg-gray-900/70 backdrop-blur-sm rounded-xl shadow-xl border border-gray-800 overflow-hidden"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="p-8">
            <p className="text-gray-300 mb-8 text-center max-w-2xl mx-auto">
              Share your story with the world. Fill in the details below to create your novel, then you'll be able to add chapters.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title */}
              <motion.div 
                custom={0}
                variants={formFieldVariants}
                initial="hidden"
                animate="visible"
              >
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                  Book Title <span className="text-[#ff5068]">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Enter the title of your novel"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full bg-gray-800/90 text-white border ${formErrors.title ? 'border-[#ff5068]' : 'border-gray-700'} rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#5199fc] focus:border-transparent transition duration-200`}
                />
                {formErrors.title && (
                  <p className="mt-2 text-sm text-[#ff5068]">{formErrors.title}</p>
                )}
              </motion.div>
              
              {/* Description */}
              <motion.div 
                custom={1}
                variants={formFieldVariants}
                initial="hidden"
                animate="visible"
              >
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Description <span className="text-[#ff5068]">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  placeholder="Write a compelling description of your novel that will hook readers..."
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full bg-gray-800/90 text-white border ${formErrors.description ? 'border-[#ff5068]' : 'border-gray-700'} rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#5199fc] focus:border-transparent transition duration-200`}
                />
                {formErrors.description && (
                  <p className="mt-2 text-sm text-[#ff5068]">{formErrors.description}</p>
                )}
              </motion.div>
              
              {/* Genre */}
              <motion.div 
                custom={2}
                variants={formFieldVariants}
                initial="hidden"
                animate="visible"
                className="relative"
              >
                <label htmlFor="genre" className="block text-sm font-medium text-gray-300 mb-2">
                  Genre <span className="text-[#ff5068]">*</span>
                </label>
                <select
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  className={`w-full bg-gray-800/90 text-white border ${formErrors.genre ? 'border-[#ff5068]' : 'border-gray-700'} rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#5199fc] focus:border-transparent transition duration-200 appearance-none`}
                  style={{
                    borderLeft: formData.genre ? `4px solid ${getGenreColor(formData.genre)}` : 'none'
                  }}
                >
                  <option value="">Select a genre</option>
                  {GENRES.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 pt-6">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                {formErrors.genre && (
                  <p className="mt-2 text-sm text-[#ff5068]">{formErrors.genre}</p>
                )}
              </motion.div>
              
              {/* Thumbnail */}
              <motion.div 
                custom={3}
                variants={formFieldVariants}
                initial="hidden"
                animate="visible"
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cover Image
                </label>
                <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="relative">
                    {thumbnailPreview ? (
                      <div className="perspective-500">
                        <div className="book-cover relative h-64 w-48 overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-105">
                          <img
                            src={thumbnailPreview}
                            alt="Novel cover"
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                          <div className="absolute bottom-0 left-0 w-full p-3">
                            <p className="text-sm text-white font-medium truncate">{formData.title || 'Your Novel Title'}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="perspective-500">
                        <div className="book-cover relative flex h-64 w-48 items-center justify-center rounded-lg bg-gradient-to-b from-gray-700 to-gray-900 shadow-lg border border-gray-700 text-gray-400 transition-transform hover:scale-105">
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm text-center">Book Cover</p>
                            <p className="text-xs text-center mt-1 text-gray-500">Upload an image to preview</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col items-start">
                      <label htmlFor="thumbnail" className="cursor-pointer rounded-md bg-gray-800 px-4 py-2 font-medium text-white hover:bg-gray-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-[#5199fc] transition duration-200">
                        <span>Upload cover image</span>
                        <input
                          id="thumbnail"
                          name="thumbnail"
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="mt-2 text-xs text-gray-400">PNG, JPG, GIF up to 2MB</p>
                    </div>
                    
                    {formErrors.thumbnail && (
                      <p className="text-sm text-[#ff5068]">{formErrors.thumbnail}</p>
                    )}
                    
                    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                      <h4 className="text-sm font-medium text-white mb-1">Cover Image Tips:</h4>
                      <ul className="text-xs text-gray-400 space-y-1 pl-4 list-disc">
                        <li>Use high-quality images for your cover</li>
                        <li>Recommended size: 1400 x 2100 pixels (2:3 ratio)</li>
                        <li>Keep important elements centered</li>
                        <li>Make sure text is readable on small thumbnails</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Submit Button */}
              <motion.div 
                custom={4}
                variants={formFieldVariants}
                initial="hidden"
                animate="visible"
                className="pt-4"
              >
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="px-6 py-3 rounded-lg text-white bg-gray-800 hover:bg-gray-700 transition duration-200 flex-1 sm:flex-initial"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className={`px-6 py-3 rounded-lg text-white font-medium flex-1 sm:flex-initial ${isPending ? 'bg-gray-700' : 'bg-gradient-to-r from-[#5199fc] to-[#5199fc]/80 hover:from-[#5199fc]/90 hover:to-[#5199fc]/70'} transition duration-200 shadow-lg disabled:opacity-60`}
                  >
                    {isPending ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </span>
                    ) : 'Create Novel'}
                  </button>
                </div>
              </motion.div>
            </form>
          </div>
        </motion.div>
        
        {/* Decorative elements */}
        <div className="opacity-20 absolute -bottom-20 -right-20 pointer-events-none">
          <div className="book-spine book-spine-purple" style={{ width: '65px', transform: 'rotate(-15deg)' }}>
            Publish
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddNovel 