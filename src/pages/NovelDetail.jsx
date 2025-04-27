import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import defaultCover from '../assets/default-cover.png'
import CommentSection from '../components/CommentSection'
import AddToLibrary from '../components/AddToLibrary'
import AnimatedBook from '../components/AnimatedBook'
import { motion } from 'framer-motion'
import { FaStar, FaBookOpen, FaUserEdit, FaClock } from 'react-icons/fa'
import './NovelDetail.css'
import '../styles/3dBook.css'
import '../styles/home.css'

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const NovelDetail = () => {
  const { novelId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showChapterDeleteConfirm, setShowChapterDeleteConfirm] = useState(false)
  const [chapterToDelete, setChapterToDelete] = useState(null)
  
  // Fetch novel details
  const { data: novel, isLoading: isNovelLoading } = useQuery({
    queryKey: ['novel', novelId],
    queryFn: async () => {
      const response = await api.get(`/novels/${novelId}`)
      return response.data
    },
    onError: (error) => {
      console.error('Error fetching novel:', error)
      alert('Failed to fetch novel information.')
    }
  })
  
  // Fetch chapters
  const { data: chapters, isLoading: areChaptersLoading } = useQuery({
    queryKey: ['chapters', novelId],
    queryFn: async () => {
      try {
        const response = await api.get(`/chapters/${novelId}`)
        return response.data
      } catch (error) {
        console.error('Error fetching chapters:', error)
        return []
      }
    },
    onError: (error) => {
      console.error('Error fetching chapters:', error)
    }
  })

  // Fetch author profile to get following status
  const { data: authorProfile } = useQuery({
    queryKey: ['author-profile', novel?.author?._id],
    queryFn: async () => {
      if (!novel?.author?._id) return null
      const response = await api.get(`/user/profile/${novel.author._id}`)
      return response.data
    },
    enabled: !!novel?.author?._id && !!user && user._id !== novel?.author?._id
  })

  // Check if user is following the author
  const isFollowing = user && authorProfile?.followers?.some(
    follower => follower._id === user._id
  )

  // Follow mutation
  const { mutate: followAuthor } = useMutation({
    mutationFn: async () => {
      return api.post(`/user/follow/${novel.author._id}`)
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries(['author-profile', novel?.author?._id])
      queryClient.invalidateQueries(['following-novels'])
    },
    onError: (error) => {
      console.error('Error following author:', error)
      alert('Failed to follow author. Please try again.')
    }
  })

  // Unfollow mutation
  const { mutate: unfollowAuthor } = useMutation({
    mutationFn: async () => {
      return api.post(`/user/unfollow/${novel.author._id}`)
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries(['author-profile', novel?.author?._id])
      queryClient.invalidateQueries(['following-novels'])
    },
    onError: (error) => {
      console.error('Error unfollowing author:', error)
      alert('Failed to unfollow author. Please try again.')
    }
  })

  // Delete novel mutation
  const { mutate: deleteNovel, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      return api.delete(`/novels/${novelId}`)
    },
    onSuccess: () => {
      navigate('/')
    },
    onError: (error) => {
      console.error('Error deleting novel:', error)
      alert('Failed to delete novel. Please try again.')
    }
  })

  // Delete chapter mutation
  const { mutate: deleteChapter, isPending: isDeletingChapter } = useMutation({
    mutationFn: async (chapterId) => {
      return api.delete(`/chapters/chapter/${chapterId}`)
    },
    onSuccess: () => {
      setShowChapterDeleteConfirm(false)
      setChapterToDelete(null)
      // Invalidate and refetch chapters
      queryClient.invalidateQueries(['chapters', novelId])
    },
    onError: (error) => {
      console.error('Error deleting chapter:', error)
      alert('Failed to delete chapter. Please try again.')
    }
  })

  const handleFollowToggle = () => {
    if (!user) {
      navigate('/login')
      return
    }
    
    if (isFollowing) {
      unfollowAuthor()
    } else {
      followAuthor()
    }
  }
  
  const isLoading = isNovelLoading || areChaptersLoading
  const isAuthor = user && novel && user._id === novel.author._id
  
  // Navigate to add chapter page
  const handleAddChapter = () => {
    navigate(`/novels/${novelId}/add-chapter`)
  }
  
  // Navigate to read chapter page
  const handleReadChapter = (chapterId) => {
    navigate(`/chapters/${chapterId}`)
  }

  const handleDeleteNovel = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    deleteNovel()
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
  }
  
  const confirmChapterDelete = () => {
    if (chapterToDelete) {
      deleteChapter(chapterToDelete._id)
    }
  }
  
  const cancelChapterDelete = () => {
    setShowChapterDeleteConfirm(false)
    setChapterToDelete(null)
  }
  
  // Function to get appropriate color based on genre
  const getGenreColor = (genre) => {
    const colors = {
      'Fantasy': '#5199fc',
      'Romance': '#ff69b4',
      'Mystery': '#da70d6',
      'Sci-Fi': '#6eb5ff',
      'Non-Fiction': '#ffd700',
      'Horror': '#ff5068',
      'Adventure': '#6adb91',
      'Thriller': '#ff9868'
    };
    
    return colors[genre] || '#5199fc';
  };
  
  return (
    <div className="min-h-screen bg-black text-white premium-bg">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-[#5199fc]"></div>
          </div>
        ) : novel ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            {/* Back button */}
            <motion.button 
              onClick={() => navigate(-1)}
              className="flex items-center text-white mb-8 hover:text-[#5199fc] transition-colors"
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Browse
            </motion.button>
            
            {/* Novel detail layout - premium style */}
            <div className="novel-card relative">
              {novel.price && (
                <div className="premium-badge">Premium</div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
                {/* Left Column - Book Cover */}
                <div className="md:col-span-1">
                  <div className="book-container flex justify-center">
                    <div className="w-[220px]">
                      <AnimatedBook 
                        coverImage={novel.thumbnail || defaultCover}
                        title={novel.title}
                        description={novel.description}
                        author={novel.author?.username || "Unknown"}
                      />
                      <div className="text-xs text-[#5199fc] mt-2 text-center italic">
                        Hover over the book to see it open
                      </div>
                      <div className="book-reflection"></div>
                    </div>
                  </div>
                  
                  {/* Stats area on mobile only */}
                  <div className="stats-grid md:hidden mt-6">
                    <div className="stat-item">
                      <span className="stat-label">Rating</span>
                      <div className="stat-value flex items-center">
                        <span>{novel.rating ? novel.rating.toFixed(1) : '0.0'}</span>
                        <FaStar className="text-[#5199fc] ml-1" />
                      </div>
                    </div>
                    
                    <div className="stat-item">
                      <span className="stat-label">Chapters</span>
                      <span className="stat-value">{chapters?.length || 0}</span>
                    </div>
                  </div>
                </div>
                
                {/* Right Column - Book Details */}
                <div className="md:col-span-2">
                  {/* Title and Author */}
                  <h1 className="text-3xl font-bold text-white mb-2">{novel.title}</h1>
                  
                  <div className="author-badge">
                    <div className="bg-[#5199fc] author-avatar flex items-center justify-center">
                      <span className="text-xs">{novel.author?.username.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-gray-300">by {novel.author?.username}</span>
                  </div>
                  
                  {/* Genre and stats row on larger screens */}
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <span 
                      className="genre-pill" 
                      style={{
                        background: `linear-gradient(135deg, ${getGenreColor(novel.genre)}, ${getGenreColor(novel.genre)}99)`,
                        color: 'white'
                      }}
                    >
                      {novel.genre}
                    </span>
                    
                    <div className="hidden md:flex items-center text-gray-400 text-sm">
                      <FaBookOpen className="mr-1" />
                      <span>{chapters?.length || 0} chapters</span>
                    </div>
                    
                    <div className="hidden md:flex items-center text-gray-400 text-sm ml-4">
                      <FaStar className="mr-1 text-[#5199fc]" />
                      <span>{novel.rating ? novel.rating.toFixed(1) : '0.0'}</span>
                    </div>
                    
                    {novel.createdAt && (
                      <div className="hidden md:flex items-center text-gray-400 text-sm ml-4">
                        <FaClock className="mr-1" />
                        <span>{new Date(novel.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Author actions */}
                  {!isAuthor && user && (
                    <motion.button
                      onClick={handleFollowToggle}
                      className={`mt-6 border text-sm px-4 py-1.5 rounded-full transition-colors ${
                        isFollowing 
                          ? 'border-[#5199fc] bg-[#5199fc]/10 text-[#5199fc]' 
                          : 'border-gray-600 text-gray-300 hover:border-[#5199fc] hover:text-[#5199fc]'
                      }`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                      </svg>
                      {isFollowing ? 'Following Author' : 'Follow Author'}
                    </motion.button>
                  )}
                  
                  {isAuthor && (
                    <div className="flex flex-wrap gap-3 mt-6">
                      <motion.button
                        onClick={() => navigate(`/novels/${novelId}/edit`)}
                        className="flex items-center text-sm bg-transparent border border-[#5199fc] text-[#5199fc] px-4 py-1.5 rounded-lg hover:bg-[#5199fc]/10"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <FaUserEdit className="mr-2" />
                        Edit Novel
                      </motion.button>
                      <motion.button
                        onClick={handleDeleteNovel}
                        className="flex items-center text-sm bg-transparent border border-red-500 text-red-500 px-4 py-1.5 rounded-lg hover:bg-red-500/10"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete Novel
                      </motion.button>
                    </div>
                  )}
                  
                  {/* Synopsis */}
                  <div className="mt-8">
                    <h3 className="text-xl font-bold mb-3 text-white flex items-center">
                      <span className="w-1 h-6 bg-[#5199fc] rounded mr-3"></span>
                      Synopsis
                    </h3>
                    <p className="book-description">{novel.description}</p>
                  </div>
                  
                  {/* Price and Actions */}
                  <div className="mt-8">
                    {novel.price && (
                      <div className="mb-4">
                        <div className="price-tag">${novel.price || '100'}</div>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-3">
                      <motion.button
                        onClick={() => chapters?.length && handleReadChapter(chapters[0]._id)}
                        disabled={!chapters?.length}
                        className="btn-premium flex-1 max-w-[200px] flex items-center justify-center"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <FaBookOpen className="mr-2" />
                        Start Reading
                      </motion.button>
                      
                      {!isAuthor && user && (
                        <AddToLibrary novelId={novelId} className="flex-1 max-w-[200px]" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Chapters section */}
            {chapters?.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
                  <span className="w-1 h-6 bg-[#5199fc] rounded mr-3"></span>
                  Chapters
                </h2>
                <div className="novel-card">
                  <div className="divide-y divide-gray-800">
                    {chapters.map((chapter) => (
                      <motion.div 
                        key={chapter._id}
                        className="chapter-item flex justify-between items-center py-4 px-6 cursor-pointer"
                        onClick={() => handleReadChapter(chapter._id)}
                        whileHover={{ x: 5 }}
                      >
                        <div>
                          <h3 className="font-medium text-white text-lg">Chapter {chapter.chapterNumber}: {chapter.title}</h3>
                          <div className="flex items-center text-sm text-gray-400 mt-1">
                            <FaClock className="mr-1 text-xs" />
                            <span>Added {new Date(chapter.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        {isAuthor && (
                          <div className="flex space-x-2">
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/novels/${novelId}/edit-chapter/${chapter._id}`);
                              }}
                              className="p-2 text-[#5199fc] hover:bg-[#5199fc]/10 rounded-full"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </motion.button>
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                setChapterToDelete(chapter);
                                setShowChapterDeleteConfirm(true);
                              }}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </motion.button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                    
                    {isAuthor && (
                      <motion.div 
                        onClick={handleAddChapter}
                        className="flex justify-center items-center p-5 bg-[#5199fc]/5 hover:bg-[#5199fc]/10 transition-colors cursor-pointer"
                        whileHover={{ y: -3 }}
                        whileTap={{ y: 0 }}
                      >
                        <div className="flex items-center text-[#5199fc]">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="font-medium">Add New Chapter</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Comment Section */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
                <span className="w-1 h-6 bg-[#5199fc] rounded mr-3"></span>
                Comments
              </h2>
              <div className="novel-card">
                <CommentSection novelId={novelId} user={user} />
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <p className="text-[#5199fc] mb-6 text-xl">Novel not found.</p>
            <motion.button
              onClick={() => navigate('/')}
              className="btn-premium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Return Home
            </motion.button>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
            <motion.div 
              className="modal-content p-8 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <h3 className="text-2xl font-bold mb-4 text-white">Delete Novel</h3>
              <p className="text-gray-300 mb-8">
                Are you sure you want to delete this novel? This will also delete all chapters and cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <motion.button
                  onClick={cancelDelete}
                  className="btn-secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-6 py-2.5 border border-transparent rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isDeleting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </div>
                  ) : 'Delete Novel'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
        
        {/* Chapter Delete Confirmation Modal */}
        {showChapterDeleteConfirm && chapterToDelete && (
          <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
            <motion.div 
              className="modal-content p-8 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <h3 className="text-2xl font-bold mb-4 text-white">Delete Chapter</h3>
              <p className="text-gray-300 mb-8">
                Are you sure you want to delete the chapter "{chapterToDelete.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <motion.button
                  onClick={cancelChapterDelete}
                  className="btn-secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={confirmChapterDelete}
                  disabled={isDeletingChapter}
                  className="px-6 py-2.5 border border-transparent rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isDeletingChapter ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </div>
                  ) : 'Delete Chapter'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NovelDetail 