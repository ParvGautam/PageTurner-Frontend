import { useCallback } from 'react';
import { useSmoothScroll } from '../context/SmoothScrollContext';

/**
 * Custom hook for smooth scrolling to elements on the page
 * @returns {Object} scrollToElement, scrollToTop, scrollToSection functions
 */
const useSmoothScrollTo = () => {
  const { scrollTo } = useSmoothScroll();

  // Scroll to a specific element by ID
  const scrollToElement = useCallback((elementId, options = {}) => {
    const element = document.getElementById(elementId);
    if (element) {
      scrollTo(element, {
        offset: 0,
        duration: 1.2,
        ...options,
      });
    }
  }, [scrollTo]);

  // Scroll to the top of the page
  const scrollToTop = useCallback((options = {}) => {
    scrollTo(0, {
      duration: 1.2,
      ...options,
    });
  }, [scrollTo]);

  // Scroll to a specific section by class name or selector
  const scrollToSection = useCallback((selector, options = {}) => {
    const element = document.querySelector(selector);
    if (element) {
      scrollTo(element, {
        offset: 0,
        duration: 1.2,
        ...options,
      });
    }
  }, [scrollTo]);

  return {
    scrollToElement,
    scrollToTop,
    scrollToSection,
  };
};

export default useSmoothScrollTo; 