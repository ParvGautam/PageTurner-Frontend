import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import defaultCover from '../assets/default-cover.png'

const BookmarksList = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Query to fetch user's bookmarks
  const { data: bookmarks, isLoading, isError } = useQuery({
    queryKey: ['userBookmarks', user?._id],
    queryFn: async () => {
      if (!user?._id) return []
      
      try {
        const response = await api.get('/bookmarks/user')
        return response.data.bookmarks || []
      } catch (error) {
        console.error('Error fetching bookmarks:', error)
        return []
      }
    },
    enabled: !!user?._id
  })

  // Mutation to remove a bookmark
  const { mutate: removeBookmark } = useMutation({
    mutationFn: async ({ novelId, chapterId }) => {
      return api.post('/bookmarks/remove', { novelId, chapterId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookmarks'] })
    },
    onError: (error) => {
      console.error('Error removing bookmark:', error)
    }
  })

  // Handle navigation to a chapter
  const handleChapterClick = (chapterId) => {
    navigate(`/chapters/${chapterId}`)
  }

  // Handle removing a bookmark
  const handleRemoveBookmark = (e, novelId, chapterId) => {
    e.stopPropagation() // Prevent triggering parent onClick
    removeBookmark({ novelId, chapterId })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5199fc]"></div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center text-[#ff5068] py-10">
        <h3 className="text-lg font-medium">Error loading your bookmarks</h3>
        <p className="mt-1">Please try again later</p>
      </div>
    )
  }

  if (!bookmarks?.length) {
    return (
      <div className="text-center py-10 bg-gray-900">
        <h3 className="text-lg font-medium text-white">You haven't bookmarked any chapters yet</h3>
        <p className="mt-1 text-[#ff9868]">Bookmark chapters while reading to save them for later</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#5199fc] hover:bg-[#4180d6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5199fc]"
        >
          Browse Books
        </button>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="space-y-6">
        {bookmarks.map(bookmark => (
          <div 
            key={bookmark._id}
            className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-700"
            onClick={() => handleChapterClick(bookmark.chapter._id)}
          >
            <div className="border-b border-gray-700 bg-gray-800/60 px-4 py-3 flex justify-between items-center">
              <div>
                <h3 className="font-medium text-white">
                  {bookmark.novel?.title || "Unknown Book"}
                </h3>
                <p className="text-sm text-[#5199fc]">
                  Chapter {bookmark.chapter?.chapterNumber || '?'}: {bookmark.chapter?.title || 'Untitled'}
                </p>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-gray-400 mr-3">
                  {new Date(bookmark.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={(e) => handleRemoveBookmark(e, bookmark.novel._id, bookmark.chapter._id)}
                  className="text-[#ff9868] hover:text-[#ff5068] transition-colors"
                  title="Remove bookmark"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4 flex">
              {bookmark.novel?.thumbnail ? (
                <img 
                  src={bookmark.novel.thumbnail} 
                  alt={bookmark.novel.title} 
                  className="h-16 w-12 object-cover rounded mr-4"
                />
              ) : (
                <div className="h-16 w-12 bg-gray-700 rounded mr-4 flex items-center justify-center text-gray-400 text-xs">
                  No Cover
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm text-gray-400 line-clamp-3">
                  {bookmark.chapter?.description || "Continue reading from where you left off..."}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BookmarksList 