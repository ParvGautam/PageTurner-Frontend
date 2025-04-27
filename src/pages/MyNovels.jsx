import { useEffect, Suspense } from 'react'
import { useAuth } from '../context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import defaultCover from '../assets/default-cover.png'
import ThreeJSBook from '../components/ThreeJSBook'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import '../styles/3dBook.css' // Import the 3D book CSS
import '../styles/home.css' // Import home page custom styles

const MyNovels = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Handle redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch user's novels
  const { data: myNovels, isLoading, isError } = useQuery({
    queryKey: ['my-novels'],
    queryFn: async () => {
      try {
        const response = await api.get('/novels/user')
        return response.data
      } catch (error) {
        console.error('Error fetching your novels:', error)
        return []
      }
    },
    enabled: !!user // Only run query if user is logged in
  })

  const handleNovelClick = (novelId) => {
    navigate(`/novels/${novelId}`)
  }

  // Function to get appropriate color based on genre
  const getGenreColor = (genre) => {
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

  // If user is not logged in, don't render the full page
  if (!user) {
    return <div className="min-h-screen w-full bg-black"></div>;
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-black text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-36">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-bold text-white relative">
            My Books
            <span className="absolute -bottom-2 left-0 w-16 h-1 bg-[#5199fc] rounded-full"></span>
          </h1>
          <motion.button
            onClick={() => navigate('/add-novel')}
            className="flex items-center bg-[#5199fc] text-white px-4 py-2 rounded-lg hover:bg-[#4180d6] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create New Book
          </motion.button>
        </div>

        {/* My Novels Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5199fc]"></div>
          </div>
        ) : isError ? (
          <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-8 text-center border border-gray-800">
            <p className="text-[#ff5068] mb-4">Error loading your books. Please try again later.</p>
            <motion.button
              onClick={() => navigate('/')}
              className="bg-[#5199fc] text-white px-4 py-2 rounded-lg hover:bg-[#4180d6] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Return Home
            </motion.button>
          </div>
        ) : myNovels?.length === 0 ? (
          <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-8 text-center border border-gray-800">
            <div className="mb-4 text-5xl">📚</div>
            <h2 className="text-xl font-bold mb-2 text-white">You haven't created any books yet</h2>
            <p className="text-[#ff9868] mb-6">Start creating your own books and sharing your stories with the world!</p>
            <motion.button
              onClick={() => navigate('/add-novel')}
              className="bg-[#5199fc] text-white px-6 py-3 rounded-lg hover:bg-[#4180d6] transition-colors inline-flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Your First Book
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {myNovels.map((novel) => (
              <motion.div 
                key={novel._id} 
                className="cursor-pointer flex flex-col items-center book-card-dark"
                onClick={() => handleNovelClick(novel._id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Book Cover with 3D effect */}
                <div className="w-full mb-3 max-w-[200px]">
                  <Suspense fallback={<div className="animate-pulse bg-gray-700 h-80 w-48 rounded-lg"></div>}>
                    <ThreeJSBook 
                      coverImage={novel.thumbnail || defaultCover}
                      title={novel.title}
                      onClick={() => handleNovelClick(novel._id)}
                      height={280}
                    />
                  </Suspense>
                </div>
                
                {/* Book Info */}
                <div className="text-center w-full max-w-[200px]">
                  {/* Title */}
                  <h3 className="text-base font-semibold text-center text-white line-clamp-1 mb-1">
                    {novel.title}
                  </h3>
                  
                  {/* Author */}
                  <p className="text-xs text-center text-white/70 mb-2">
                    by {user?.username || 'Unknown'}
                  </p>
                  
                  {/* Simple white divider */}
                  <div className="h-px w-10 mx-auto mb-2 bg-white/20"></div>
                  
                  {/* Novel stats and actions */}
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-medium text-white">
                      {novel.chapters?.length || 0} chapters
                    </span>
                    
                    {/* Genre Tag */}
                    {novel.genre && (
                      <span className="text-xs font-medium tracking-wide"
                            style={{color: getGenreColor(novel.genre)}}>
                        {novel.genre}
                      </span>
                    )}
                  </div>
                  
                  {/* Action button */}
                  <div className="flex items-center justify-center mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/novels/${novel._id}/add-chapter`);
                      }}
                      className="text-xs font-medium text-white hover:text-white px-3 py-1 rounded-full border border-[#5199fc]/40 hover:bg-[#5199fc]/20 transition-all"
                    >
                      Add Chapter
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default MyNovels 