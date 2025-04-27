import axios from 'axios'

// Create axios instance with base URL and credentials config
const api = axios.create({
  baseURL: 'http://localhost:7000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Add request interceptor to log requests and prevent caching for GET requests
api.interceptors.request.use(
  config => {
    console.log('API Request:', config.method.toUpperCase(), config.url)
    
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
      const response = await api.post('/auth/signup', userData)
      return response.data
    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message)
      throw error
    }
  },
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      return response.data
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message)
      throw error
    }
  },
  logout: async () => {
    try {
      const response = await api.post('/auth/logout')
      return response.data
    } catch (error) {
      console.error('Logout error:', error.response?.data || error.message)
      throw error
    }
  },
  updateProfile: async (profileData) => {
    try {
      console.log('Sending profile data:', profileData)
      const response = await api.put('/auth/update-profile', profileData)
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
      return response.data
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