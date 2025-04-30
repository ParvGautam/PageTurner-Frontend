import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api, { authAPI } from '../services/api'
import defaultAvatar from '../assets/default-avatar.jpg'
import HighlightInfo from '../components/HighlightInfo'
import FollowingList from '../components/FollowingList'
import FollowersList from '../components/FollowersList'
import BookmarksList from '../components/BookmarksList'

const Profile = () => {
  const { user, login } = useAuth()
  const _navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    email: user?.email || ''
  })

  // State for active tab
  const [activeTab, setActiveTab] = useState('following')

  // Debug: Log user with more details
  console.log('Profile user state:', {
    user: user,
    isUserDefined: !!user,
    userId: user?._id,
    userDetailsPresent: user ? {
      hasFullName: !!user.fullName,
      hasUsername: !!user.username,
      hasEmail: !!user.email,
      hasProfileImg: !!user.profileImg,
      hasFollowers: Array.isArray(user.followers),
      hasFollowing: Array.isArray(user.following)
    } : 'No user data'
  })

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        username: user.username || '',
        email: user.email || ''
      })
    }
  }, [user])

  // If user is not logged in, redirect to login
  useEffect(() => {
    if (!user) {
      console.log('No user found, redirecting to login')
      _navigate('/login')
    }
  }, [user, _navigate])

  // Query to fetch user followers and following
  const { data: userStats, isLoading: _isLoading, isError: isStatsError, error: statsError, refetch: refetchUserStats } = useQuery({
    queryKey: ['userStats', user?._id],
    queryFn: async () => {
      if (!user?._id) {
        console.log('Cannot fetch userStats: No user ID available')
        return { followers: [], following: [] }
      }
      
      console.log('Fetching user stats for ID:', user._id)
      try {
        const response = await api.get(`/user/profile/${user._id}`)
        console.log('User stats API response:', response.data)
        
        // Check if response data has the expected structure
        if (!response.data || !response.data.followers || !response.data.following) {
          console.error('User stats response missing expected data:', response.data)
          return { 
            followers: response.data?.followers || [], 
            following: response.data?.following || [] 
          }
        }
        
        return {
          followers: response.data.followers || [],
          following: response.data.following || []
        }
      } catch (error) {
        console.error('Error fetching user stats:', error.response?.data || error.message)
        throw error
      }
    },
    enabled: !!user?._id,
    retry: 2,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

  // Debug: Log userStats with more details
  console.log('Profile userStats state:', {
    userStats: userStats,
    isStatsLoading: _isLoading,
    isStatsError: isStatsError,
    statsError: statsError?.message || 'No error',
    followersCount: userStats?.followers?.length || 0,
    followingCount: userStats?.following?.length || 0
  })

  // Mutation to update profile with better error handling
  const { mutate: updateProfile, isPending: _isUpdating, error: updateError } = useMutation({
    mutationFn: (data) => authAPI.updateProfile(data),
    onSuccess: (data) => {
      console.log('Profile updated successfully:', data)
      login(data) // Update user in context with new data
      setIsEditing(false)
      setProfileImage(null)
      setPreviewUrl(null)
      refetchUserStats() // Refresh user stats after profile update
    },
    onError: (error) => {
      console.error('Profile update error:', error.response?.data || error.message)
      alert('Failed to update profile: ' + (error.response?.data?.error || error.message || 'Unknown error'))
    }
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Compress and resize image
  const compressImage = (file, maxWidth = 400, maxHeight = 400) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target.result
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          
          // Calculate new dimensions maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width)
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height)
              height = maxHeight
            }
          }
          
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          
          // Get compressed image as base64 string, reduce quality to 0.6 (60% of original)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6)
          resolve(compressedDataUrl)
        }
        img.onerror = error => reject(error)
      }
      reader.onerror = error => reject(error)
    })
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.match('image.*')) {
      alert('Please select an image file')
      return
    }
    
    // Validate file size (max 2MB before compression)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      alert('Image is too large. Please select an image under 2MB')
      return
    }
    
    try {
      setProfileImage(file)
      
      // Compress image before preview
      const compressedDataUrl = await compressImage(file)
      setPreviewUrl(compressedDataUrl)
    } catch (error) {
      console.error('Error processing image:', error)
      alert('Error processing image. Please try again with a different image.')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!profileImage || !previewUrl) {
      alert('Please select a profile image to upload')
      return
    }
    
    updateProfile({ profileImg: previewUrl })
  }

  const toggleEdit = () => {
    if (isEditing) {
      // Reset form data if canceling edit
      setFormData({
        fullName: user?.fullName || '',
        username: user?.username || '',
        email: user?.email || ''
      })
      setProfileImage(null)
      setPreviewUrl(null)
    }
    setIsEditing(!isEditing)
  }

  // Tabs to display in the profile
  const tabs = [
    { id: 'following', label: 'Following' },
    { id: 'followers', label: 'Followers' },
    { id: 'bookmarks', label: 'Bookmarks' },
    { id: 'highlights', label: 'Highlights' },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* If no user, show a loading spinner or message */}
      {!user && (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5199fc] mx-auto mb-4"></div>
            <p>Loading user data...</p>
          </div>
        </div>
      )}

      {user && (
        <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6">
          {/* User Profile Section */}
          <div className="bg-gray-900 shadow overflow-hidden rounded-lg mb-8 border border-gray-800">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <img
                  src={user?.profileImg || defaultAvatar}
                  alt="Profile"
                  className="h-20 w-20 rounded-full object-cover border-2 border-[#5199fc]"
                  onError={(e) => {
                    console.log('Profile image failed to load, falling back to default')
                    e.target.src = defaultAvatar
                  }}
                />
                <div>
                  <h3 className="text-lg font-medium text-white">{user?.fullName || user?.username}</h3>
                  <p className="text-sm text-[#5199fc]">@{user?.username}</p>
                  <div className="flex space-x-4 mt-2">
                    <div className="text-sm">
                      <span className="font-medium">{userStats?.followers?.length || 0}</span>
                      <span className="text-[#ff9868] ml-1">Followers</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{userStats?.following?.length || 0}</span>
                      <span className="text-[#ff9868] ml-1">Following</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={toggleEdit}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#5199fc] hover:bg-[#4180d6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5199fc]"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {/* Show loading and error states for userStats */}
            {_isLoading && (
              <div className="text-center text-gray-400 py-4">Loading profile data...</div>
            )}
            {isStatsError && (
              <div className="text-center text-red-400 py-4">
                Error loading profile data: {statsError?.message || 'Unknown error'}
                <button 
                  onClick={() => refetchUserStats()}
                  className="ml-2 text-[#5199fc] hover:underline"
                >
                  Try Again
                </button>
              </div>
            )}
            {updateError && (
              <div className="text-center text-red-400 py-4">
                Error updating profile: {updateError?.response?.data?.error || updateError?.message || 'Unknown error'}
              </div>
            )}

            {isEditing && (
              <div className="border-t border-gray-800 px-4 py-5 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative">
                      <img
                        src={previewUrl || user?.profileImg || defaultAvatar}
                        alt="Profile"
                        className="h-32 w-32 rounded-full object-cover"
                      />
                      <label
                        htmlFor="profile-image"
                        className="absolute bottom-0 right-0 bg-amber-600 text-white p-1 rounded-full cursor-pointer hover:bg-amber-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </label>
                      <input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">Username cannot be changed</p>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-800 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 border-b-2 font-medium text-sm focus:outline-none ${
                  activeTab === tab.id
                    ? 'border-[#5199fc] text-[#5199fc]'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'following' && (
            <div className="bg-gray-900 shadow overflow-hidden rounded-lg border border-gray-800">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-white">Following</h3>
              </div>
              <div className="border-t border-gray-800">
                <div className="px-4 py-5 sm:p-6">
                  <FollowingList />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'followers' && (
            <div className="bg-gray-900 shadow overflow-hidden rounded-lg border border-gray-800">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-white">Followers</h3>
              </div>
              <div className="border-t border-gray-800">
                <div className="px-4 py-5 sm:p-6">
                  <FollowersList />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div className="bg-gray-900 shadow overflow-hidden rounded-lg border border-gray-800">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-white">Bookmarks</h3>
              </div>
              <div className="border-t border-gray-800">
                <div className="px-4 py-5 sm:p-6">
                  <BookmarksList />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'highlights' && (
            <div className="bg-gray-900 shadow overflow-hidden rounded-lg border border-gray-800">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-white">Highlights</h3>
              </div>
              <div className="border-t border-gray-800">
                <div className="px-4 py-5 sm:p-6">
                  <HighlightInfo />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Profile 