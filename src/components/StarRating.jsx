import { useState } from 'react'

const StarRating = ({ rating, onRatingChange }) => {
  const [hover, setHover] = useState(0)
  const maxStars = 10 // The rating is out of 10 stars

  return (
    <div className="flex items-center">
      {[...Array(maxStars)].map((_, index) => {
        const ratingValue = index + 1
        
        return (
          <button
            type="button"
            key={index}
            className={`text-yellow-500 bg-transparent border-none outline-none cursor-pointer ${
              index < 5 ? 'mr-1' : index === 5 ? 'mr-2' : 'mr-1'
            }`}
            onClick={() => onRatingChange(ratingValue)}
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(0)}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill={(hover || rating) >= ratingValue ? "currentColor" : "none"}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={(hover || rating) >= ratingValue ? "0" : "1.5"} 
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" 
              />
            </svg>
          </button>
        )
      })}
      <span className="ml-2 text-sm text-gray-700">
        {rating === 0 ? '' : `${rating}/10`}
      </span>
    </div>
  )
}

export default StarRating 