import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import Novel3DBook from './Novel3DBook';
import defaultCover from '../assets/default-cover.png';

const Premium3DBookCard = ({ 
  novel, 
  className = '',
  showActions = false,
  onRemove,
  dateAdded,
  customClick,
  isDisabled = false
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (customClick) {
      customClick(novel._id);
    } else {
      navigate(`/novels/${novel._id}`);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (onRemove && !isDisabled) {
      onRemove(e, novel._id);
    }
  };

  const handleReadNow = (e) => {
    e.stopPropagation();
    if (novel.chapters && novel.chapters.length > 0) {
      navigate(`/chapters/${novel.chapters[0]._id}`);
    } else {
      navigate(`/novels/${novel._id}`);
    }
  };

  // Function to get appropriate color based on genre
  const getGenreColor = () => {
    const genre = novel.genre || (novel.genres && novel.genres[0]) || "";
    const colors = {
      'Fantasy': '#5199fc',
      'Romance': '#ff69b4',
      'Mystery': '#da70d6',
      'Sci-Fi': '#6eb5ff',
      'Non-Fiction': '#ffd700',
      'Horror': '#ff5068',
      'Adventure': '#6adb91',
      'Thriller': '#ff9868'
    };
    
    return colors[genre] || '#5199fc';
  };

  const genreColor = getGenreColor();
  
  // Get author name from novel object
  const authorName = typeof novel.author === 'string' 
    ? novel.author 
    : novel.author?.username || 'Unknown';

  return (
    <div
      className={`flex flex-col items-center transition-all duration-300 ${className}`}
    >
      {/* Premium 3D Book Cover */}
      <div className="w-full mb-3 max-w-[200px]">
        <Novel3DBook
          coverImage={novel.thumbnail || defaultCover}
          title={novel.title}
          onClick={handleClick}
        />
      </div>

      {/* Book Info - Subtle with white text */}
      <div className="text-center w-full max-w-[200px]">
        {/* Title with white text */}
        <h3 className="text-base font-semibold text-center text-white line-clamp-1 mb-1">
          {novel.title}
        </h3>

        {/* Author - White text */}
        <p className="text-xs text-center text-white/70 mb-2">
          by {authorName}
        </p>

        {/* Simple white divider */}
        <div className="h-px w-10 mx-auto mb-2 bg-white/20"></div>

        {/* Rating and Genres Row */}
        <div className="flex items-center justify-center gap-3 w-full mb-1">
          {/* Rating - White with gold star */}
          <div className="flex items-center">
            <FaStar className="w-3 h-3 text-amber-400 mr-1" />
            <span className="text-xs font-medium text-white">
              {novel.rating?.toFixed(1) || novel.averageRating?.toFixed(1) || '0.0'}
            </span>
          </div>
          
          {/* Genre Tag - The only colored element */}
          {(novel.genre || (novel.genres && novel.genres.length > 0)) && (
            <span className="text-xs font-medium tracking-wide"
                  style={{color: genreColor}}>
              {novel.genre || (novel.genres && novel.genres[0])}
            </span>
          )}
        </div>
        
        {/* Date added (if provided) */}
        {dateAdded && (
          <div className="text-[10px] text-white/50 mt-1 w-full text-center">
            Added {new Date(dateAdded).toLocaleDateString()}
          </div>
        )}

        {/* Action Buttons - White with subtle underline */}
        {showActions && (
          <div className="flex items-center justify-center gap-4 w-full mt-3">
            <button
              onClick={handleReadNow}
              className="text-xs font-medium text-white hover:text-white px-0 py-0 border-b border-white/30 hover:border-white/60 transition-all"
            >
              Read Now
            </button>
            
            {onRemove && (
              <button
                onClick={handleRemove}
                disabled={isDisabled}
                className={`text-xs font-medium text-white hover:text-white px-0 py-0 border-b border-white/30 hover:border-white/60 transition-all ${
                  isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Premium3DBookCard; 