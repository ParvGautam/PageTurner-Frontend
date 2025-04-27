import { useEffect, useRef } from 'react';
import { useSmoothScroll } from '../context/SmoothScrollContext';

/**
 * Hook to reveal elements when they are scrolled into view
 * @param {Object} options - Options for the reveal effect
 * @returns {Object} ref to attach to the element
 */
const useScrollReveal = (options = {}) => {
  const ref = useRef(null);
  const { lenis } = useSmoothScroll();
  
  const {
    threshold = 0.1,
    rootMargin = '0px',
    duration = 0.8,
    delay = 0,
    distance = '20px',
    origin = 'bottom',
    opacity = 0,
    scale = 1,
    easing = 'cubic-bezier(0.5, 0, 0, 1)',
    once = true,
  } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Store original styles to revert if needed
    const originalStyles = {
      transition: element.style.transition,
      transform: element.style.transform,
      opacity: element.style.opacity,
    };

    // Setup initial state - hidden
    element.style.opacity = opacity;
    
    let translateValue = '';
    if (origin === 'top') translateValue = `translateY(-${distance})`;
    else if (origin === 'bottom') translateValue = `translateY(${distance})`;
    else if (origin === 'left') translateValue = `translateX(-${distance})`;
    else if (origin === 'right') translateValue = `translateX(${distance})`;
    
    element.style.transform = `${translateValue} scale(${scale})`;
    element.style.transition = `opacity ${duration}s ${easing} ${delay}s, transform ${duration}s ${easing} ${delay}s`;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Element is in view - reveal it
            element.style.opacity = '1';
            element.style.transform = 'translateY(0) translateX(0) scale(1)';
            
            if (once) {
              observer.unobserve(element);
            }
          } else if (!once) {
            // Element is out of view - hide it again
            element.style.opacity = opacity;
            element.style.transform = translateValue;
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
        
        // Revert to original styles on unmount
        element.style.transition = originalStyles.transition;
        element.style.transform = originalStyles.transform;
        element.style.opacity = originalStyles.opacity;
      }
    };
  }, [lenis, threshold, rootMargin, duration, delay, distance, origin, opacity, scale, easing, once]);

  return ref;
};

export default useScrollReveal; 