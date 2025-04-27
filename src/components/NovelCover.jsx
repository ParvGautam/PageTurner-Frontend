import React from 'react';
import defaultCover from '../assets/default-cover.png';

const NovelCover = ({ coverImage, title, className = '' }) => {
  return (
    <div className={`relative aspect-[2/3] ${className}`}>
      <div className="book">
        <div className="cover">
          <img
            src={coverImage || defaultCover}
            alt={title || 'Book Cover'}
            onError={(e) => { e.target.onerror = null; e.target.src = defaultCover }}
          />
        </div>
      </div>
    </div>
  );
};

export default NovelCover; 