import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { libraryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AddToLibrary = ({ novelId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Check if book is in user's library
  const { data, isLoading } = useQuery({
    queryKey: ['libraryCheck', novelId, user?._id],
    queryFn: () => libraryAPI.checkInLibrary(novelId),
    enabled: !!user && !!novelId,
    // Don't refetch on window focus to reduce API calls
    refetchOnWindowFocus: false
  });

  // Add to library mutation
  const { mutate: addToLibrary, isPending: isAdding } = useMutation({
    mutationFn: () => libraryAPI.addToLibrary(novelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['libraryCheck', novelId] });
      queryClient.invalidateQueries({ queryKey: ['userLibrary'] });
    }
  });

  // Remove from library mutation
  const { mutate: removeFromLibrary, isPending: isRemoving } = useMutation({
    mutationFn: () => libraryAPI.removeFromLibrary(novelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['libraryCheck', novelId] });
      queryClient.invalidateQueries({ queryKey: ['userLibrary'] });
    }
  });

  const handleLibraryAction = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (data?.inLibrary) {
      removeFromLibrary();
    } else {
      addToLibrary();
    }
  };

  const isInLibrary = data?.inLibrary;
  const isPending = isAdding || isRemoving;

  return (
    <button
      onClick={handleLibraryAction}
      disabled={isPending || isLoading}
      className={`
        px-4 py-2 rounded-lg flex items-center transition-colors
        ${isInLibrary 
          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
          : 'bg-amber-600 text-white hover:bg-amber-700'}
        disabled:opacity-50
      `}
    >
      {isPending ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          {isAdding ? 'Adding...' : 'Removing...'}
        </div>
      ) : (
        <>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={isInLibrary 
                ? "M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" 
                : "M12 4v16m8-8H4"
              } 
            />
          </svg>
          {isInLibrary ? 'In Library' : 'Add to Library'}
        </>
      )}
    </button>
  );
};

export default AddToLibrary;