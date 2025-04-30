import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import defaultAvatar from '../assets/default-avatar.jpg'
import Logo from './Logo'
import { useState, useEffect } from 'react'

const Sidebar = ({ onToggleCollapse }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Notify parent component when sidebar collapses
  useEffect(() => {
    if (onToggleCollapse) {
      onToggleCollapse(isCollapsed);
    }
  }, [isCollapsed, onToggleCollapse]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  }

  const isActive = (path) => {
    return location.pathname === path;
  }

  // Toggle sidebar collapse state
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  }

  return (
    <div className={`fixed top-0 left-0 h-screen ${isCollapsed ? 'w-16' : 'w-64'} bg-black text-white shadow-lg flex flex-col border-r border-gray-800 transition-all duration-300 z-10`}>
      <div className="p-4 flex flex-col h-full overflow-hidden">
        {/* Logo and collapse button */}
        <div className="flex items-center justify-between mb-8">
          {!isCollapsed && (
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Logo size="sm" className="hover:drop-shadow-md transition-shadow duration-300" />
              </div>
              <h1 className="text-xl font-bold text-amber-500 ml-2">PageTurner</h1>
            </div>
          )}
          
          <button 
            onClick={toggleCollapse}
            className="p-1 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            {isCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Navigation - with overflow */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-2">
            <li>
              <a 
                href="#" 
                className={`flex items-center rounded-lg py-2.5 px-3 ${isActive('/') ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-900 hover:text-white'} transition-colors duration-200`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                }}
              >
                <span className="inline-flex items-center justify-center h-6 w-6 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </span>
                {!isCollapsed && "Home"}
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={`flex items-center rounded-lg py-2.5 px-3 ${isActive('/my-novels') ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-900 hover:text-white'} transition-colors duration-200`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/my-novels');
                }}
              >
                <span className="inline-flex items-center justify-center h-6 w-6 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                </span>
                {!isCollapsed && "My Books"}
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={`flex items-center rounded-lg py-2.5 px-3 ${isActive('/library') ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-900 hover:text-white'} transition-colors duration-200`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/library');
                }}
              >
                <span className="inline-flex items-center justify-center h-6 w-6 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </span>
                {!isCollapsed && "My Library"}
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={`flex items-center rounded-lg py-2.5 px-3 ${isActive('/add-novel') ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-900 hover:text-white'} transition-colors duration-200`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/add-novel');
                }}
              >
                <span className="inline-flex items-center justify-center h-6 w-6 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </span>
                {!isCollapsed && "Add Novel"}
              </a>
            </li>
            <li>
              <a 
                href="#" 
                className={`flex items-center rounded-lg py-2.5 px-3 ${isActive('/profile') ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-gray-900 hover:text-white'} transition-colors duration-200`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/profile');
                }}
              >
                <span className="inline-flex items-center justify-center h-6 w-6 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </span>
                {!isCollapsed && "Profile"}
              </a>
            </li>
          </ul>
        </nav>
        
        {/* User section */}
        <div className="mt-auto pt-3 border-t border-gray-800">
          {isCollapsed ? (
            <div className="flex justify-center">
              <img 
                src={user?.profileImg || defaultAvatar} 
                alt="User" 
                className="w-8 h-8 rounded-full border border-gray-700"
              />
            </div>
          ) : (
            <div className="flex items-center p-2 rounded-lg hover:bg-gray-900 transition-colors duration-200">
              <img 
                src={user?.profileImg || defaultAvatar} 
                alt="User" 
                className="w-8 h-8 rounded-full border border-gray-700 mr-2"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.username}</p>
                <button 
                  onClick={handleLogout}
                  className="text-xs text-gray-400 hover:text-amber-500 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sidebar 