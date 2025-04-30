import axios from 'axios'

// Create axios instance with base URL and credentials config
const api = axios.create({
  baseURL: 'https://pageturner-backend-2.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
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
        headers: error.response.headers
      })
    } else if (error.request) {
      console.error('API Error Request:', error.request)
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
      withCredentials: config.withCredentials
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
        'Cache-Control': 'no-cache',
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
      const response = await api.post('/auth/signup', userData)
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
        withCredentials: true // Explicitly set for login requests
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
        withCredentials: true // Explicitly set for logout requests
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
        withCredentials: true // Explicitly set for profile updates
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
      // Use a direct request with cache-busting
      const timestamp = new Date().getTime();
      const response = await api.get(`/chapters/chapter/${chapterId}?_t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      console.log('Chapter data for editing:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching chapter for editing:', error.response?.data || error.message);
      throw error;
    }
  }
}

export const libraryAPI = {
  addToLibrary: async (novelId) => {
    try {
      const response = await api.post('/library/add', { novelId })
      return response.data
    } catch (error) {
      console.error('Add to library error:', error.response?.data || error.message)
      throw error
    }
  },
  removeFromLibrary: async (novelId) => {
    try {
      const response = await api.post('/library/remove', { novelId })
      return response.data
    } catch (error) {
      console.error('Remove from library error:', error.response?.data || error.message)
      throw error
    }
  },
  checkInLibrary: async (novelId) => {
    try {
      const response = await api.get(`/library/check/${novelId}`)
      return response.data
    } catch (error) {
      console.error('Check library error:', error.response?.data || error.message)
      throw error
    }
  },
  getUserLibrary: async () => {
    try {
      const response = await api.get('/library/user')
      
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
      const response = await api.get(`/novels/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching novels:', error);
      throw error;
    }
  }
}

export default api