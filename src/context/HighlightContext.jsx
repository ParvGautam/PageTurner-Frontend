import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const HighlightContext = createContext();

export const HighlightProvider = ({ children }) => {
  const [highlights, setHighlights] = useState({});
  const { user } = useAuth();

  // Load highlights for the current user
  useEffect(() => {
    if (user) {
      loadHighlights();
    }
  }, [user]);

  // Load highlights from localStorage or API
  const loadHighlights = async () => {
    try {
      // First try to get from localStorage for faster loading
      const localHighlights = localStorage.getItem('userHighlights');
      if (localHighlights) {
        setHighlights(JSON.parse(localHighlights));
      }
      
      // Then fetch from API if user is logged in
      if (user) {
        const response = await api.get('/highlights');
        const apiHighlights = response.data.reduce((acc, highlight) => {
          if (!acc[highlight.chapterId]) {
            acc[highlight.chapterId] = [];
          }
          acc[highlight.chapterId].push({
            id: highlight._id,
            text: highlight.text,
            color: highlight.color,
            position: highlight.position
          });
          return acc;
        }, {});
        
        setHighlights(apiHighlights);
        localStorage.setItem('userHighlights', JSON.stringify(apiHighlights));
      }
    } catch (error) {
      console.error('Error loading highlights:', error);
      // Fallback to local storage if API fails
      const localHighlights = localStorage.getItem('userHighlights');
      if (localHighlights) {
        setHighlights(JSON.parse(localHighlights));
      }
    }
  };

  // Add a new highlight
  const addHighlight = async (chapterId, text, color = 'yellow', position = null) => {
    try {
      // Ensure color is valid or default to yellow
      const validColor = color || 'yellow';
      
      // Update state immediately for better UX
      const newHighlights = { ...highlights };
      if (!newHighlights[chapterId]) {
        newHighlights[chapterId] = [];
      }
      
      const highlightObj = {
        id: Date.now().toString(), // Temporary ID
        text,
        color: validColor, // Use the validated color
        position
      };
      
      newHighlights[chapterId].push(highlightObj);
      setHighlights(newHighlights);
      localStorage.setItem('userHighlights', JSON.stringify(newHighlights));
      
      // Save to API if user is logged in
      if (user) {
        const response = await api.post('/highlights/add', {
          chapterId,
          text,
          color: validColor, // Use the validated color
          position
        });
        
        // Update with the real ID from the server
        if (response.data._id) {
          highlightObj.id = response.data._id;
          localStorage.setItem('userHighlights', JSON.stringify(newHighlights));
        }
      }
      
      return highlightObj;
    } catch (error) {
      console.error('Error adding highlight:', error);
      return null;
    }
  };

  // Remove a highlight
  const removeHighlight = async (chapterId, highlightId) => {
    try {
      const newHighlights = { ...highlights };
      if (newHighlights[chapterId]) {
        newHighlights[chapterId] = newHighlights[chapterId].filter(
          h => h.id !== highlightId
        );
        setHighlights(newHighlights);
        localStorage.setItem('userHighlights', JSON.stringify(newHighlights));
      }
      
      // Remove from API if user is logged in
      if (user) {
        await api.post('/highlights/remove', {
          highlightId
        });
      }
    } catch (error) {
      console.error('Error removing highlight:', error);
    }
  };

  // Get highlights for a specific chapter
  const getChapterHighlights = (chapterId) => {
    return highlights[chapterId] || [];
  };

  return (
    <HighlightContext.Provider
      value={{
        highlights,
        addHighlight,
        removeHighlight,
        getChapterHighlights,
        loadHighlights
      }}
    >
      {children}
    </HighlightContext.Provider>
  );
};

export const useHighlights = () => useContext(HighlightContext);

export default HighlightContext; 