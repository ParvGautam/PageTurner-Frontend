import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import defaultAvatar from '../assets/default-avatar.jpg'
import { getValidImageUrl, createImageErrorHandler } from '../utils/imageUtils'

const FollowersList = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Query to fetch user's followers list
  const { data: followers, isLoading, isError, error } = useQuery({
    queryKey: ['userFollowers', user?._id],
    queryFn: async () => {
      if (!user?._id) {
        console.log('Cannot fetch followers: No user ID available')
        return []
      }
      
      console.log('Fetching followers list for user ID:', user._id)
      try {
        const response = await api.get(`/user/profile/${user._id}`)
        console.log('Followers list API response:', response.data)
        
        // Check if the response has the followers property and it's an array
        if (!response.data || !Array.isArray(response.data.followers)) {
          console.error('Followers list response has unexpected format:', response.data)
          // Return empty array if followers property is missing or not an array
          return []
        }
        
        return response.data.followers || []
      } catch (error) {
        console.error('Error fetching followers list:', error.response?.data || error.message)
        throw error
      }
    },
    enabled: !!user?._id,
    retry: 2,
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

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
        <h3 className="text-lg font-medium">Error loading your followers list</h3>
        <p className="mt-1">{error?.message || 'Please try again later'}</p>
      </div>
    )
  }

  if (!followers || followers.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10">
        <h3 className="text-lg font-medium">You don't have any followers yet</h3>
        <p className="mt-1">Keep writing great content to attract followers!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {followers.map((follower) => (
        <div 
          key={follower._id} 
          className="flex items-center p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
          onClick={() => navigate(`/author/${follower._id}`)}
        >
          <img
            src={getValidImageUrl(follower.profileImg, defaultAvatar)}
            alt={follower.username}
            className="h-12 w-12 rounded-full object-cover mr-4"
            onError={createImageErrorHandler(defaultAvatar, 'Follower profile')}
          />
          <div>
            <h4 className="font-medium text-white">{follower.username}</h4>
          </div>
        </div>
      ))}
    </div>
  )
}

export default FollowersList 