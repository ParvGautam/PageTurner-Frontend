import React from 'react';
import defaultCover from '../assets/default-cover.png';
import './Novel3DBook.css';

const Novel3DBook = ({ 
  coverImage, 
  title, 
  author = "Unknown", 
  onClick,
  className = ''
}) => {
  return (
    <div className={`novel-3d-container ${className}`} onClick={onClick}>
      <div className="novel-3d-book">
        <div className="novel-3d-front">
          <div className="novel-3d-cover">
            {/* Cover Image */}
            <img 
              src={coverImage || defaultCover} 
              alt={title} 
              className="novel-3d-cover-image"
              onError={(e) => { e.target.onerror = null; e.target.src = defaultCover }}
            />
          </div>
        </div>
        <div className="novel-3d-left-side">
          <h2>
            <span>{title}</span>
          </h2>
        </div>
      </div>
    </div>
  );
};

export default Novel3DBook; 