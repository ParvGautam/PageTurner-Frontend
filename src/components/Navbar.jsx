import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLogout } from '../hooks/useAuthHooks'
import { useTheme } from '../context/ThemeContext'
import defaultAvatar from '../assets/default-avatar.jpg'
import Logo from './Logo'

const Navbar = () => {
  const { user } = useAuth()
  const { mutate: logout, isPending } = useLogout()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { isDarkMode: _isDarkMode } = useTheme()

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleLogout = () => {
    logout()
    setIsDropdownOpen(false)
  }

  const isActive = (path) => {
    return location.pathname === path;
  }
  
  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchExpanded(false);
    }
  }

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded) {
      // Focus the search input when expanded
      setTimeout(() => {
        document.getElementById('mobile-search-input')?.focus();
      }, 100);
    }
  }

  return (
    <nav className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 shadow-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side navigation links */}
          <div className="flex items-center">
            <div className="hidden sm:flex sm:space-x-8">
              <Link 
                to="/" 
                className={`${isActive('/') ? 'text-[#5199fc] dark:text-[#afd7fb] border-b-2 border-[#5199fc] dark:border-[#afd7fb]' : 'text-gray-900 dark:text-white hover:text-[#5199fc] dark:hover:text-[#afd7fb]'} inline-flex items-center px-1 pt-1 text-sm font-medium`}
              >
                <span className="text-[#5199fc] dark:text-[#afd7fb]">Home</span>
              </Link>
              <Link 
                to="/my-novels" 
                className={`${isActive('/my-novels') ? 'text-[#ff9868] dark:text-[#ff9868] border-b-2 border-[#ff9868] dark:border-[#ff9868]' : 'text-gray-900 dark:text-white hover:text-[#ff9868] dark:hover:text-[#ff9868]'} inline-flex items-center px-1 pt-1 text-sm font-medium`}
              >
                <span className="text-[#ff9868] dark:text-[#ff9868]">My Books</span>
              </Link>
              <Link 
                to="/library" 
                className={`${isActive('/library') ? 'text-[#ff5068] dark:text-[#ff5068] border-b-2 border-[#ff5068] dark:border-[#ff5068]' : 'text-gray-900 dark:text-white hover:text-[#ff5068] dark:hover:text-[#ff5068]'} inline-flex items-center px-1 pt-1 text-sm font-medium`}
              >
                <span className="text-[#ff5068] dark:text-[#ff5068]">My Library</span>
              </Link>
            </div>
          </div>
          
          {/* Center logo */}
          <div className="flex items-center justify-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="flex-shrink-0 mr-2">
                <Logo size="md" className="hover:drop-shadow-md transition-shadow duration-300" />
              </div>
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-[#5199fc] via-[#ff9868] to-[#ff5068]">PageTurner</span>
            </Link>
          </div>
          
          {/* Right side elements */}
          <div className="flex items-center space-x-4">
            {/* Desktop Search */}
            <div className="relative hidden sm:block">
              <input 
                type="text" 
                placeholder="Search books..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyUp={handleSearch}
                className="pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5199fc] transition-colors"
              />
              <button 
                onClick={() => {
                  if (searchQuery.trim()) {
                    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchQuery('');
                  }
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#5199fc]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {/* Mobile Search Icon */}
            <button 
              onClick={toggleSearch}
              className="sm:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            {/* Profile Photo - Always visible */}
            <div className="relative">
              <button 
                onClick={toggleDropdown}
                className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-[#5199fc] transition duration-150 ease-in-out"
              >
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src={user?.profileImg || defaultAvatar}
                  alt="User avatar"
                />
              </button>
              
              {/* Profile dropdown - positioned absolutely in the corner */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden z-50">
                  {/* User info section */}
                  <div className="p-2 border-b border-gray-200 dark:border-gray-800 flex items-center space-x-2">
                    <img
                      className="h-6 w-6 rounded-full object-cover"
                      src={user?.profileImg || defaultAvatar}
                      alt="User avatar"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.username}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                  
                  {/* Navigation Links */}
                  <div className="py-1">
                    <Link
                      to="/"
                      className={`flex items-center px-3 py-1.5 text-sm ${
                        isActive('/') 
                          ? 'bg-[#5199fc]/10 text-[#5199fc] dark:bg-[#5199fc]/20 dark:text-[#afd7fb]' 
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                      Home
                    </Link>
                    
                    <Link
                      to="/my-novels"
                      className={`flex items-center px-3 py-1.5 text-sm ${
                        isActive('/my-novels') 
                          ? 'bg-[#ff9868]/10 text-[#ff9868] dark:bg-[#ff9868]/20 dark:text-[#ff9868]' 
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                      My Books
                    </Link>
                    
                    <Link
                      to="/library"
                      className={`flex items-center px-3 py-1.5 text-sm ${
                        isActive('/library') 
                          ? 'bg-[#ff5068]/10 text-[#ff5068] dark:bg-[#ff5068]/20 dark:text-[#ff5068]' 
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Library
                    </Link>
                    
                    <Link
                      to="/add-novel"
                      className={`flex items-center px-3 py-1.5 text-sm ${
                        isActive('/add-novel') 
                          ? 'bg-[#d06061]/10 text-[#d06061] dark:bg-[#d06061]/20 dark:text-[#d06061]' 
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Novel
                    </Link>
                    
                    <Link
                      to="/profile"
                      className={`flex items-center px-3 py-1.5 text-sm ${
                        isActive('/profile') 
                          ? 'bg-[#ae8280]/10 text-[#ae8280] dark:bg-[#ae8280]/20 dark:text-[#ae8280]' 
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Profile
                    </Link>
                  </div>
                  
                  {/* Logout */}
                  <div className="py-1 border-t border-gray-200 dark:border-gray-800">
                    <button
                      onClick={handleLogout}
                      disabled={isPending}
                      className="flex w-full items-center px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 3a1 1 0 00-1-1H7a1 1 0 00-1 1v1a1 1 0 001 1h6a1 1 0 001-1V6z" />
                      </svg>
                      {isPending ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Search Field - Appears when search icon is clicked */}
      {isSearchExpanded && (
        <div className="sm:hidden border-t border-gray-200 dark:border-gray-800 animate-slideDown p-2">
          <div className="relative">
            <input 
              id="mobile-search-input"
              type="text" 
              placeholder="Search books..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyUp={handleSearch}
              className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5199fc] transition-colors"
              autoFocus
            />
            <button 
              onClick={() => {
                if (searchQuery.trim()) {
                  navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchQuery('');
                  setIsSearchExpanded(false);
                }
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#5199fc]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar 