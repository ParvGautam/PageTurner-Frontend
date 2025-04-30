import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import defaultAvatar from '../assets/default-avatar.jpg'
import { getValidImageUrl, createImageErrorHandler } from '../utils/imageUtils'

const FollowingList = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Query to fetch user's following list
  const { data: following, isLoading, isError, error } = useQuery({
    queryKey: ['userFollowing', user?._id],
    queryFn: async () => {
      if (!user?._id) {
        console.log('Cannot fetch following: No user ID available')
        return []
      }
      
      console.log('Fetching following list for user ID:', user._id)
      try {
        const response = await api.get(`/user/profile/${user._id}`)
        console.log('Following list API response:', response.data)
        
        // Check if the response has the following property and it's an array
        if (!response.data || !Array.isArray(response.data.following)) {
          console.error('Following list response has unexpected format:', response.data)
          // Return empty array if following property is missing or not an array
          return []
        }
        
        // Filter out the current user from the following list
        const followingList = response.data.following || []
        return followingList.filter(followedUser => followedUser._id !== user._id)
      } catch (error) {
        console.error('Error fetching following list:', error.response?.data || error.message)
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
        <h3 className="text-lg font-medium">Error loading your following list</h3>
        <p className="mt-1">{error?.message || 'Please try again later'}</p>
      </div>
    )
  }

  if (!following || following.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10">
        <h3 className="text-lg font-medium">You aren't following anyone yet</h3>
        <p className="mt-1">Find authors you like and follow them to see their updates</p>
        <button 
          onClick={() => navigate('/')} 
          className="mt-4 px-4 py-2 bg-[#5199fc] text-white rounded-md hover:bg-[#4180d6]"
        >
          Discover Authors
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {following.map((followedUser) => (
        <div 
          key={followedUser._id} 
          className="flex items-center p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
          onClick={() => navigate(`/author/${followedUser._id}`)}
        >
          <img
            src={getValidImageUrl(followedUser.profileImg, defaultAvatar)}
            alt={followedUser.username}
            className="h-12 w-12 rounded-full object-cover mr-4"
            onError={createImageErrorHandler(defaultAvatar, 'Following profile')}
          />
          <div>
            <h4 className="font-medium text-white">{followedUser.username}</h4>
          </div>
        </div>
      ))}
    </div>
  )
}

export default FollowingList 