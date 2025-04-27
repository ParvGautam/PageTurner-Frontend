import { useEffect, useRef, useState, Suspense } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import '../styles/3dBook.css' // Import the 3D book CSS
import '../styles/home.css' // Import home page custom styles
import Premium3DBookCard from '../components/Premium3DBookCard' // Import our new Premium 3D Book component
import ThreeJSBook from '../components/ThreeJSBook' // Import ThreeJSBook component
import defaultCover from '../assets/default-cover.png'
import LocomotiveScroll from 'locomotive-scroll'
import 'locomotive-scroll/dist/locomotive-scroll.css' // Add this import for locomotive scroll styles
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'

// Home page component
const Home = () => {
  const scrollRef = useRef(null)
  const scrollInstanceRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Make sure DOM is ready before initializing locomotive scroll
    const initScroll = () => {
      try {
        // Clean up any existing instances first
        if (scrollInstanceRef.current) {
          scrollInstanceRef.current.destroy();
        }
        
        // Reset any scroll classes that might have been added
        document.documentElement.classList.remove('has-scroll-smooth');
        document.body.classList.remove('has-scroll-smooth');
        
        scrollInstanceRef.current = new LocomotiveScroll({
          el: scrollRef.current,
          smooth: true,
          multiplier: 1.2, // Increased for faster scroll
          lerp: 0.05, // Lower for smoother but more responsive scroll
          smartphone: {
            smooth: true,
            multiplier: 1.5
          },
          tablet: {
            smooth: true,
            multiplier: 1.5
          },
          scrollFromAnywhere: true,
          getDirection: true,
          getSpeed: true
        })
      } catch (error) {
        console.error("Error initializing Locomotive Scroll:", error)
      }
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initScroll, 100)
    
    // Hack to force recalculation after page is fully loaded
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 200);
    });
    
    // Important cleanup function to prevent affecting other pages
    return () => {
      clearTimeout(timer);
      
      // Cleanup locomotive scroll instance
      if (scrollInstanceRef.current) {
        scrollInstanceRef.current.destroy();
        scrollInstanceRef.current = null;
      }
      
      // Remove locomotive scroll classes from document
      document.documentElement.classList.remove('has-scroll-smooth');
      document.documentElement.classList.remove('has-scroll-init');
      document.body.classList.remove('has-scroll-smooth');
      document.body.classList.remove('has-scroll-init');
      
      // Remove any inline styles added by locomotive
      const scrollElements = document.querySelectorAll('[data-scroll]');
      scrollElements.forEach(el => {
        el.style.transform = '';
        el.style.transition = '';
      });
    }
  }, [])
  
  const { user } = useAuth()
  
  // For staggered animations
  const [categories] = useState(['Fantasy', 'Romance', 'Mystery', 'Sci-Fi', 'Non-Fiction', 'Horror'])

  // Book animation variants for Framer Motion
  const bookContainerVariants = {
    hover: {
      rotateY: 15,
      z: 20,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  }
  
  const bookSpineVariants = {
    initial: { 
      boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.5)",
      filter: "brightness(1)"
    },
    hover: { 
      y: -10, 
      rotateZ: 0,
      boxShadow: "0px 15px 25px rgba(0, 0, 0, 0.5)",
      filter: "brightness(1.2)",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 15 
      } 
    }
  }
  
  // Letter animation variants
  const letterVariants = {
    initial: { 
      y: 0,
      textShadow: "0 4px 8px rgba(0, 0, 0, 0.3)" 
    },
    hover: { 
      y: -10, 
      scale: 1.1,
      textShadow: "0 10px 15px rgba(0, 0, 0, 0.4), 0 0 40px rgba(255, 255, 255, 0.3)",
      transition: { 
        type: "spring", 
        stiffness: 300,
        damping: 10
      } 
    }
  }
  
  // Dust particle effect when books are hovered
  const dustVariants = {
    initial: { opacity: 0, scale: 0 },
    hover: { 
      opacity: [0, 0.8, 0],
      scale: [0.2, 1, 0.5],
      x: [0, -20, -40],
      y: [0, -10, -30],
      transition: { 
        repeat: Infinity,
        repeatType: "mirror",
        duration: 2,
        ease: "easeOut" 
      }
    }
  }

  // Fetch all novels
  const { data: novels, isLoading: isLoadingAllNovels } = useQuery({
    queryKey: ['novels'],
    queryFn: async () => {
      const response = await api.get('/novels')
      return response.data
    }
  })

  // Fetch novels from authors the user is following
  const { data: followingNovels, isLoading: isLoadingFollowingNovels } = useQuery({
    queryKey: ['following-novels'],
    queryFn: async () => {
      if (!user) return []
      const response = await api.get('/user/following/novels')
      return response.data
    },
    enabled: !!user
  })

  return (
    <div ref={scrollRef} className="min-h-screen w-full overflow-x-hidden bg-black text-white" data-scroll-container>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-36"> {/* Increased padding at bottom */}
        {/* Book Logo Header */}
        <div className="book-logo-header" data-scroll data-scroll-speed="0.4">
          {/* Decorative book dots */}
          <div className="book-dot book-dot-blue"></div>
          <div className="book-dot book-dot-pink"></div>
          
          {/* First part of logo: BO */}
          <motion.div
            className="flex items-center"
            whileHover="hover"
            initial="initial"
          >
            {/* Book letter "B" */}
            <motion.span 
              className="book-letter" 
              style={{ marginRight: '10px' }}
              variants={letterVariants}
            >
              B
            </motion.span>
            
            {/* Book letter "O" */}
            <motion.span 
              className="book-letter"
              variants={letterVariants}
            >
              O
            </motion.span>
          </motion.div>
          
          {/* Center books */}
          <motion.div 
            className="relative mx-2 sm:mx-4 md:mx-6" 
            style={{ width: '180px', height: '200px' }}
            whileHover="hover"
            initial="initial"
            variants={bookContainerVariants}
          >
            {/* Book spines in the center */}
            <motion.div 
              className="book-spine book-spine-pink cursor-pointer" 
              style={{ width: '45px', left: '10%', top: '20px', transform: 'rotate(12deg)', originX: 0, originY: 1 }}
              variants={bookSpineVariants}
              whileTap={{ scale: 0.95 }}
            >
              Fiction
              <motion.div 
                className="absolute top-0 left-0 w-2 h-2 rounded-full bg-white opacity-0"
                variants={dustVariants}
              />
            </motion.div>
            
            <motion.div 
              className="book-spine book-spine-yellow cursor-pointer" 
              style={{ width: '40px', left: '25%', top: '10px', transform: 'rotate(-8deg)', originX: 0, originY: 1 }}
              variants={bookSpineVariants}
              whileTap={{ scale: 0.95 }}
            >
              Story
              <motion.div 
                className="absolute top-0 left-0 w-2 h-2 rounded-full bg-white opacity-0"
                variants={dustVariants}
              />
            </motion.div>
            
            <motion.div 
              className="book-spine book-spine-red cursor-pointer" 
              style={{ width: '50px', left: '40%', top: '25px', transform: 'rotate(10deg)', originX: 0, originY: 1 }}
              variants={bookSpineVariants}
              whileTap={{ scale: 0.95 }}
            >
              Life
              <motion.div 
                className="absolute top-0 left-0 w-2 h-2 rounded-full bg-white opacity-0"
                variants={dustVariants}
              />
            </motion.div>
            
            <motion.div 
              className="book-spine book-spine-blue cursor-pointer" 
              style={{ width: '35px', left: '60%', top: '40px', transform: 'rotate(-15deg)', originX: 0, originY: 1 }}
              variants={bookSpineVariants}
              whileTap={{ scale: 0.95 }}
            >
              Art
              <motion.div 
                className="absolute top-0 left-0 w-2 h-2 rounded-full bg-white opacity-0" 
                variants={dustVariants}
              />
            </motion.div>
            
            <motion.div 
              className="book-spine book-spine-purple cursor-pointer" 
              style={{ width: '42px', left: '75%', top: '15px', transform: 'rotate(5deg)', originX: 0, originY: 1 }}
              variants={bookSpineVariants}
              whileTap={{ scale: 0.95 }}
            >
              Tales
              <motion.div 
                className="absolute top-0 left-0 w-2 h-2 rounded-full bg-white opacity-0"
                variants={dustVariants}
              />
            </motion.div>
          </motion.div>
          
          {/* Last part of logo: OK */}
          <motion.div 
            className="flex items-center"
            whileHover="hover"
            initial="initial"
          >
            {/* Book letter "O" */}
            <motion.span 
              className="book-letter" 
              style={{ marginRight: '10px' }}
              variants={letterVariants}
            >
              O
            </motion.span>
            
            {/* Book letter "K" */}
            <motion.span 
              className="book-letter"
              variants={letterVariants}
            >
              K
            </motion.span>
          </motion.div>
        </div>
        
        {/* Premium Featured Books */}
        
        
        
        
        {/* High Rating Books */}
        <section id="high-rating-books" className="mb-20" data-scroll data-scroll-speed="0.4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white relative">
              High Rating Books
              <span className="absolute -bottom-2 left-0 w-16 h-1 bg-[#5199fc] rounded-full"></span>
            </h2>
          </div>
          
          <div className="mt-8">
            {isLoadingAllNovels ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5199fc]"></div>
              </div>
            ) : novels && novels.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12">
                {novels
                  .filter(novel => novel.rating >= 7.5)
                  .slice(0, 4)
                  .map((novel, i) => (
                    <div 
                      key={novel._id}
                      data-scroll 
                      data-scroll-speed={0.2 * ((i % 4) + 1)}
                      className="flex flex-col items-center"
                    >
                      <div className="relative">
                        <Suspense fallback={<div className="animate-pulse bg-gray-700 h-80 w-48 rounded-lg"></div>}>
                          <ThreeJSBook 
                            coverImage={novel.thumbnail || defaultCover}
                            title={novel.title}
                            onClick={() => navigate(`/novels/${novel._id}`)}
                            height={280}
                          />
                          <div className="absolute -top-2 -right-2 bg-[#5199fc] text-white text-sm font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                            {novel.rating.toFixed(1)}
                          </div>
                        </Suspense>
                      </div>
                      <div className="text-center mt-4 w-full">
                        <h3 className="text-base font-semibold text-white line-clamp-1 mb-1">{novel.title}</h3>
                        <p className="text-xs text-white/70">
                          by {typeof novel.author === 'string' ? novel.author : novel.author?.username || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-400">No high rated books available</p>
              </div>
            )}
            {novels && novels.filter(novel => novel.rating >= 7.5).length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-400">No books with rating above 7.5 available</p>
              </div>
            )}
          </div>
        </section>
        
        <div className="book-separator"></div>

        {/* Popular Books */}
        <section id="popular-books" className="mb-16" data-scroll data-scroll-speed="0.3">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white relative">
              Popular Books
              <span className="absolute -bottom-2 left-0 w-16 h-1 bg-[#5199fc] rounded-full"></span>
            </h2>
            <button 
              onClick={() => document.getElementById('featured-categories').scrollIntoView({ behavior: 'smooth' })}
              className="text-[#ff9868] hover:text-[#ff5068] text-sm font-medium flex items-center transition-colors"
            >
              View Categories
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {isLoadingAllNovels ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5199fc]"></div>
            </div>
          ) : novels && novels.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {novels.map((novel, i) => (
                <div data-scroll data-scroll-speed={0.1 * ((i % 5) + 1)} key={novel._id} className="flex flex-col items-center">
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
          ) : (
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 text-center border border-gray-700">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-white mb-2">No Books Found</h3>
                <p className="text-gray-400">Check back later for new additions!</p>
              </div>
            </div>
          )}
        </section>

        {/* Following Authors Section */}
        {user && (
          <section id="following-authors" className="mb-16" data-scroll data-scroll-speed="0.4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white relative">
                From Authors You Follow
                <span className="absolute -bottom-2 left-0 w-16 h-1 bg-[#ff9868] rounded-full"></span>
              </h2>
              <button 
                onClick={() => {
                  if (scrollInstanceRef.current) {
                    scrollInstanceRef.current.scrollTo(0);
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="text-[#5199fc] hover:text-[#afd7fb] text-sm font-medium flex items-center transition-colors"
              >
                Back to Top
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 rotate-270" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {isLoadingFollowingNovels ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff9868]"></div>
              </div>
            ) : followingNovels && followingNovels.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                {followingNovels.map((novel, i) => (
                  <div data-scroll data-scroll-speed={0.15 * ((i % 5) + 1)} key={novel._id} className="flex flex-col items-center">
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
            ) : (
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 text-center border border-[#ae8280]/30">
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-white mb-2">No Following Authors Yet</h3>
                  <p className="text-gray-400">Start following your favorite authors to see their latest books here!</p>
                </div>
              </div>
            )}
          </section>
        )}
        
        {/* Featured Categories Section */}
        <section id="featured-categories" className="mb-16" data-scroll data-scroll-speed="0.35">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white relative">
              Featured Categories
              <span className="absolute -bottom-2 left-0 w-16 h-1 bg-[#ff5068] rounded-full"></span>
            </h2>
            <button 
              onClick={() => {
                if (scrollInstanceRef.current) {
                  scrollInstanceRef.current.scrollTo(document.getElementById('popular-books'));
                } else {
                  document.getElementById('popular-books').scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-[#ff5068] hover:text-[#d93368] text-sm font-medium flex items-center transition-colors"
            >
              View Popular Books
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <div 
                key={category}
                className="relative overflow-hidden group rounded-xl cursor-pointer"
                data-scroll
                data-scroll-speed={0.15 * (index % 3 + 1)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80 z-10"></div>
                <div className="absolute inset-0 bg-[#d06061]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
                <div className="relative h-36 bg-gray-800 rounded-xl z-0"></div>
                <div className="absolute bottom-0 left-0 p-4 z-20">
                  <h3 className="text-xl font-bold text-white mb-1">{category}</h3>
                  <p className="text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Explore {category.toLowerCase()} books
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Footer spacer to ensure full scroll */}
        <div className="h-40 opacity-0" data-scroll data-scroll-speed="0.5"></div>
      </main>
    </div>
  )
}

export default Home

