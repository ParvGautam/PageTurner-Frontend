/**
 * Utility functions for handling image URLs and loading
 */

/**
 * Checks if a URL is valid and returns a fallback if not
 * @param {string} url - The image URL to check
 * @param {string} fallback - The fallback image URL
 * @returns {string} - The original URL if valid, or the fallback
 */
export const getValidImageUrl = (url, fallback) => {
  // Return fallback for obvious invalid values
  if (!url || typeof url !== 'string') {
    console.log('Invalid image URL:', url);
    return fallback;
  }

  // Log original URL for debugging
  console.log('Processing image URL:', url);
  
  // If URL is relative and doesn't start with slash, add one
  if (!url.startsWith('http') && !url.startsWith('/') && !url.startsWith('data:')) {
    url = '/' + url;
    console.log('Fixed relative path by adding leading slash:', url);
  }
  
  // For URLs that point to our server, ensure they have the correct base URL
  if (url.includes('uploads') && !url.startsWith('http')) {
    // This assumes uploads are in a public directory on your server
    url = url.startsWith('/') ? url : '/' + url;
    console.log('Fixed uploads path:', url);
  }

  // Handle Cloudinary URLs
  if (url.includes('cloudinary.com') || url.includes('cloudinary') || url.includes('res.cloudinary')) {
    // Case 1: Missing protocol (//res.cloudinary.com/...)
    if (url.startsWith('//')) {
      url = 'https:' + url;
      console.log('Added https protocol to Cloudinary URL:', url);
    } 
    // Case 2: Missing protocol and double slash (res.cloudinary.com/...)
    else if (!url.startsWith('http') && !url.startsWith('/') && (url.startsWith('res.') || url.startsWith('cloudinary'))) {
      url = 'https://' + url;
      console.log('Added https:// to Cloudinary URL:', url);
    }
    // Case 3: Partial domain with no protocol
    else if (url.includes('cloudinary.com') && !url.startsWith('http')) {
      url = 'https:' + (url.startsWith('//') ? url : '//' + url);
      console.log('Fixed Cloudinary URL with https:', url);
    }

    console.log('Final Cloudinary URL:', url);
  }

  // Try to fix other common URL patterns
  if (!url.startsWith('http') && !url.startsWith('/') && !url.startsWith('data:') && url.includes('.')) {
    if (url.includes('.jpg') || url.includes('.png') || url.includes('.jpeg') || url.includes('.webp') || url.includes('.gif')) {
      console.log('Detected image file without proper URL prefix');
      // If it looks like an image filename, assume it's a relative path
      url = '/' + url;
      console.log('Added slash to image filename:', url);
    }
  }

  console.log('Final image URL:', url);
  return url;
};

/**
 * Creates a handler for image loading errors
 * @param {string} fallbackSrc - The fallback image source
 * @param {string} logPrefix - A prefix for the log message
 * @returns {Function} - An error handler function
 */
export const createImageErrorHandler = (fallbackSrc, logPrefix = 'Image') => {
  return (event) => {
    console.log(`${logPrefix} failed to load: ${event.target.src}`);
    event.target.onerror = null; // Prevent infinite loop
    event.target.src = fallbackSrc;
  };
};

/**
 * A component prop creator for image components
 * @param {string} src - The source URL
 * @param {string} fallbackSrc - The fallback image source
 * @param {string} alt - The alt text
 * @returns {Object} - Props for an image component
 */
export const createImageProps = (src, fallbackSrc, alt = '') => {
  return {
    src: getValidImageUrl(src, fallbackSrc),
    alt,
    onError: createImageErrorHandler(fallbackSrc)
  };
}; 