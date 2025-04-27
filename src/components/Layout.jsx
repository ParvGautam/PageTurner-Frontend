import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;
  const { isDarkMode } = useTheme();
  
  // Check if the current page is a chapter reading page or auth page
  const isChapterPage = path.includes('/chapters/') && !path.includes('/edit');
  const isAuthPage = path === '/login' || path === '/signup';
  
  // Ensure dark mode is applied to document body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('bg-black');
    } else {
      document.body.classList.remove('bg-black');
    }
  }, [isDarkMode]);
  
  // Don't use navbar for chapter reading pages and auth pages
  if (isChapterPage || isAuthPage) {
    return (
      <div id="main-container" className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-200">
        {children}
      </div>
    );
  }
  
  return (
    <div id="main-container" className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-200">
      <div className="sticky top-0 z-10">
        <Navbar />
      </div>
      <div className="p-4 container mx-auto max-w-7xl">
        {children}
      </div>
    </div>
  );
};

export default Layout; 