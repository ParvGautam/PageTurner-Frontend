import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import defaultAvatar from '../assets/default-avatar.png'

const FollowingList = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Query to fetch user's following list
  const { data: following, isLoading, isError } = useQuery({
    queryKey: ['userFollowing', user?._id],
    queryFn: async () => {
      if (!user?._id) return []
      
      try {
        const response = await api.get(`/user/profile/${user._id}`)
        return response.data.following || []
      } catch (error) {
        console.error('Error fetching following users:', error)
        return []
      }
    },
    enabled: !!user?._id
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
        <p className="mt-1">Please try again later</p>
      </div>
    )
  }

  if (!following?.length) {
    return (
      <div className="text-center py-10 bg-gray-900">
        <h3 className="text-lg font-medium text-white">You're not following anyone yet</h3>
        <p className="mt-1 text-[#ff9868]">Follow authors to see their content in your feed</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#5199fc] hover:bg-[#4180d6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5199fc]"
        >
          Discover Authors
        </button>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {following.map(followedUser => (
          <div 
            key={followedUser._id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex items-center space-x-4 hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-700"
            onClick={() => navigate(`/author/${followedUser._id}`)}
          >
            <img 
              src={followedUser.profileImg || defaultAvatar} 
              alt={followedUser.username} 
              className="h-16 w-16 rounded-full object-cover border border-[#5199fc]"
            />
            <div>
              <h3 className="font-medium text-white">{followedUser.fullName || followedUser.username}</h3>
              <p className="text-sm text-[#5199fc]">@{followedUser.username}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FollowingList 