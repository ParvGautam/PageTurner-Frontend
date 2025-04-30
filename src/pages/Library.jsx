import React, { Suspense, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { libraryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ThreeJSBook from '../components/ThreeJSBook';
import defaultCover from '../assets/default-cover.png';
import '../styles/library.css';
import '../styles/3dBook.css'; // Import the 3D book CSS

const Library = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [bookToRemove, setBookToRemove] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['userLibrary', user?._id],
    queryFn: libraryAPI.getUserLibrary,
    enabled: !!user?._id,
    onSuccess: (data) => {
      console.log('Library data:', data);
      
      if (data?.library?.length > 0) {
        console.log('First book:', data.library[0]);
        console.log('Novel object:', data.library[0].novel);
      }
    }
  });

  const { mutate: removeBook, isLoading: isRemoving } = useMutation({
    mutationFn: libraryAPI.removeFromLibrary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLibrary'] });
    },
  });

  const handleBookClick = (novelId) => {
    navigate(`/novels/${novelId}`);
  };

  const handleRemoveBook = (e, bookId) => {
    e.stopPropagation();
    
    // Find the book object first to get its novel ID
    const book = data?.library?.find(item => item._id === bookId);
    if (!book) {
      console.error('Book not found in library:', bookId);
      return;
    }

    // Check if we have a valid novel ID
    if (!book.novel || !book.novel._id) {
      console.error('No valid novel ID found for book:', book);
      return;
    }

    // Log what we're removing
    console.log('Preparing to remove book:', {
      bookId: bookId,
      novelId: book.novel._id,
      title: book.novel.title
    });

    // Show premium confirmation modal instead of basic alert
    setBookToRemove(book);
    setShowConfirmModal(true);
  };
  
  const confirmRemoval = () => {
    if (bookToRemove?.novel?._id) {
      removeBook(bookToRemove.novel._id);
    }
    setShowConfirmModal(false);
    setBookToRemove(null);
  };
  
  const cancelRemoval = () => {
    setShowConfirmModal(false);
    setBookToRemove(null);
  };

  // Format date properly
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6 text-[#5199fc]">My Library</h1>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5199fc]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-black text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6 text-[#5199fc]">My Library</h1>
          <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-8 text-center border border-[#ff5068]/30">
            <p className="text-[#ff5068]">Error: {error?.message || 'Failed to load your library'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6 text-[#5199fc]">My Library</h1>
        
        {data?.library && data.library.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {data.library.map((book) => (
              <div key={book._id} className="flex flex-col items-center">
                <Suspense fallback={<div className="animate-pulse bg-gray-700 h-80 w-48 rounded-lg"></div>}>
                  <ThreeJSBook 
                    coverImage={book.novel.thumbnail || defaultCover}
                    title={book.novel.title}
                    onClick={() => handleBookClick(book.novel._id)}
                    height={280}
                  />
                  <div className="text-center mt-3 w-full">
                    <h3 className="text-base font-semibold text-white line-clamp-1 mb-1">{book.novel.title}</h3>
                    
                    {(book.createdAt || book.addedAt) && (
                      <div className="text-[10px] text-white/50 mt-1">
                        Added {formatDate(book.createdAt || book.addedAt)}
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex items-center justify-center gap-4 w-full mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (book.novel.chapters && book.novel.chapters.length > 0) {
                            navigate(`/chapters/${book.novel.chapters[0]._id}`);
                          } else {
                            navigate(`/novels/${book.novel._id}`);
                          }
                        }}
                        className="text-xs font-medium text-white hover:text-white px-0 py-0 border-b border-white/30 hover:border-white/60 transition-all"
                      >
                        Read Now
                      </button>
                      
                      <button
                        onClick={(e) => handleRemoveBook(e, book._id)}
                        disabled={isRemoving}
                        className={`text-xs font-medium text-white hover:text-white px-0 py-0 border-b border-white/30 hover:border-white/60 transition-all ${
                          isRemoving ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </Suspense>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 text-center border border-[#ae8280]/30">
            <p className="text-lg mb-4">Your library is empty. Add some books to get started!</p>
            <button 
              className="bg-[#5199fc] hover:bg-[#afd7fb] text-white py-2 px-6 rounded-md transition duration-300 shadow-md hover:shadow-lg"
              onClick={() => navigate('/')}
            >
              Explore Books
            </button>
          </div>
        )}
        
        {/* Premium Removal Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Backdrop with blur effect */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={cancelRemoval}
            ></div>
            
            {/* Modal Content */}
            <div className="relative z-10 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-md border border-gray-700/50 p-6 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#5199fc]/10 blur-2xl"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-[#7b56ff]/10 blur-2xl"></div>
              
              <div className="relative z-10">
                {/* Book thumbnail */}
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-28 relative shadow-lg rounded overflow-hidden border border-gray-700/70">
                    <img 
                      src={bookToRemove?.novel?.thumbnail || defaultCover} 
                      alt={bookToRemove?.novel?.title || "Book cover"} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-center mb-1 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
                  Remove from Library
                </h3>
                
                <div className="w-16 h-0.5 bg-gradient-to-r from-[#5199fc]/60 to-[#7b56ff]/60 mx-auto my-3 rounded-full"></div>
                
                <p className="text-center text-gray-300 mb-6">
                  Are you sure you want to remove <span className="text-white font-medium">{bookToRemove?.novel?.title}</span> from your library?
                </p>
                
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={cancelRemoval}
                    className="px-4 py-2 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/50 rounded-lg text-white/90 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRemoval}
                    className="px-4 py-2 bg-gradient-to-r from-[#5199fc]/90 to-[#7b56ff]/90 hover:from-[#5199fc] hover:to-[#7b56ff] rounded-lg text-white font-medium transition-all duration-300 shadow-lg hover:shadow-[#5199fc]/20"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
 