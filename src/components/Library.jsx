import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { libraryAPI } from '../services/api';
import NovelCover from './NovelCover';
import { useAuth } from '../context/AuthContext';

const Library = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Query to fetch user's library
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['userLibrary', user?._id],
    queryFn: libraryAPI.getUserLibrary,
    enabled: !!user?._id
  });

  // Mutation to remove a book from library
  const { mutate: removeBook } = useMutation({
    mutationFn: libraryAPI.removeFromLibrary,
    onSuccess: () => {
      // Invalidate the library query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['userLibrary'] });
    }
  });

  // Handle click on a book
  const handleBookClick = (novelId) => {
    navigate(`/novels/${novelId}`);
  };

  // Handle removing a book from library
  const handleRemoveBook = (e, novelId) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    removeBook(novelId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-600 py-10">
        <h3 className="text-lg font-medium">Error loading your library</h3>
        <p className="mt-1">{error?.message || 'Please try again later'}</p>
      </div>
    );
  }

  if (!data?.library?.length) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-amber-800">Your library is empty</h3>
        <p className="mt-1 text-amber-600">Browse books and add them to your library</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
        >
          Discover Books
        </button>
      </div>
    );
  }

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold text-amber-900 mb-6">My Library</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {data.library.map((item) => (
          <div 
            key={item._id}
            onClick={() => handleBookClick(item.novel._id)}
            className="cursor-pointer group relative"
          >
            <NovelCover 
              novel={item.novel} 
              className="h-60 w-full rounded-md object-cover shadow-md" 
            />
            
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center rounded-md">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={(e) => handleRemoveBook(e, item.novel._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
            
            <h3 className="mt-2 text-sm font-medium text-amber-900 line-clamp-2">
              {item.novel.title}
            </h3>
            <p className="text-xs text-amber-700">
              Added: {new Date(item.addedAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library; 