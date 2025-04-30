// App.jsx or AppRoutes.jsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import AddNovel from "./pages/AddNovel";
import AddChapter from "./pages/AddChapter";
import EditNovel from "./pages/EditNovel";
import EditChapter from "./pages/EditChapter";
import NovelDetail from "./pages/NovelDetail";
import ChapterDetail from "./pages/ChapterDetail";
import MyNovels from "./pages/MyNovels";
import Library from "./pages/Library";
import SearchResults from "./pages/SearchResults";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import { useAuth } from "./context/AuthContext";
import api from './services/api'

const App = () => {
  const { isAuthenticated, user, logout } = useAuth();

  // Check for invalid user state on app load and during runtime
  useEffect(() => {
    const validateUserState = () => {
      // If user exists but is missing critical fields, it might be corrupted
      if (user && (!user._id || !user.username)) {
        console.error('Invalid user state detected:', user)
        alert('Your session appears to be corrupted. You will be logged out.')
        logout()
      }
    }
    
    // Validate on mount
    validateUserState()
    
    // Setup API response interceptor to detect auth failures
    const interceptor = api.interceptors.response.use(
      response => response,
      error => {
        // If we get 401 Unauthorized errors consistently, logout the user
        if (error.response && error.response.status === 401) {
          console.error('Authentication error detected:', error)
          
          // Check localStorage to see if we have a user but getting auth errors
          const savedUser = localStorage.getItem('user')
          if (savedUser) {
            console.error('User exists in localStorage but API returns 401:', JSON.parse(savedUser))
            alert('Your session has expired. Please log in again.')
            logout()
          }
        }
        return Promise.reject(error)
      }
    )
    
    // Clean up
    return () => {
      api.interceptors.response.eject(interceptor)
    }
  }, [user, logout])

  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-novels"
          element={
            <ProtectedRoute>
              <MyNovels />
            </ProtectedRoute>
          }
        />
        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <Library />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-novel"
          element={
            <ProtectedRoute>
              <AddNovel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/novels/:novelId"
          element={
            <ProtectedRoute>
              <NovelDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/novels/:novelId/edit"
          element={
            <ProtectedRoute>
              <EditNovel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/novels/:novelId/add-chapter"
          element={
            <ProtectedRoute>
              <AddChapter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chapters/:chapterId"
          element={
            <ProtectedRoute>
              <ChapterDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/novels/:novelId/edit-chapter/:chapterId"
          element={
            <ProtectedRoute>
              <EditChapter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chapters/:chapterId/edit"
          element={
            <ProtectedRoute>
              <EditChapter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;
