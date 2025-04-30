import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import defaultCover from '../assets/default-cover.png'
import { getValidImageUrl, createImageErrorHandler } from '../utils/imageUtils'

// Debug function to inspect image URLs
const logImagePath = (path, fallback) => {
  console.log(`Image path check: original=${path || 'undefined'}, fallback=${fallback}`)
  return getValidImageUrl(path, fallback)
}

// Format date function
const formatDate = (dateString) => {
  if (!dateString) return 'Recent';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) return 'Today';
  if (diffDays <= 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined 
  });
};

const BookmarksList = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Query to fetch user's bookmarks
  const { data: bookmarks, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['userBookmarks', user?._id],
    queryFn: async () => {
      if (!user?._id) {
        console.log('Cannot fetch bookmarks: No user ID available')
        return []
      }
      
      console.log('Fetching bookmarks for user ID:', user._id)
      try {
        // First try the library endpoint
        const response = await api.get('/library/user')
        console.log('Library API response:', response.data)
        
        // Process library data
        let processedData = [];
        
        // Check the type of response.data to avoid filter/map errors
        if (response.data) {
          // If it's already an array
          if (Array.isArray(response.data)) {
            console.log('Library data is an array of books with length:', response.data.length);
            processedData = response.data;
          } 
          // If it has a library property that is an array
          else if (response.data.library && Array.isArray(response.data.library)) {
            console.log('Found books array in response.data.library with length:', response.data.library.length);
            // Map to a flat array format
            processedData = response.data.library.map(book => {
              // Handle both direct book objects and nested novel objects
              if (book.novel) {
                return {
                  _id: book._id,
                  title: book.novel.title,
                  description: book.novel.description,
                  coverImage: book.novel.coverImage || book.novel.thumbnail,
                  author: book.novel.author,
                  addedAt: book.createdAt || book.addedAt || new Date(),
                  type: 'book'
                };
              } else {
                return {
                  ...book,
                  addedAt: book.createdAt || book.addedAt || new Date(),
                  type: 'book'
                };
              }
            });
          }
          // If it's an object with expected book fields
          else if (typeof response.data === 'object' && (response.data._id || response.data.title)) {
            console.log('Response contains a single book object, converting to array');
            processedData = [{
              ...response.data,
              addedAt: response.data.createdAt || response.data.addedAt || new Date(),
              type: 'book'
            }];
          }
          // Otherwise try to handle unknown object structure
          else if (typeof response.data === 'object') {
            // Look for any array properties that might contain books
            const possibleArrayProps = Object.keys(response.data).filter(key => 
              Array.isArray(response.data[key])
            );
            
            if (possibleArrayProps.length > 0) {
              const firstArrayProp = possibleArrayProps[0];
              console.log(`Found array in response.data.${firstArrayProp}, using this as books data`);
              processedData = response.data[firstArrayProp].map(item => ({
                ...item,
                addedAt: item.createdAt || item.addedAt || new Date(),
                type: 'book'
              }));
            } else {
              console.log('No arrays found in response data, returning empty array');
            }
          }
        }
        
        // If processedData is not empty, return it
        if (processedData.length > 0) {
          return processedData;
        }
        
        // If that doesn't work, try the bookmarks endpoint
        console.log('Library endpoint failed or had no data, trying bookmarks endpoint')
        const bookmarksResponse = await api.get('/bookmarks/user')
        console.log('Bookmarks API response:', bookmarksResponse.data)
        
        // Process bookmarks data
        if (bookmarksResponse.data) {
          if (Array.isArray(bookmarksResponse.data)) {
            return bookmarksResponse.data.map(item => ({
              ...item,
              addedAt: item.createdAt || item.addedAt || new Date(),
              type: 'chapter'
            }));
          } else if (bookmarksResponse.data.bookmarks && Array.isArray(bookmarksResponse.data.bookmarks)) {
            return bookmarksResponse.data.bookmarks.map(item => ({
              ...item,
              addedAt: item.createdAt || item.addedAt || new Date(),
              type: 'chapter'
            }));
          } else if (typeof bookmarksResponse.data === 'object' && bookmarksResponse.data._id) {
            // Single bookmark case
            return [{
              ...bookmarksResponse.data,
              addedAt: bookmarksResponse.data.createdAt || bookmarksResponse.data.addedAt || new Date(),
              type: 'chapter'
            }];
          }
        }
        
        console.log('Both endpoints returned no usable data');
        return [];
      } catch (error) {
        console.error('Error fetching bookmarks:', error.response?.data || error.message)
        
        // If the first request fails, try the alternate endpoint
        try {
          if (error.response && error.response.status === 404) {
            console.log('Library endpoint not found, trying bookmarks endpoint')
            const bookmarksResponse = await api.get('/bookmarks/user')
            console.log('Bookmarks API response:', bookmarksResponse.data)
            
            if (bookmarksResponse.data) {
              if (Array.isArray(bookmarksResponse.data)) {
                return bookmarksResponse.data.map(item => ({
                  ...item,
                  addedAt: item.createdAt || item.addedAt || new Date(),
                  type: 'chapter'
                }));
              } else if (bookmarksResponse.data.bookmarks && Array.isArray(bookmarksResponse.data.bookmarks)) {
                return bookmarksResponse.data.bookmarks.map(item => ({
                  ...item,
                  addedAt: item.createdAt || item.addedAt || new Date(),
                  type: 'chapter'
                }));
              } else if (typeof bookmarksResponse.data === 'object' && bookmarksResponse.data._id) {
                return [{
                  ...bookmarksResponse.data,
                  addedAt: bookmarksResponse.data.createdAt || bookmarksResponse.data.addedAt || new Date(),
                  type: 'chapter'
                }];
              }
            }
          }
        } catch (secondError) {
          console.error('Error fetching from alternate endpoint:', secondError)
        }
        
        throw error
      }
    },
    enabled: !!user?._id,
    retry: 2,
    staleTime: 1000 * 60 * 5 // 5 minutes
  })

  // Loading state with premium spinner
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[300px]">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-t-[#5199fc] border-r-[#5199fc]/30 border-b-[#5199fc]/10 border-l-[#5199fc]/60 animate-spin"></div>
          <div className="absolute top-2 left-2 right-2 bottom-2 rounded-full border-4 border-t-[#7b56ff] border-r-[#7b56ff]/30 border-b-[#7b56ff]/10 border-l-[#7b56ff]/60 animate-spin-slow"></div>
        </div>
        <p className="mt-4 text-white/80 text-sm font-medium">Loading your collection...</p>
      </div>
    )
  }

  // Error state with premium styling
  if (isError) {
    return (
      <div className="relative overflow-hidden rounded-xl backdrop-blur-md bg-gray-800/40 border border-gray-700/50 shadow-lg py-10 px-6">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500/40 via-red-500 to-red-500/40"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-red-500/10 blur-2xl"></div>
        
        <div className="text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Unable to Load Bookmarks</h3>
          <p className="text-gray-300 mb-6">{error?.message || 'We encountered an issue while loading your bookmarks'}</p>
          <button 
            onClick={() => refetch()}
            className="px-5 py-2.5 bg-gradient-to-r from-[#5199fc] to-[#7b56ff] text-white rounded-lg font-medium hover:from-[#61a9fc] hover:to-[#8b66ff] transition-all duration-300 shadow-lg hover:shadow-[#5199fc]/20"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Empty state with premium styling
  if (!bookmarks || !Array.isArray(bookmarks) || bookmarks.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-xl backdrop-blur-md bg-gray-800/40 border border-gray-700/50 shadow-lg py-16 px-6">
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#5199fc]/10 blur-2xl"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-[#7b56ff]/10 blur-2xl"></div>
        
        <div className="text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#5199fc]/10 to-[#7b56ff]/10 border border-white/5 mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#5199fc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-white mb-3">Your Collection is Empty</h3>
          <p className="text-gray-300 mb-8 max-w-md mx-auto">Discover novels and add them to your library to keep track of your favorite stories.</p>
        </div>
      </div>
    )
  }

  // Check if we're dealing with library novels or bookmarked chapters
  const isLibraryData = bookmarks.length > 0 && bookmarks[0] && 
    (('title' in bookmarks[0]) || (bookmarks[0].novel && 'title' in bookmarks[0].novel));
  
  const isBookmarkData = bookmarks.length > 0 && bookmarks[0] && 'novel' in bookmarks[0];

  // Sort bookmarks by date (most recent first)
  const sortedBookmarks = [...bookmarks].sort((a, b) => {
    const dateA = new Date(a.addedAt || a.createdAt || 0);
    const dateB = new Date(b.addedAt || b.createdAt || 0);
    return dateB - dateA;
  });

  return (
    <div className="relative overflow-hidden rounded-xl backdrop-blur-md bg-gray-800/40 border border-gray-700/50 shadow-lg py-6">
      {/* Background gradient elements */}
      <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#5199fc]/10 blur-2xl"></div>
      <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-[#7b56ff]/10 blur-2xl"></div>
      
      {/* Header */}
      <div className="relative z-10 px-6 pb-4 mb-2">
        <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">My Collection</h2>
      </div>
      
      {/* Content */}
      <div className="px-6 relative z-10">
        {isLibraryData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedBookmarks.map((novel) => {
              if (!novel || !novel._id) {
                return null; // Skip rendering invalid items
              }
              
              // Handle nested novel objects (if coming from library endpoint)
              const novelData = novel.novel ? novel.novel : novel;
              
              return (
                <div 
                  key={novelData._id} 
                  className="group relative overflow-hidden rounded-xl backdrop-blur-sm bg-gray-900/40 border border-gray-700/50 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/novels/${novelData._id}`)}
                >
                  {/* Premium card design with glass effect and gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#5199fc]/5 to-[#7b56ff]/5"></div>
                  <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#5199fc]/10 rounded-full blur-xl"></div>
                  <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-[#7b56ff]/10 rounded-full blur-xl"></div>
                  
                  {/* Book cover with gradient overlay */}
                  <div className="relative h-52 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300 z-10"></div>
                    <img
                      src={logImagePath(novelData.coverImage || novelData.thumbnail, defaultCover)}
                      alt={novelData.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                      onError={createImageErrorHandler(defaultCover, 'Novel cover')}
                    />
                    
                    {/* Premium bookmark ribbon */}
                    <div className="absolute top-0 right-5 w-8 h-16 bg-gradient-to-b from-[#5199fc] to-[#7b56ff] shadow-lg z-20">
                      <div className="absolute bottom-0 left-0 border-4 border-transparent border-b-gray-900/40 border-l-gray-900/40"></div>
                      <div className="absolute bottom-0 right-0 border-4 border-transparent border-b-gray-900/40 border-r-gray-900/40"></div>
                    </div>
                    
                    {/* Premium date badge */}
                    <div className="absolute bottom-3 left-3 z-20 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-xs text-white/90 font-medium border border-white/10">
                      {formatDate(novel.addedAt || novel.createdAt)}
                    </div>
                  </div>
                  
                  {/* Book info with premium typography */}
                  <div className="p-5 relative">
                    <h4 className="font-semibold text-white text-lg leading-tight group-hover:text-[#5199fc] transition-colors duration-300">{novelData.title}</h4>
                    <p className="text-[#7b56ff] mt-1.5 text-sm font-medium tracking-wide">by {novelData.author?.username || 'Unknown'}</p>
                    <div className="w-12 h-0.5 bg-gradient-to-r from-[#5199fc] to-[#7b56ff] mt-3 mb-3 rounded-full"></div>
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 group-hover:text-gray-300 transition-colors duration-300">
                      {novelData.description || 'No description available'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : isBookmarkData ? (
          <div className="space-y-4">
            {sortedBookmarks.map((bookmark) => {
              if (!bookmark || !bookmark._id) {
                return null; // Skip rendering invalid items
              }
              
              return (
                <div 
                  key={bookmark._id}
                  className="group relative overflow-hidden rounded-xl backdrop-blur-sm bg-gray-900/40 border border-gray-700/50 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    console.log('Bookmark clicked:', bookmark);
                    
                    // Enhanced navigation with better structure detection
                    if (bookmark.type === 'chapter') {
                      // For chapter bookmarks
                      if (bookmark.chapter && bookmark.chapter._id) {
                        console.log('Navigating to chapter:', `/chapters/${bookmark.chapter._id}`);
                        navigate(`/chapters/${bookmark.chapter._id}`);
                      }
                      else {
                        console.error('Chapter bookmark missing chapter ID:', bookmark);
                      }
                    } 
                    else if (bookmark.type === 'book') {
                      // For library books - try chapter first if available
                      if (bookmark.novel && bookmark.novel.chapters && bookmark.novel.chapters.length > 0) {
                        console.log('Navigating to novel first chapter:', bookmark.novel.chapters[0]._id);
                        navigate(`/chapters/${bookmark.novel.chapters[0]._id}`);
                      }
                      // If no chapters, go to novel page
                      else if (bookmark.novel && bookmark.novel._id) {
                        console.log('Navigating to novel page:', bookmark.novel._id);
                        navigate(`/novels/${bookmark.novel._id}`);
                      }
                      // For simple novel structure
                      else if (bookmark._id) {
                        console.log('Navigating to novel with direct ID:', bookmark._id);
                        navigate(`/novels/${bookmark._id}`);
                      }
                      else {
                        console.error('Book bookmark missing valid ID:', bookmark);
                      }
                    }
                    // Fallback for items without a type
                    else {
                      console.log('Item type unknown, trying to determine best navigation path');
                      
                      // Try chapter path first
                      if (bookmark.chapter && bookmark.chapter._id) {
                        console.log('Falling back to chapter path');
                        navigate(`/chapters/${bookmark.chapter._id}`);
                      }
                      // Try novel with chapters next
                      else if (bookmark.novel && bookmark.novel._id) {
                        console.log('Falling back to novel path');
                        navigate(`/novels/${bookmark.novel._id}`);
                      }
                      // Try direct ID as last resort
                      else if (bookmark._id) {
                        console.log('Falling back to direct ID as novel');
                        navigate(`/novels/${bookmark._id}`);
                      }
                      else {
                        console.error('No valid navigation path found for item:', bookmark);
                      }
                    }
                  }}
                >
                  {/* Premium glass effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#5199fc]/5 to-[#7b56ff]/5"></div>
                  <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#5199fc]/10 rounded-full blur-xl"></div>
                  <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-[#7b56ff]/10 rounded-full blur-xl"></div>
                  
                  <div className="p-4 flex items-center">
                    {/* Small book cover with premium frame */}
                    <div className="relative h-24 w-16 md:h-28 md:w-20 rounded-lg overflow-hidden flex-shrink-0 shadow-lg border border-gray-800/80">
                      <img 
                        src={logImagePath(bookmark.novel?.coverImage || bookmark.novel?.thumbnail, defaultCover)}
                        alt={bookmark.novel?.title || "Novel"} 
                        className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                        onError={createImageErrorHandler(defaultCover, 'Bookmark cover')}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      
                      {/* Premium bookmark ribbon */}
                      <div className="absolute top-0 right-2 w-4 h-8 bg-gradient-to-b from-[#5199fc] to-[#7b56ff] shadow-lg z-20">
                        <div className="absolute bottom-0 left-0 border-2 border-transparent border-b-gray-900/40 border-l-gray-900/40"></div>
                        <div className="absolute bottom-0 right-0 border-2 border-transparent border-b-gray-900/40 border-r-gray-900/40"></div>
                      </div>
                    </div>
                    
                    {/* Content section with premium styling */}
                    <div className="ml-4 flex-1">
                      {/* Novel title with premium typography */}
                      <div className="flex justify-between items-start">
                        <h3 className="text-base md:text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80 group-hover:from-[#5199fc] group-hover:to-[#7b56ff] transition-all duration-300">
                          {bookmark.novel?.title || "Unknown Novel"}
                        </h3>
                        
                        {/* Premium date badge */}
                        <div className="px-2 py-0.5 rounded-full bg-gray-800/60 backdrop-blur-sm text-xs text-white/70 border border-white/5 ml-2 flex-shrink-0">
                          {formatDate(bookmark.addedAt || bookmark.createdAt)}
                        </div>
                      </div>
                      
                      {/* Elegant divider line */}
                      <div className="w-12 h-0.5 bg-gradient-to-r from-[#5199fc]/60 to-[#7b56ff]/60 my-1.5"></div>
                      
                      {/* Chapter info with premium styling */}
                      {bookmark.chapter ? (
                        <>
                          <p className="text-sm font-medium text-[#7b56ff]">
                            Chapter {bookmark.chapter?.chapterNumber || '?'}: {bookmark.chapter?.title || 'Untitled'}
                          </p>
                          <p className="text-xs md:text-sm text-gray-400 mt-1 leading-relaxed line-clamp-2 group-hover:text-gray-300 transition-colors duration-300">
                            {bookmark.chapter?.description || "Continue reading from where you left off..."}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs md:text-sm text-gray-400 mt-1 leading-relaxed line-clamp-2 group-hover:text-gray-300 transition-colors duration-300">
                          {bookmark.novel?.description || "No description available"}
                        </p>
                      )}
                    </div>
                    
                    {/* Continue reading button with arrow */}
                    <div className="ml-3 flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm flex items-center justify-center border border-white/5 group-hover:border-[#5199fc]/30 group-hover:from-[#5199fc]/10 group-hover:to-[#7b56ff]/10 transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover:text-[#5199fc] transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-10">
            <p className="mt-1">The data format is unexpected. Please try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarksList 