import { useState, useEffect, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { novelAPI } from '../services/api';
import ThreeJSBook from '../components/ThreeJSBook';
import defaultCover from '../assets/default-cover.png';

function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get('q') || '';
  
  // Fetch novels based on search query
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      return await novelAPI.searchNovels(query.trim());
    },
    enabled: !!query.trim() // Only run query if there's a search term
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Results Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-white">
            {query ? (
              <>
                Search Results for <span className="text-amber-500">"{query}"</span>
              </>
            ) : (
              'Search for Books'
            )}
          </h1>
          {searchResults && (
            <p className="text-gray-400 mt-2">
              Found {searchResults.length} {searchResults.length === 1 ? 'book' : 'books'}
            </p>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-center">
            <p className="text-red-300">There was an error searching for books. Please try again.</p>
          </div>
        ) : searchResults && searchResults.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {searchResults.map((novel) => (
              <div key={novel._id} className="flex flex-col items-center">
                <Suspense fallback={<div className="animate-pulse bg-gray-700 h-80 w-48 rounded-lg"></div>}>
                  <ThreeJSBook 
                    coverImage={novel.thumbnail || defaultCover}
                    title={novel.title}
                    onClick={() => navigate(`/novels/${novel._id}`)}
                    height={280}
                  />
                  <div className="text-center mt-3 w-full">
                    <h3 className="text-sm font-semibold text-white line-clamp-1 mb-1">{novel.title}</h3>
                    <p className="text-xs text-white/70">
                      by {typeof novel.author === 'string' ? novel.author : novel.author?.username || 'Unknown'}
                    </p>
                  </div>
                </Suspense>
              </div>
            ))}
          </div>
        ) : query ? (
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 text-center border border-gray-700">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-white mb-2">No Books Found</h3>
              <p className="text-gray-400">
                We couldn't find any books matching "{query}". Try a different search term.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 text-center border border-gray-700">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-white mb-2">Search for Books</h3>
              <p className="text-gray-400">
                Use the search bar in the navigation to find books by title, author, or genre.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResults; 