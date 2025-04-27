import React from 'react';
import './AnimatedBook.css';

const AnimatedBook = ({ coverImage, title, description, author, onClick }) => {
  return (
    <figure className="animated-book" onClick={onClick}>
      {/* Front Cover */}
      <ul className="hardcover_front">
        <li>
          <div className="coverDesign">
            <img src={coverImage} alt={title} />
          </div>
        </li>
        <li></li>
      </ul>

      {/* Pages */}
      <ul className="page">
        <li></li>
        <li>
          <div className="page-content">
            <h3>{title}</h3>
            <p>{description}</p>
            {author && <p><strong>By:</strong> {author}</p>}
          </div>
        </li>
        <li></li>
        <li></li>
        <li></li>
      </ul>

      {/* Back Cover */}
      <ul className="hardcover_back">
        <li></li>
        <li></li>
      </ul>
      <ul className="book_spine">
        <li></li>
        <li></li>
      </ul>
    </figure>
  );
};

export default AnimatedBook; 