import axios from 'axios'

// Create axios instance with base URL and credentials config
const api = axios.create({
  baseURL: 'https://pageturner-backend-2.onrender.com/api', // Point to the deployed backend
  withCredentials: true, // Set back to true as required by the backend
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout for requests
})

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    // More detailed error logging to help diagnose issues
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        withCredentials: error.config?.withCredentials
      })
    } else if (error.request) {
      console.error('API Error Request:', {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        withCredentials: error.config?.withCredentials
      })
      console.error('No response received from API')
    } else {
      console.error('API Error Message:', error.message)
    }
    return Promise.reject(error)
  }
)

// Add request interceptor to include auth token and prevent caching
api.interceptors.request.use(
  config => {
    // More detailed request logging
    console.log('API Request:', {
      method: config.method.toUpperCase(),
      url: config.url,
      withCredentials: config.withCredentials,
      baseURL: config.baseURL
    })
    
    // Get token from cookies - make sure this works correctly
    const token = document.cookie.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1]
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Token found in cookies, adding to headers')
    } else {
      console.log('No token found in cookies')
    }
    
    // Make sure withCredentials is always true, especially for auth requests
    config.withCredentials = true
    
    // Prevent caching for GET requests, especially for chapters
    if (config.method === 'get' && config.url.includes('/chapters/')) {
      config.headers = {
        ...config.headers,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
      // Add timestamp to query params to bust cache
      const separator = config.url.includes('?') ? '&' : '?';
      config.url = `${config.url}${separator}_t=${new Date().getTime()}`;
    }
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

export const authAPI = {
  signup: async (userData) => {
    try {
      console.log('Sending signup data:', {...userData, password: '***'}) // Log without password
      const response = await api.post('/auth/signup', userData, {
        withCredentials: true // Explicitly ensure credentials are sent
      })
      console.log('Signup response:', response.data)
      return response.data
    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message)
      throw error
    }
  },
  login: async (credentials) => {
    try {
      console.log('Sending login credentials:', {...credentials, password: '***'}) // Log without password
      const response = await api.post('/auth/login', credentials, {
        withCredentials: true // Explicitly ensure credentials are sent
      })
      console.log('Login response:', response.data)
      // Check if the response data has the expected user fields
      if (!response.data._id) {
        console.error('Login response is missing user ID:', response.data)
        throw new Error('Invalid login response from server')
      }
      return response.data
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message)
      throw error
    }
  },
  logout: async () => {
    try {
      const response = await api.post('/auth/logout', {}, {
        withCredentials: true // Explicitly ensure credentials are sent
      })
      return response.data
    } catch (error) {
      console.error('Logout error:', error.response?.data || error.message)
      throw error
    }
  },
  updateProfile: async (profileData) => {
    try {
      console.log('Sending profile data:', profileData)
      const response = await api.put('/auth/update-profile', profileData, {
        withCredentials: true // Explicitly ensure credentials are sent
      })
      console.log('Profile update response:', response.data)
      return response.data
    } catch (error) {
      console.error('Update profile error:', error.response?.data || error.message)
      throw error
    }
  }
}

export const userAPI = {
  // Since we don't have actual stats endpoint yet, we return dummy data
  getStats: async () => {
    return { followers: 0, following: 0 }
  }
}

export const chapterAPI = {
  getChapterForEditing: async (chapterId) => {
    try {
      console.log('Fetching chapter for editing, ID:', chapterId);
      
      // Make a direct API call with minimal headers
      const response = await axios({
        method: 'GET',
        url: `${api.defaults.baseURL}/chapters/chapter/${chapterId}`,
        params: {
          _t: new Date().getTime() // Single timestamp parameter
        },
        // Use only essential headers to avoid CORS preflight rejection
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      console.log('Chapter data for editing:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching chapter for editing:', error.message);
      if (error.response) {
        console.error('Server response:', {
          status: error.response.status,
          data: error.response.data
        });
      } else if (error.request) {
        console.error('No response received');
      }
      throw error;
    }
  },
  
  // Add method to fetch all chapters for a novel with enhanced error handling
  getChaptersForNovel: async (novelId) => {
    try {
      if (!novelId) {
        console.error('No novel ID provided to getChaptersForNovel');
        return [];
      }
      
      console.log('Fetching chapters for novel ID:', novelId);
      
      // Make a direct API call with minimal headers to avoid CORS preflight issues
      const response = await axios({
        method: 'GET',
        url: `${api.defaults.baseURL}/chapters/${novelId}`,
        params: {
          _t: new Date().getTime() // Single timestamp parameter
        },
        // Use only essential headers to avoid CORS preflight rejection
        headers: {
          'Content-Type': 'application/json'
          // Removed cache control headers that were causing CORS issues
        },
        withCredentials: true
      });
      
      console.log('Chapters data received:', response.data);
      
      // Ensure we always return an array even if the backend returns null/undefined
      if (!response.data) {
        console.warn('Backend returned empty data for chapters, returning empty array');
        return [];
      }
      
      // If the backend returns an object with a chapters array inside
      if (response.data.chapters && Array.isArray(response.data.chapters)) {
        console.log('Found chapters array in response data');
        return response.data.chapters;
      }
      
      // Ensure result is an array
      if (!Array.isArray(response.data)) {
        console.warn('Response is not an array, converting to array');
        return [response.data];
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching chapters for novel:', error.message);
      if (error.response) {
        console.error('Server response:', {
          status: error.response.status,
          data: error.response.data
        });
      } else if (error.request) {
        console.error('No response received. Request details:', {
          url: error.config?.url,
          method: error.config?.method
        });
      }
      
      // Return empty array instead of throwing, to prevent UI breakage
      console.log('Returning empty array due to error');
      return [];
    }
  }
}

export const libraryAPI = {
  addToLibrary: async (novelId) => {
    try {
      const response = await api.post('/library/add', { novelId }, { withCredentials: true })
      return response.data
    } catch (error) {
      console.error('Add to library error:', error.response?.data || error.message)
      throw error
    }
  },
  removeFromLibrary: async (novelId) => {
    try {
      const response = await api.post('/library/remove', { novelId }, { withCredentials: true })
      return response.data
    } catch (error) {
      console.error('Remove from library error:', error.response?.data || error.message)
      throw error
    }
  },
  checkInLibrary: async (novelId) => {
    try {
      const response = await api.get(`/library/check/${novelId}`, { withCredentials: true })
      return response.data
    } catch (error) {
      console.error('Check library error:', error.response?.data || error.message)
      throw error
    }
  },
  getUserLibrary: async () => {
    try {
      const response = await api.get('/library/user', { withCredentials: true })
      
      // Check the response structure before attempting to use array methods
      let formattedData = null;
      console.log('Raw library data received:', response.data);
      
      // Handle different response formats
      if (response.data) {
        // If response.data is already an array
        if (Array.isArray(response.data)) {
          formattedData = response.data;
          console.log('Library data is an array with length:', formattedData.length);
        } 
        // If response.data has a library property that is an array
        else if (response.data.library && Array.isArray(response.data.library)) {
          formattedData = response.data;
          console.log('Found library array in response.data.library with length:', response.data.library.length);
        }
        // If response.data is an object but not in the expected format
        else if (typeof response.data === 'object') {
          // Check if it might be a single library item
          if (response.data._id) {
            // Convert single item to array format
            formattedData = {
              library: [response.data]
            };
            console.log('Converted single library item to array format');
          } else {
            // Create a new format with empty library array
            formattedData = {
              library: []
            };
            console.log('Response data is not in expected format, created empty library array');
          }
        } else {
          // Fallback to an empty library array
          formattedData = {
            library: []
          };
          console.log('Unexpected data type in response, created empty library array');
        }
        
        // Log formatted data for debugging
        console.log('Formatted library data:', formattedData);
      } else {
        // Handle null/undefined response data
        formattedData = {
          library: []
        };
        console.log('No library data received, returning empty array');
      }
      
      return formattedData;
    } catch (error) {
      console.error('Get library error:', error.response?.data || error.message)
      throw error
    }
  }
}

export const novelAPI = {
  searchNovels: async (query) => {
    try {
      const response = await api.get(`/novels/search?q=${encodeURIComponent(query)}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.error('Error searching novels:', error);
      throw error;
    }
  },
  
  // Add method to fetch a novel by ID
  getNovelById: async (novelId) => {
    try {
      console.log('Fetching novel by ID:', novelId);
      // Make a direct API call with minimal headers
      const response = await axios({
        method: 'GET',
        url: `${api.defaults.baseURL}/novels/${novelId}`,
        params: {
          _t: new Date().getTime() // Single timestamp parameter
        },
        // Use only essential headers to avoid CORS preflight rejection
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      console.log('Novel data received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching novel by ID:', error.message);
      if (error.response) {
        console.error('Server response:', {
          status: error.response.status,
          data: error.response.data
        });
      } else if (error.request) {
        console.error('No response received');
      }
      throw error;
    }
  }
}

export const bookmarksAPI = {
  addBookmark: async (data) => {
    try {
      // Direct axios call to avoid CORS issues
      const response = await axios({
        method: 'POST',
        url: `${api.defaults.baseURL}/bookmarks/add`,
        data: data,
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  },
  
  removeBookmark: async (data) => {
    try {
      // Direct axios call to avoid CORS issues
      const response = await axios({
        method: 'POST',
        url: `${api.defaults.baseURL}/bookmarks/remove`,
        data: data,
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  },
  
  checkBookmark: async (novelId, chapterId) => {
    try {
      // Direct axios call to avoid CORS issues
      const response = await axios({
        method: 'GET',
        url: `${api.defaults.baseURL}/bookmarks/check/${novelId}/${chapterId}`,
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error checking bookmark:', error);
      return { isBookmarked: false };
    }
  }
}

export const annotationsAPI = {
  addAnnotation: async (data) => {
    try {
      // Direct axios call to avoid CORS issues
      const response = await axios({
        method: 'POST',
        url: `${api.defaults.baseURL}/annotations/add`,
        data: data,
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error adding annotation:', error);
      throw error;
    }
  },
  
  getAnnotations: async (chapterId) => {
    try {
      // Direct axios call to avoid CORS issues
      const response = await axios({
        method: 'GET',
        url: `${api.defaults.baseURL}/annotations/${chapterId}`,
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error getting annotations:', error);
      return [];
    }
  }
}

export default api