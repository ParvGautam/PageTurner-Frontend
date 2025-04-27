import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import defaultAvatar from '../assets/default-avatar.png'
import StarRating from './StarRating'
import './CommentSection.css'

const CommentSection = ({ novelId, user }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(0)
  const [error, setError] = useState('')

  // Fetch comments for the novel
  const { 
    data: comments, 
    isLoading: isLoadingComments 
  } = useQuery({
    queryKey: ['comments', novelId],
    queryFn: async () => {
      const response = await api.get(`/comments/${novelId}`)
      return response.data
    }
  })

  // Fetch average rating
  const { 
    data: averageRating 
  } = useQuery({
    queryKey: ['rating', novelId],
    queryFn: async () => {
      const response = await api.get(`/comments/${novelId}/average`)
      return response.data
    }
  })

  // Check if user has already commented
  const hasUserCommented = comments?.some(comment => comment.user?._id === user?._id)

  // Add comment mutation
  const { mutate: addComment, isPending: isAddingComment } = useMutation({
    mutationFn: async (commentData) => {
      return api.post(`/comments/${novelId}`, commentData)
    },
    onSuccess: () => {
      setComment('')
      setRating(0)
      setError('')
      // Invalidate and refetch comments and rating
      queryClient.invalidateQueries(['comments', novelId])
      queryClient.invalidateQueries(['rating', novelId])
    },
    onError: (error) => {
      console.error('Error adding comment:', error)
      setError(error.response?.data?.error || 'Failed to add comment')
    }
  })

  const handleRatingChange = (newRating) => {
    setRating(newRating)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!user) {
      navigate('/login')
      return
    }
    
    if (rating === 0) {
      setError('Please select a rating')
      return
    }
    
    if (!comment.trim()) {
      setError('Please enter a comment')
      return
    }
    
    addComment({ comment, stars: rating })
  }

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="comment-section">
      <div className="comment-header">
        <h2 className="comment-title">Reviews & Ratings</h2>
        {averageRating && (
          <div className="comment-average-rating">
            <div className="comment-average-rating-stars">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i} 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill={i < (averageRating.averageRating / 2) ? "currentColor" : "none"}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={i < (averageRating.averageRating / 2) ? "0" : "1.5"} 
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" 
                  />
                </svg>
              ))}
            </div>
            <span className="comment-average-rating-value">{averageRating.averageRating}</span>
            <span className="comment-average-rating-max">/ 10</span>
          </div>
        )}
      </div>

      {/* Add Comment Form */}
      {user && !hasUserCommented && (
        <div className="comment-form-container">
          <h3 className="comment-form-title">Add Your Review</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="comment-form-label">Rating</label>
              <StarRating rating={rating} onRatingChange={handleRatingChange} />
            </div>
            <div className="mb-4">
              <label htmlFor="comment" className="comment-form-label">
                Your Review
              </label>
              <textarea
                id="comment"
                name="comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="comment-form-textarea"
                placeholder="Share your thoughts about this novel..."
              />
            </div>
            {error && <p className="comment-form-error">{error}</p>}
            <button
              type="submit"
              disabled={isAddingComment}
              className="comment-form-button"
            >
              {isAddingComment ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {/* Comments List */}
      <div className="comment-list-container">
        {isLoadingComments ? (
          <div className="comment-loading">
            <div className="comment-loading-spinner"></div>
          </div>
        ) : comments?.length > 0 ? (
          <ul className="comment-list">
            {comments.map((comment) => (
              <li key={comment._id} className="comment-item">
                <div className="comment-item-content">
                  <img 
                    className="comment-item-avatar"
                    src={comment.user?.profileImg || defaultAvatar}
                    alt={comment.user?.username}
                    onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar }}
                  />
                  <div className="comment-item-body">
                    <div className="comment-item-header">
                      <h3 className="comment-item-user">{comment.user?.username}</h3>
                      <p className="comment-item-date">{formatDate(comment.createdAt)}</p>
                    </div>
                    <div className="comment-item-rating">
                      <div className="comment-item-stars">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill={i < (comment.stars / 2) ? "currentColor" : "none"}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={i < (comment.stars / 2) ? "0" : "1.5"} 
                              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" 
                            />
                          </svg>
                        ))}
                      </div>
                      <span className="comment-item-rating-value">({comment.stars}/10)</span>
                    </div>
                    <p className="comment-item-text">{comment.comment}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="comment-empty">
            <p className="comment-empty-text">No reviews yet. Be the first to review!</p>
            {!user && (
              <button
                onClick={() => navigate('/login')}
                className="comment-login-button"
              >
                Login to Review
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CommentSection 